const fs = require('fs');
const path = require('path');

console.log('Bundling extension files...');

// Create output directory
const outputDir = path.join(__dirname, 'extension-bundled');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy all files from extension-build to extension-bundled
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy all files except the ones we'll modify
copyDir(path.join(__dirname, 'extension-build'), outputDir);

// Read the LocalStorage utility
const localStorageContent = fs.readFileSync(
  path.join(__dirname, 'extension-build', 'utils', 'localStorage.js'),
  'utf8'
);

// Convert LocalStorage from ES module to regular JS
const localStorageConverted = localStorageContent
  .replace('export class LocalStorage', 'class LocalStorage');

// Create bundled background.js
const backgroundContent = fs.readFileSync(
  path.join(__dirname, 'extension-build', 'background.js'),
  'utf8'
);

const bundledBackground = `
// LocalStorage utility
${localStorageConverted}

// EventEmitter implementation (simplified)
class EventEmitter {
  constructor() {
    this._events = {};
  }
  
  on(event, listener) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
}

// Background script for the extension
const backgroundEventBroadcast = new EventEmitter();

chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed!');
  
  // Set a default badge text
  chrome.action.setBadgeText({ text: 'NEW' });
  chrome.action.setBadgeBackgroundColor({ color: '#9945FF' });
  
  // Clear the badge after 5 seconds
  setTimeout(function() {
    chrome.action.setBadgeText({ text: '' });
  }, 5000);
});

// Listen for changes to wallet connection state
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local' && (changes.walletConnected || changes.solanaAddress)) {
    if ((changes.walletConnected && changes.walletConnected.newValue === true) || 
        (changes.solanaAddress && changes.solanaAddress.newValue)) {
      // Wallet connected
      chrome.action.setBadgeText({ text: 'SOL' });
      chrome.action.setBadgeBackgroundColor({ color: '#14F195' });
    } else if ((changes.walletConnected && changes.walletConnected.newValue === false) ||
              (changes.solanaAddress && !changes.solanaAddress.newValue)) {
      // Wallet disconnected
      chrome.action.setBadgeText({ text: '' });
    }
  }
});

// Production URL for wallet connection (Railway deployment)
const PRODUCTION_URL = 'https://web-production-a2ab.up.railway.app/wallet-connect.html';

// Function to handle wallet connection
function handleWalletConnection(publicKey, sendResponse) {
  console.log('Wallet connected with public key:', publicKey);
  
  // Save connection info using LocalStorage utility
  LocalStorage.setSolanaAddress(publicKey);
  // Set default points
  LocalStorage.setPoint(15);
  
  // Set badge
  chrome.action.setBadgeText({ text: 'SOL' });
  chrome.action.setBadgeBackgroundColor({ color: '#14F195' });
  
  // Notify any open popup instances to refresh
  chrome.runtime.sendMessage({
    action: 'wallet_update',
    address: publicKey
  });
  
  // Send response if callback provided
  if (sendResponse) {
    sendResponse({ status: 'success' });
  }
}

// Handle messages from content scripts and other extension pages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request : ', request);
  console.log('Background script from Extension');
  
  if (request.solanaAddress) {
    console.log('Solana Address :', request.solanaAddress);
    LocalStorage.setSolanaAddress(request.solanaAddress);
  }
  
  switch (request.action) {
    case 'checkWalletConnection':
      // Check if wallet is connected
      LocalStorage.getSolanaAddress().then(address => {
        sendResponse({
          connected: !!address,
          publicKey: address
        });
      });
      return true; // Keep the message channel open for async response
    
    case 'walletConnected':
    case 'wallet_connected':
      // Wallet connected from the wallet-connect.html page
      console.log('Wallet connected:', request.publicKey || request.address);
      
      // Use either publicKey or address property
      const publicKey = request.publicKey || request.address;
      
      if (publicKey) {
        handleWalletConnection(publicKey, sendResponse);
      } else {
        console.error('No public key provided in wallet connection message');
        sendResponse({ status: 'error', message: 'No public key provided' });
      }
      return true;
    
    case 'openWalletConnect':
      // Always use the Railway production URL
      console.log('Using production URL:', PRODUCTION_URL);
      
      // Open wallet connect page in a new tab
      chrome.tabs.create({ url: PRODUCTION_URL }, function(tab) {
        console.log('Opened wallet connect page in tab:', tab.id);
      });
      
      sendResponse({ status: 'opening' });
      return true;
      
    case 'confirmApply':
      backgroundEventBroadcast.emit('done_apply');
      break;
      
    default:
      break;
  }
  
  // Return true for asynchronous responses
  return true;
});

// Listen for external wallet connection messages
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  console.log("external message is: ", msg);
  
  if (msg && msg.action === 'wallet_connected') {
    LocalStorage.setSolanaAddress(msg.address);
    // Set default points
    LocalStorage.setPoint(15);
    
    // Show notification to prompt user to open the extension popup
    chrome.notifications && chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.svg',
      title: 'Wallet Connected',
      message: 'Your wallet is now connected! Click the extension icon to see your points.'
    });
    
    sendResponse && sendResponse({ success: true });
  } else if (msg && msg.action === 'login') {
    LocalStorage.setToken(msg.token);
    LocalStorage.setSolanaAddress(msg.address);
    LocalStorage.setPoint(15);
    
    // Show notification
    chrome.notifications && chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.svg',
      title: 'Login Successful',
      message: 'You have successfully logged in!'
    });
    
    sendResponse && sendResponse({ success: true });
  }
});
`;

// Create bundled popup.js
const popupContent = fs.readFileSync(
  path.join(__dirname, 'extension-build', 'popup.js'),
  'utf8'
);

const bundledPopup = `
// LocalStorage utility
${localStorageConverted}

// Popup script
${popupContent
  .replace("import { LocalStorage } from './utils/localStorage.js';", '')
}
`;

// Create bundled debug-storage.js
const debugStorageContent = fs.readFileSync(
  path.join(__dirname, 'extension-build', 'debug-storage.js'),
  'utf8'
);

const bundledDebugStorage = `
// LocalStorage utility
${localStorageConverted}

// Debug storage script
${debugStorageContent
  .replace("import { LocalStorage } from './utils/localStorage.js';", '')
}
`;

// Update manifest.json to remove module type
const manifestPath = path.join(outputDir, 'manifest.json');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const updatedManifest = manifestContent
  .replace('"service_worker": "background.js",\n    "type": "module"', '"service_worker": "background.js"');

// Write bundled files
fs.writeFileSync(path.join(outputDir, 'background.js'), bundledBackground);
fs.writeFileSync(path.join(outputDir, 'popup.js'), bundledPopup);
fs.writeFileSync(path.join(outputDir, 'debug-storage.js'), bundledDebugStorage);
fs.writeFileSync(manifestPath, updatedManifest);

console.log('Extension bundled successfully!');
console.log('The bundled extension is available in the "extension-bundled" directory.');
console.log('\nTo load the extension in Chrome:');
console.log('1. Open Chrome and navigate to chrome://extensions/');
console.log('2. Enable "Developer mode" (toggle in the top right)');
console.log('3. Click "Load unpacked" and select the "extension-bundled" folder'); 