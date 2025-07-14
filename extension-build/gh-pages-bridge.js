// GitHub Pages to Extension Bridge
// This script helps pass wallet connection data from GitHub Pages to the extension

// Function to check for wallet connection in localStorage
function checkForWalletConnection() {
  try {
    const publicKey = localStorage.getItem('solanaWalletPublicKey');
    
    if (publicKey) {
      console.log('Found wallet public key in localStorage:', publicKey);
      
      // Clear the localStorage to prevent reusing the same key
      localStorage.removeItem('solanaWalletPublicKey');
      
      // Send the public key to the extension - only works in extension context
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
          action: 'walletConnected',
          publicKey: publicKey,
          source: 'github-pages'
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            return false;
          }
          console.log('Wallet connection data sent to extension:', response);
        });
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error checking for wallet connection:', error);
  }
  
  return false;
}

// Listen for window messages (alternative method)
function setupMessageListener() {
  window.addEventListener('message', function(event) {
    // We only accept messages from ourselves
    if (event.source !== window) return;
    
    if (event.data.type && event.data.type === 'WALLET_CONNECTED') {
      console.log('Received wallet connection via postMessage:', event.data);
      
      const publicKey = event.data.publicKey;
      
      if (publicKey && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
          action: 'walletConnected',
          publicKey: publicKey,
          source: 'window-message'
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error sending message from window event:', chrome.runtime.lastError);
          } else {
            console.log('Wallet connection data sent to extension from window event:', response);
          }
        });
      }
    }
  }, false);
}

// Only run this script in the extension context
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  // Set up the message listener
  setupMessageListener();
  
  // Check for wallet connection data when the script loads
  if (checkForWalletConnection()) {
    console.log('Successfully processed wallet connection from GitHub Pages');
  } else {
    console.log('No wallet connection data found from GitHub Pages');
  }

  // Set up polling to check for wallet connection data
  // This is needed because the GitHub Pages tab might still be open
  // when the user returns to the extension
  const pollInterval = setInterval(() => {
    if (checkForWalletConnection()) {
      console.log('Detected wallet connection from GitHub Pages during polling');
      clearInterval(pollInterval);
    }
  }, 1000); // Check every second

  // Stop polling after 60 seconds
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 60000);
} else {
  console.log('GitHub Pages bridge script loaded but not running (not in extension context)');
} 