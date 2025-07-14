// Background script for the extension
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
  if (namespace === 'local' && changes.walletConnected) {
    if (changes.walletConnected.newValue === true) {
      // Wallet connected
      chrome.action.setBadgeText({ text: 'SOL' });
      chrome.action.setBadgeBackgroundColor({ color: '#14F195' });
    } else {
      // Wallet disconnected
      chrome.action.setBadgeText({ text: '' });
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
  
  // Save connection info
  chrome.storage.local.set({ 
    walletConnected: true,
    walletPublicKey: publicKey
  });
  
  // Set badge
  chrome.action.setBadgeText({ text: 'SOL' });
  chrome.action.setBadgeBackgroundColor({ color: '#14F195' });
  
  // Send response if callback provided
  if (sendResponse) {
    sendResponse({ status: 'success' });
  }
}

// Handle messages from content scripts and other extension pages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkWalletConnection') {
    // Check if wallet is connected
    chrome.storage.local.get(['walletConnected', 'walletPublicKey'], function(result) {
      sendResponse({
        connected: result.walletConnected || false,
        publicKey: result.walletPublicKey || null
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
}); 