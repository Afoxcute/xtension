// GitHub Pages to Extension Bridge
// This script helps pass wallet connection data from GitHub Pages to the extension

// Function to check for wallet connection in localStorage
function checkForWalletConnection() {
  const publicKey = localStorage.getItem('solanaWalletPublicKey');
  
  if (publicKey) {
    console.log('Found wallet public key in localStorage:', publicKey);
    
    // Clear the localStorage to prevent reusing the same key
    localStorage.removeItem('solanaWalletPublicKey');
    
    // Send the public key to the extension
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'walletConnected',
        publicKey: publicKey,
        source: 'github-pages'
      }, function(response) {
        console.log('Wallet connection data sent to extension:', response);
      });
    }
    
    return true;
  }
  
  return false;
}

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