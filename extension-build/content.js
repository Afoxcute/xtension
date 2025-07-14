// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "performAction") {
    // Perform some action on the current page
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    const walletAddress = request.walletAddress || 'Not connected';
    
    // Display a notification on the page
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.backgroundColor = '#9945FF';
    notification.style.color = 'white';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.transition = 'opacity 0.5s';
    notification.style.display = 'flex';
    notification.style.flexDirection = 'column';
    notification.style.gap = '5px';
    
    // Create notification content
    const titleElement = document.createElement('div');
    titleElement.textContent = `Extension activated on: ${pageTitle}`;
    titleElement.style.fontWeight = 'bold';
    
    const walletElement = document.createElement('div');
    walletElement.style.fontSize = '12px';
    
    // If wallet is connected, show truncated address
    if (walletAddress && walletAddress !== 'Not connected') {
      const truncatedAddress = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
      walletElement.textContent = `Connected wallet: ${truncatedAddress}`;
    } else {
      walletElement.textContent = 'No wallet connected';
    }
    
    // Add elements to notification
    notification.appendChild(titleElement);
    notification.appendChild(walletElement);
    
    // Add the notification to the page
    document.body.appendChild(notification);
    
    // Remove the notification after 3 seconds
    setTimeout(function() {
      notification.style.opacity = '0';
      setTimeout(function() {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
    
    // Check if page has Solana dApp elements and inject wallet info
    injectWalletInfoToPage(walletAddress);
    
    // Send a response back to the popup
    sendResponse({status: 'success', message: 'Action performed successfully'});
  }
  return true; // Keep the message channel open for asynchronous responses
});

// Function to inject wallet information to Solana dApps on the page
function injectWalletInfoToPage(walletAddress) {
  if (!walletAddress) return;
  
  // Create a custom event that the page can listen for
  const walletEvent = new CustomEvent('solanaWalletInjection', {
    detail: {
      walletAddress: walletAddress,
      source: 'my-nextjs-extension'
    }
  });
  
  // Dispatch the event so the page can use it
  document.dispatchEvent(walletEvent);
  
  // Inject a script to handle wallet connections from the page
  const script = document.createElement('script');
  script.textContent = `
    // Listen for requests from the page to connect to our extension wallet
    window.addEventListener('connectSolanaWallet', function(event) {
      document.dispatchEvent(new CustomEvent('solanaWalletConnected', {
        detail: {
          walletAddress: '${walletAddress}',
          source: 'my-nextjs-extension'
        }
      }));
    });
  `;
  
  // Add the script to the page
  (document.head || document.documentElement).appendChild(script);
  script.remove(); // Remove after execution
} 