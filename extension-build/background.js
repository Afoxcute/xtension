// Background script for the extension
// Import removed: LocalStorage from localStorage.js

// Since import statements don't work directly in extension scripts, we'll need to include the code inline
// LocalStorage implementation
const LocalStorage = {
  setSolanaAddress(address) {
    if (!address) return;
    chrome.storage.local.set({ 
      walletConnected: true,
      walletPublicKey: address,
      solanaAddress: address // Adding for compatibility with both naming conventions
    });
    console.log('Solana address stored:', address);
  },
  
  setPoint(points) {
    if (typeof points !== 'number') return;
    chrome.storage.local.set({ userPoints: points });
    console.log('User points set:', points);
  },
  
  setToken(token) {
    if (!token) return;
    chrome.storage.local.set({ authToken: token });
    console.log('Auth token stored');
  }
};

// Event emitter for internal communication
const backgroundEventBroadcast = {
  listeners: {},
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }
};

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
  if (namespace === 'local') {
    if (changes.walletConnected) {
      if (changes.walletConnected.newValue === true) {
        // Wallet connected
        chrome.action.setBadgeText({ text: 'SOL' });
        chrome.action.setBadgeBackgroundColor({ color: '#14F195' });
      } else {
        // Wallet disconnected
        chrome.action.setBadgeText({ text: '' });
      }
    }
    
    // If points changed, update badge
    if (changes.userPoints) {
      const points = changes.userPoints.newValue;
      if (points && typeof points === 'number') {
        // Show points in badge if wallet is connected
        chrome.storage.local.get(['walletConnected'], function(result) {
          if (result.walletConnected) {
            chrome.action.setBadgeText({ text: points.toString() });
          }
        });
      }
    }
  }
});

// Production URL for wallet connection (Railway deployment)
const PRODUCTION_URL = 'https://solana-wallet-extension.up.railway.app/wallet-connect.html';

// GitHub Pages URL for wallet connection (fallback)
const GITHUB_PAGES_URL = 'https://hoepeyemi.github.io/xtension/wallet-connect.html';

// Local development URLs
const LOCAL_URLS = [
  'http://localhost:3000/wallet-connect.html',
  'https://localhost:8443/wallet-connect.html'
];

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
  
  // Send response if callback provided
  if (sendResponse) {
    sendResponse({ status: 'success' });
  }
  
  // Show notification
  chrome.notifications && chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.svg',
    title: 'Wallet Connected',
    message: 'Your wallet is now connected! Click the extension icon to see your points.'
  });
}

