// Function to update UI based on wallet detection
function updateWalletUI(walletStatus) {
  // Ensure we have the connect button and error div
  const connectWalletButton = document.getElementById('connectWalletButton');
  const errorDiv = document.getElementById('error-message') || document.querySelector('.error-message');
  
  if (!connectWalletButton || !errorDiv) {
    console.error('Required UI elements not found');
    return;
  }
  
  const phantomDetected = walletStatus.phantom.detected;
  const solflareDetected = walletStatus.solflare.detected;
  
  if (phantomDetected || solflareDetected) {
    connectWalletButton.disabled = false;
    errorDiv.style.display = 'none';
    
    // Update button based on detected wallet
    if (phantomDetected) {
      connectWalletButton.textContent = 'Connect Phantom Wallet';
      connectWalletButton.classList.add('phantom-button');
      connectWalletButton.classList.remove('solflare-button');
    } else if (solflareDetected) {
      connectWalletButton.textContent = 'Connect Solflare Wallet';
      connectWalletButton.classList.add('solflare-button');
      connectWalletButton.classList.remove('phantom-button');
    }
  } else {
    connectWalletButton.disabled = true;
    
    // Show wallet installation instructions
    errorDiv.innerHTML = `
      <p>No Solana wallet detected. Please install one of these wallets:</p>
      <div class="wallet-links">
        <a href="https://phantom.app/" target="_blank" class="wallet-link phantom">
          Phantom Wallet
        </a>
        <a href="https://solflare.com/" target="_blank" class="wallet-link solflare">
          Solflare Wallet
        </a>
      </div>
      <p class="small-text">After installation, please reload this extension.</p>
    `;
    errorDiv.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Listen for wallet availability check results from external script
  document.addEventListener('walletAvailabilityChecked', function(event) {
    console.log('Wallet availability check results:', event.detail);
    
    // Update UI based on wallet detection
    if (event.detail && (event.detail.phantom.detected || event.detail.solflare.detected)) {
      updateWalletUI(event.detail);
    }
  });
  // DOM Elements
  const connectWalletButton = document.getElementById('connectWalletButton');
  const disconnectWalletButton = document.getElementById('disconnectWalletButton');
  const actionButton = document.getElementById('actionButton');
  const signMessageButton = document.getElementById('signMessageButton');
  const connectionStatus = document.getElementById('connection-status');
  const walletAddress = document.getElementById('wallet-address');
  const walletStatus = document.getElementById('wallet-status');
  
  // Create wallet adapter instance
  const walletAdapter = new SolanaWalletAdapter();
  
  // Check if wallet is already connected (from previous session)
  function checkWalletConnection() {
    // Ensure error div exists
    if (!document.getElementById('error-message')) {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'error-message';
      errorDiv.className = 'error-message';
      document.querySelector('.wallet-section').appendChild(errorDiv);
    }
    
    // We'll rely on the external wallet-detector.js script to check for wallet availability
    // This function now just ensures the error div exists
    console.log('Checking for stored wallet connection');
  }
  
  // Update UI based on connection state
  function updateUI(isConnected, publicKey = null) {
    if (isConnected && publicKey) {
      // Connected state
      connectionStatus.textContent = 'Connected';
      walletStatus.classList.add('connected');
      
      // Show wallet address with truncation
      const truncatedAddress = publicKey.slice(0, 4) + '...' + publicKey.slice(-4);
      walletAddress.textContent = truncatedAddress;
      walletAddress.title = publicKey; // Full address on hover
      
      // Update buttons
      connectWalletButton.style.display = 'none';
      disconnectWalletButton.style.display = 'block';
      actionButton.disabled = false;
      signMessageButton.style.display = 'block';
    } else {
      // Disconnected state
      connectionStatus.textContent = 'Not connected';
      walletStatus.classList.remove('connected');
      walletAddress.textContent = '';
      
      // Update buttons
      connectWalletButton.style.display = 'block';
      disconnectWalletButton.style.display = 'none';
      actionButton.disabled = true;
      signMessageButton.style.display = 'none';
    }
  }
  
  // Connect wallet button click handler
  connectWalletButton.addEventListener('click', function() {
    // Open wallet connect page in a new tab
    chrome.runtime.sendMessage({ action: 'openWalletConnect' }, function(response) {
      console.log('Opening wallet connect page:', response);
    });
    
    // Show message that we're opening a new tab
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = `
      <p>Opening wallet connection in a new tab...</p>
      <p class="small-text">If the tab doesn't open, please check your popup blocker settings.</p>
    `;
    errorDiv.style.display = 'block';
    
    // Listen for wallet connection updates
    const checkConnectionInterval = setInterval(() => {
      chrome.storage.local.get(['walletConnected', 'walletPublicKey'], function(result) {
        if (result.walletConnected && result.walletPublicKey) {
          clearInterval(checkConnectionInterval);
          updateUI(true, result.walletPublicKey);
          errorDiv.style.display = 'none';
        }
      });
    }, 1000); // Check every second
    
    // Stop checking after 60 seconds
    setTimeout(() => {
      clearInterval(checkConnectionInterval);
    }, 60000);
  });
  
  // Disconnect wallet button click handler
  disconnectWalletButton.addEventListener('click', async function() {
    try {
      await walletAdapter.disconnect();
      
      // Clear connection info from extension storage
      chrome.storage.local.remove(['walletConnected', 'walletPublicKey']);
      
      updateUI(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  });
  
  // Sign message button click handler
  signMessageButton.addEventListener('click', async function() {
    try {
      signMessageButton.disabled = true;
      signMessageButton.textContent = 'Signing...';
      
      const message = 'Hello from My NextJS App Extension!';
      const result = await walletAdapter.signMessage(message);
      
      console.log('Message signed:', result);
      
      // Show success message
      signMessageButton.textContent = 'Signed!';
      setTimeout(() => {
        signMessageButton.textContent = 'Sign Message';
        signMessageButton.disabled = false;
      }, 2000);
    } catch (error) {
      console.error('Failed to sign message:', error);
      signMessageButton.textContent = 'Failed';
      setTimeout(() => {
        signMessageButton.textContent = 'Sign Message';
        signMessageButton.disabled = false;
      }, 2000);
    }
  });
  
  // Action button click handler
  actionButton.addEventListener('click', function() {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      // Send a message to the content script with wallet info
      chrome.tabs.sendMessage(activeTab.id, {
        action: "performAction",
        walletAddress: walletAdapter.publicKey
      }, function(response) {
        if (response && response.status === 'success') {
          // Update the button text to show success
          actionButton.textContent = 'Action Completed!';
          
          // Reset the button text after 2 seconds
          setTimeout(function() {
            actionButton.textContent = 'Take Action';
          }, 2000);
        }
      });
    });
  });
  
  // Check for stored wallet connection
  chrome.storage.local.get(['walletConnected', 'walletPublicKey'], function(result) {
    if (result.walletConnected && result.walletPublicKey) {
      // Try to reconnect if we have stored connection
      walletAdapter.connect()
        .then(({ publicKey }) => {
          updateUI(true, publicKey);
        })
        .catch(() => {
          // If reconnection fails, clear stored data
          chrome.storage.local.remove(['walletConnected', 'walletPublicKey']);
          updateUI(false);
        });
    } else {
      updateUI(false);
    }
  });
  
  // Check wallet connection on load
  checkWalletConnection();
  
  // Add development mode toggle (only visible in development)
  const isDevelopment = process.env.NODE_ENV === 'development' || true; // Set to true for now
  
  if (isDevelopment) {
    // Create development mode toggle
    const footer = document.querySelector('.footer');
    
    if (footer) {
      const devModeToggle = document.createElement('div');
      devModeToggle.className = 'dev-mode-toggle';
      
      // Check current development mode setting
      chrome.storage.local.get(['useLocalDevelopment'], function(result) {
        const isLocalDev = result.useLocalDevelopment || false;
        
        devModeToggle.innerHTML = `
          <label class="switch">
            <input type="checkbox" id="devModeCheckbox" ${isLocalDev ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <span class="dev-mode-label">Local Development</span>
        `;
        
        footer.appendChild(devModeToggle);
        
        // Add event listener to the checkbox
        const checkbox = document.getElementById('devModeCheckbox');
        if (checkbox) {
          checkbox.addEventListener('change', function() {
            chrome.runtime.sendMessage({ 
              action: 'toggleDevelopmentMode' 
            }, function(response) {
              console.log('Development mode toggled:', response);
            });
          });
        }
      });
    }
  }
}); 