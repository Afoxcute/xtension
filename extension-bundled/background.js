
// LocalStorage utility
/**
 * Utility class for handling Chrome storage operations
 */
class LocalStorage {
  /**
   * Set the Solana wallet address
   * @param {string} address - The Solana wallet address
   */
  static setSolanaAddress(address) {
    if (!address) return;
    chrome.storage.local.set({ 
      walletConnected: true,
      walletPublicKey: address,
      solanaAddress: address // Adding for compatibility with both naming conventions
    });
    console.log('Solana address stored:', address);
  }

  /**
   * Get the Solana wallet address
   * @returns {Promise<string|null>} The stored Solana address or null
   */
  static async getSolanaAddress() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['walletPublicKey', 'solanaAddress'], (result) => {
        // Try both naming conventions
        const address = result.walletPublicKey || result.solanaAddress || null;
        resolve(address);
      });
    });
  }

  /**
   * Check if a wallet is connected
   * @returns {Promise<boolean>} Whether a wallet is connected
   */
  static async isWalletConnected() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['walletConnected'], (result) => {
        resolve(!!result.walletConnected);
      });
    });
  }

  /**
   * Set user points
   * @param {number} points - The number of points
   */
  static setPoint(points) {
    if (typeof points !== 'number') return;
    chrome.storage.local.set({ userPoints: points });
    console.log('User points set:', points);
  }

  /**
   * Get user points
   * @returns {Promise<number>} The stored points or 0
   */
  static async getPoints() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userPoints'], (result) => {
        resolve(result.userPoints || 0);
      });
    });
  }

  /**
   * Set authentication token
   * @param {string} token - The authentication token
   */
  static setToken(token) {
    if (!token) return;
    chrome.storage.local.set({ authToken: token });
    console.log('Auth token stored');
  }

  /**
   * Get authentication token
   * @returns {Promise<string|null>} The stored token or null
   */
  static async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result) => {
        resolve(result.authToken || null);
      });
    });
  }

  /**
   * Clear all stored data
   */
  static clearAll() {
    chrome.storage.local.clear();
    console.log('All local storage cleared');
  }
} 

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