// Handle messages from content scripts and other extension pages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Background received message:', request);
  
  // Handle solanaAddress in request
  if (request.solanaAddress) {
    console.log('Solana Address received:', request.solanaAddress);
    LocalStorage.setSolanaAddress(request.solanaAddress);
  }
  
  if (request.action === 'checkWalletConnection') {
    // Check if wallet is connected
    chrome.storage.local.get(['walletConnected', 'walletPublicKey', 'solanaAddress', 'userPoints'], function(result) {
      sendResponse({
        connected: result.walletConnected || false,
        publicKey: result.walletPublicKey || result.solanaAddress || null,
        points: result.userPoints || 0
      });
    });
    return true; // Keep the message channel open for async response
  } 
  else if (request.action === 'walletConnected' || request.action === 'wallet_connected') {
    // Wallet connected from the wallet-connect.html page
    console.log('Wallet connected from external page:', request.publicKey || request.address);
    
    // Use either publicKey or address property
    const publicKey = request.publicKey || request.address;
    
    if (publicKey) {
      handleWalletConnection(publicKey, sendResponse);
    } else {
      console.error('No public key provided in wallet connection message');
      sendResponse({ status: 'error', message: 'No public key provided' });
    }
    
    return true;
  }
  else if (request.action === 'openWalletConnect') {
    // Determine which URL to use
    // In production, use the Railway URL
    // For development, you can set a flag in storage to use local URLs
    
    chrome.storage.local.get(['useLocalDevelopment', 'useGitHubPages'], function(result) {
      let url = PRODUCTION_URL; // Default to Railway production URL
      
      if (result.useLocalDevelopment) {
        // Use local development URL if the flag is set
        url = LOCAL_URLS[0]; // Use the first local URL
        console.log('Using local development URL:', url);
      } else if (result.useGitHubPages) {
        // Use GitHub Pages URL if the flag is set
        url = GITHUB_PAGES_URL;
        console.log('Using GitHub Pages URL:', url);
      } else {
        console.log('Using production URL:', url);
      }
      
      // Open wallet connect page in a new tab
      chrome.tabs.create({ url: url }, function(tab) {
        console.log('Opened wallet connect page in tab:', tab.id);
      });
    });
    
    sendResponse({ status: 'opening' });
    return true;
  }
  else if (request.action === 'toggleDevelopmentMode') {
    // Toggle between production and local development
    chrome.storage.local.get(['useLocalDevelopment'], function(result) {
      const newValue = !result.useLocalDevelopment;
      // If enabling local development, disable GitHub Pages
      if (newValue) {
        chrome.storage.local.set({ 
          useLocalDevelopment: newValue,
          useGitHubPages: false
        });
      } else {
        chrome.storage.local.set({ useLocalDevelopment: newValue });
      }
      
      sendResponse({ 
        status: 'success', 
        useLocalDevelopment: newValue,
        message: newValue ? 'Using local development URLs' : 'Using production URL'
      });
    });
    return true;
  }
  else if (request.action === 'toggleGitHubPages') {
    // Toggle between production and GitHub Pages
    chrome.storage.local.get(['useGitHubPages'], function(result) {
      const newValue = !result.useGitHubPages;
      // If enabling GitHub Pages, disable local development
      if (newValue) {
        chrome.storage.local.set({ 
          useGitHubPages: newValue,
          useLocalDevelopment: false
        });
      } else {
        chrome.storage.local.set({ useGitHubPages: newValue });
      }
      
      sendResponse({ 
        status: 'success', 
        useGitHubPages: newValue,
        message: newValue ? 'Using GitHub Pages URL' : 'Using production URL'
      });
    });
    return true;
  }
  // Handle additional actions from the guide
  else if (request.action === 'openQR') {
    // Create popup window for QR code
    createPopupWindow(
      '/amazon_checkout',
      336,
      620,
      {
        senderInfo: JSON.stringify(sender),
        signInfo: JSON.stringify(request.params)
      }
    );
    return true;
  }
  else if (request.action === 'applyGiftCard') {
    LocalStorage.setPoint(18);
    chrome.tabs.sendMessage(
      request.senderTabId,
      {
        requestOrigin: request.senderOrigin,
        action: 'applyGiftCard',
        data: request.data,
      },
      function (response) {
        if (response && response.action === 'confirmApply') {
          sendResponse({
            success: true,
          });
        }
      }
    );
    return true;
  }
  else if (request.action === 'placeOrder') {
    chrome.tabs.sendMessage(
      request.senderTabId,
      {
        action: 'placeOrder',
      },
      function (response) {
        if (response && response.action === 'confirmPlaceOrder') {
          sendResponse({
            success: true,
          });
        }
      }
    );
    return true;
  }
  else if (request.action === 'confirmApply') {
    backgroundEventBroadcast.emit('done_apply');
    return true;
  }
});

// Listen for external messages
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log("External request received:", request);
  
  if (request.action === "login") {
    LocalStorage.setToken(request.token);
    LocalStorage.setSolanaAddress(request.address);
    LocalStorage.setPoint(15);
    
    // Create popup window
    createPopupWindow(
      '/done',
      336,
      316,
      {
        senderInfo: JSON.stringify(sender),
        signInfo: JSON.stringify(request.params)
      }
    );
  }
  else if (request.action === 'wallet_connected') {
    // Store the wallet address
    LocalStorage.setSolanaAddress(request.address);
    
    // Show notification
    chrome.notifications && chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.svg',
      title: 'Wallet Connected',
      message: 'Your wallet is now connected! Click the extension icon to see your points.'
    });
    
    sendResponse && sendResponse({ success: true });
  }
  
  return true; // Keep the message channel open for async response
});

// Helper function for creating popup windows
function createPopupWindow(path, width, height, params = {}) {
  const urlParams = new URLSearchParams();
  
  // Add params to URL if provided
  if (params) {
    Object.keys(params).forEach(key => {
      urlParams.append(key, params[key]);
    });
  }
  
  const url = chrome.runtime.getURL(path) + (urlParams.toString() ? `?${urlParams.toString()}` : '');
  
  // Calculate position for center of screen
  const screenWidth = window.screen.availWidth;
  const screenHeight = window.screen.availHeight;
  const left = Math.round((screenWidth - width) / 2);
  const top = Math.round((screenHeight - height) / 2);
  
  chrome.windows.create({
    url: url,
    type: 'popup',
    width: width,
    height: height,
    left: left,
    top: top,
    focused: true
  }, (window) => {
    if (chrome.runtime.lastError) {
      console.error('Error creating popup:', chrome.runtime.lastError);
    } else {
      console.log('Popup window created:', window);
    }
  });
} 