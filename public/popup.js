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
  
  // Function to update UI based on connection status
  function updateUI(isConnected, publicKey = null, points = 0) {
    if (isConnected && publicKey) {
      // Format the wallet address for display
      const formattedAddress = formatWalletAddress(publicKey);
      
      // Update wallet status
      walletStatus.textContent = 'Connected';
      walletStatus.classList.add('connected');
      
      // Update wallet address
      walletAddress.textContent = formattedAddress;
      walletAddress.style.display = 'block';
      
      // Show points if available
      if (points > 0) {
        const pointsElement = document.getElementById('wallet-points');
        if (pointsElement) {
          pointsElement.textContent = `${points} points`;
          pointsElement.style.display = 'block';
        } else {
          // Create points element if it doesn't exist
          const pointsElement = document.createElement('div');
          pointsElement.id = 'wallet-points';
          pointsElement.textContent = `${points} points`;
          pointsElement.style.color = '#14F195';
          pointsElement.style.marginTop = '5px';
          pointsElement.style.fontWeight = 'bold';
          walletAddress.parentNode.insertBefore(pointsElement, walletAddress.nextSibling);
        }
      }
      
      // Enable buttons
      connectWalletButton.textContent = 'Disconnect';
      actionButton.disabled = false;
      signMessageButton.disabled = false;
      
      // Store the public key in the adapter
      walletAdapter.publicKey = publicKey;
      walletAdapter.connected = true;
    } else {
      // Update wallet status
      walletStatus.textContent = 'Not Connected';
      walletStatus.classList.remove('connected');
      
      // Hide wallet address
      walletAddress.textContent = '';
      walletAddress.style.display = 'none';
      
      // Hide points
      const pointsElement = document.getElementById('wallet-points');
      if (pointsElement) {
        pointsElement.style.display = 'none';
      }
      
      // Update buttons
      connectWalletButton.textContent = 'Connect Wallet';
      actionButton.disabled = true;
      signMessageButton.disabled = true;
      
      // Clear the public key from the adapter
      walletAdapter.publicKey = null;
      walletAdapter.connected = false;
    }
  }

  // Function to check wallet connection
  function checkWalletConnection() {
    chrome.runtime.sendMessage({ action: 'checkWalletConnection' }, function(response) {
      if (response && response.connected) {
        updateUI(true, response.publicKey, response.points);
      } else {
        updateUI(false);
      }
    });
  }

  // Helper function to format wallet address
  function formatWalletAddress(address) {
    if (!address) return '';
    
    // If it's already shortened (like "abc...xyz"), return as is
    if (address.includes('...')) return address;
    
    // Otherwise, format it
    const start = address.substring(0, 4);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
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
          console.log('Wallet connected:', result.walletPublicKey);
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
  chrome.storage.local.get(['walletConnected', 'walletPublicKey', 'solanaAddress', 'userPoints'], function(result) {
    const walletAddress = result.walletPublicKey || result.solanaAddress;
    const points = result.userPoints || 0;
    
    if (result.walletConnected && walletAddress) {
      // Update UI with stored connection
      updateUI(true, walletAddress, points);
      
      // Try to reconnect if we have stored connection
      walletAdapter.connect()
        .then(({ publicKey }) => {
          updateUI(true, publicKey, points);
        })
        .catch((error) => {
          console.log('Could not reconnect to wallet, but keeping stored connection:', error);
          // We'll keep the stored connection and not clear it
          // This allows the user to see their address even if the wallet isn't currently available
        });
    } else {
      updateUI(false, null, points);
    }
  });
  
  // Check wallet connection on load
  checkWalletConnection();
  
  // Add development mode toggle (always visible for now)
  const isDevelopment = true; // Hardcoded to true instead of using process.env.NODE_ENV
  
  if (isDevelopment) {
    // Create environment toggles
    const footer = document.querySelector('.footer');
    
    if (footer) {
      // Create container for toggles
      const togglesContainer = document.createElement('div');
      togglesContainer.className = 'toggles-container';
      togglesContainer.style.display = 'flex';
      togglesContainer.style.flexDirection = 'column';
      togglesContainer.style.gap = '8px';
      togglesContainer.style.marginTop = '10px';
      togglesContainer.style.paddingTop = '10px';
      togglesContainer.style.borderTop = '1px dashed #ddd';
      
      // Check current environment settings
      chrome.storage.local.get(['useLocalDevelopment', 'useGitHubPages'], function(result) {
        const isLocalDev = result.useLocalDevelopment || false;
        const isGitHubPages = result.useGitHubPages || false;
        
        // Create local development toggle
        const devModeToggle = document.createElement('div');
        devModeToggle.className = 'toggle-item';
        devModeToggle.style.display = 'flex';
        devModeToggle.style.alignItems = 'center';
        
        devModeToggle.innerHTML = `
          <label class="switch">
            <input type="checkbox" id="devModeCheckbox" ${isLocalDev ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <span class="toggle-label">Local Development</span>
        `;
        
        // Create GitHub Pages toggle
        const githubPagesToggle = document.createElement('div');
        githubPagesToggle.className = 'toggle-item';
        githubPagesToggle.style.display = 'flex';
        githubPagesToggle.style.alignItems = 'center';
        
        githubPagesToggle.innerHTML = `
          <label class="switch">
            <input type="checkbox" id="githubPagesCheckbox" ${isGitHubPages ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <span class="toggle-label">GitHub Pages</span>
        `;
        
        // Create Railway production toggle
        const productionToggle = document.createElement('div');
        productionToggle.className = 'toggle-item';
        productionToggle.style.display = 'flex';
        productionToggle.style.alignItems = 'center';
        
        productionToggle.innerHTML = `
          <label class="switch">
            <input type="checkbox" id="productionCheckbox" ${!isLocalDev && !isGitHubPages ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <span class="toggle-label">Railway Production</span>
        `;
        
        // Add toggles to container
        togglesContainer.appendChild(devModeToggle);
        togglesContainer.appendChild(githubPagesToggle);
        togglesContainer.appendChild(productionToggle);
        
        // Add container to footer
        footer.appendChild(togglesContainer);
        
        // Add event listeners to the checkboxes
        const devModeCheckbox = document.getElementById('devModeCheckbox');
        const githubPagesCheckbox = document.getElementById('githubPagesCheckbox');
        const productionCheckbox = document.getElementById('productionCheckbox');
        
        if (devModeCheckbox) {
          devModeCheckbox.addEventListener('change', function() {
            chrome.runtime.sendMessage({ 
              action: 'toggleDevelopmentMode' 
            }, function(response) {
              console.log('Development mode toggled:', response);
              
              // Update other checkboxes
              if (response.useLocalDevelopment) {
                githubPagesCheckbox.checked = false;
                productionCheckbox.checked = false;
              } else {
                productionCheckbox.checked = true;
              }
            });
          });
        }
        
        if (githubPagesCheckbox) {
          githubPagesCheckbox.addEventListener('change', function() {
            chrome.runtime.sendMessage({ 
              action: 'toggleGitHubPages' 
            }, function(response) {
              console.log('GitHub Pages mode toggled:', response);
              
              // Update other checkboxes
              if (response.useGitHubPages) {
                devModeCheckbox.checked = false;
                productionCheckbox.checked = false;
              } else {
                productionCheckbox.checked = true;
              }
            });
          });
        }
        
        if (productionCheckbox) {
          productionCheckbox.addEventListener('change', function() {
            // If production is checked, uncheck others
            if (this.checked) {
              devModeCheckbox.checked = false;
              githubPagesCheckbox.checked = false;
              
              // Disable both local development and GitHub Pages
              chrome.storage.local.set({
                useLocalDevelopment: false,
                useGitHubPages: false
              }, function() {
                console.log('Production mode enabled');
              });
            } else {
              // If unchecking production, default to GitHub Pages
              githubPagesCheckbox.checked = true;
              chrome.runtime.sendMessage({ 
                action: 'toggleGitHubPages' 
              });
            }
          });
        }
      });
    }
  }
}); 