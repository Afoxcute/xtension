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
      // Connect to wallet using Phantom's recommended approach
      const response = await provider.connect();
      const publicKey = response.publicKey.toString();
      
      // Display success message
      showStatus('Successfully connected!');
      walletAddressDisplay.textContent = publicKey;
      walletAddressDisplay.style.display = 'block';
      
      // Try to directly communicate with the extension if possible
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          // We're in the extension context
          chrome.runtime.sendMessage({
            action: 'walletConnected',
            publicKey: publicKey
          }, function(response) {
            if (chrome.runtime.lastError) {
              console.error('Error sending message to extension:', chrome.runtime.lastError);
              // Fall back to localStorage
              localStorage.setItem('solanaWalletPublicKey', publicKey);
            } else {
              console.log('Message sent directly to extension:', response);
              
              // Close this tab after a short delay
              setTimeout(() => {
                window.close();
              }, 2000);
            }
          });
        } catch (err) {
          console.error('Failed to send message directly to extension:', err);
          // Fall back to localStorage
          localStorage.setItem('solanaWalletPublicKey', publicKey);
        }
      } else {
        // We're on GitHub Pages - use localStorage
        console.log('Using localStorage to pass wallet address to extension');
        localStorage.setItem('solanaWalletPublicKey', publicKey);
        
        // Also try the wallet_connected message format from the guide
        try {
          window.postMessage({
            type: 'WALLET_CONNECTED',
            publicKey: publicKey
          }, '*');
        } catch (err) {
          console.error('Error posting message:', err);
        }
      }
      
      // Show a message to the user
      showStatus('Connected! You can close this tab and return to the extension.');
      
      // Add a button to close the tab
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close This Tab';
      closeButton.style.padding = '10px 20px';
      closeButton.style.marginTop = '20px';
      closeButton.style.backgroundColor = '#0070f3';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '4px';
      closeButton.style.cursor = 'pointer';
      closeButton.addEventListener('click', () => window.close());
      document.querySelector('.container').appendChild(closeButton);
      
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
    const provider = window.phantom?.solana;
    
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
  
  // Set up event listeners for wallet account changes
  if (phantomAvailable) {
    window.phantom.solana.on('accountChanged', (publicKey) => {
      if (publicKey) {
        console.log(`Switched to account ${publicKey.toBase58()}`);
        // Update the display with the new public key
        walletAddressDisplay.textContent = publicKey.toBase58();
        walletAddressDisplay.style.display = 'block';
        // Update localStorage
        localStorage.setItem('solanaWalletPublicKey', publicKey.toBase58());
      } else {
        // Handle case where user switched to an account that hasn't connected to this app
        console.log('Switched to an account that is not connected to this app');
      }
    });
  }
}); 