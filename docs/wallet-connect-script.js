// External script for wallet-connect.html
document.addEventListener('DOMContentLoaded', function() {
  const connectPhantomBtn = document.getElementById('connectPhantom');
  const connectSolflareBtn = document.getElementById('connectSolflare');
  const statusMessage = document.getElementById('statusMessage');
  const walletAddressDisplay = document.getElementById('walletAddress');
  
  // Check if wallets are available
  const phantomAvailable = window.phantom?.solana?.isPhantom || false;
  const solflareAvailable = window.solflare || false;
  
  // Disable buttons if wallet is not available
  if (!phantomAvailable) {
    connectPhantomBtn.disabled = true;
    connectPhantomBtn.textContent = 'Phantom Not Installed';
  }
  
  if (!solflareAvailable) {
    connectSolflareBtn.disabled = true;
    connectSolflareBtn.textContent = 'Solflare Not Installed';
  }
  
  // Function to show status message
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    statusMessage.className = isError ? 'status error' : 'status success';
  }
  
  // Function to connect wallet and send message back to extension
  async function connectWallet(provider) {
    try {
      // Connect to wallet
      const response = await provider.connect();
      const publicKey = response.publicKey.toString();
      
      // Display success message
      showStatus('Successfully connected!');
      walletAddressDisplay.textContent = publicKey;
      walletAddressDisplay.style.display = 'block';
      
      // Send message to extension
      // When hosted on GitHub Pages, we need to use a different approach
      // since chrome.runtime is only available in extension context
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // Running in extension context
        chrome.runtime.sendMessage({
          action: 'walletConnected',
          publicKey: publicKey
        }, function(response) {
          console.log('Message sent to extension:', response);
          
          // Close this tab after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        });
      } else {
        // Running on GitHub Pages
        // Store the public key in localStorage
        localStorage.setItem('solanaWalletPublicKey', publicKey);
        
        // Show a message to the user
        showStatus('Connected! You can close this tab and return to the extension.');
        
        // Add a button to close the tab
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close This Tab';
        closeButton.className = 'close-button';
        closeButton.addEventListener('click', () => window.close());
        document.querySelector('.container').appendChild(closeButton);
      }
      
      return publicKey;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showStatus(error.message || 'Failed to connect wallet', true);
      return null;
    }
  }
  
  // Connect Phantom button click handler
  connectPhantomBtn.addEventListener('click', async function() {
    // Preferred way to get Phantom provider
    const provider = window.phantom?.solana?.isPhantom ? window.phantom.solana : 
                    (window.solana?.isPhantom ? window.solana : null);
    
    if (provider) {
      connectPhantomBtn.disabled = true;
      connectPhantomBtn.textContent = 'Connecting...';
      await connectWallet(provider);
      connectPhantomBtn.disabled = false;
      connectPhantomBtn.textContent = 'Connect Phantom Wallet';
    } else {
      showStatus('Phantom wallet not found. Please install it first.', true);
    }
  });
  
  // Connect Solflare button click handler
  connectSolflareBtn.addEventListener('click', async function() {
    const provider = window.solflare;
    if (provider) {
      connectSolflareBtn.disabled = true;
      connectSolflareBtn.textContent = 'Connecting...';
      await connectWallet(provider);
      connectSolflareBtn.disabled = false;
      connectSolflareBtn.textContent = 'Connect Solflare Wallet';
    } else {
      showStatus('Solflare wallet not found. Please install it first.', true);
    }
  });
  
  // Check if we're on HTTPS or localhost
  const isSecureContext = window.isSecureContext;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isSecureContext && !isLocalhost) {
    showStatus('Warning: Phantom requires HTTPS or localhost for wallet connections. Wallet detection may fail.', true);
    document.querySelector('.wallet-buttons').style.opacity = '0.5';
  }
}); 