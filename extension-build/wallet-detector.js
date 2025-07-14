// Wallet detection script - loaded as an external script
(function() {
  // Function to check wallet availability
  function checkWalletAvailability() {
    const walletStatus = {
      phantom: {
        detected: !!window.phantom?.solana?.isPhantom,
        windowPhantom: typeof window.phantom !== 'undefined',
        windowSolana: typeof window.solana !== 'undefined',
        isPhantom: window.phantom?.solana?.isPhantom || window.solana?.isPhantom || false
      },
      solflare: {
        detected: !!window.solflare,
        windowSolflare: typeof window.solflare !== 'undefined'
      }
    };
    
    // Dispatch event with wallet status
    document.dispatchEvent(new CustomEvent('walletAvailabilityChecked', {
      detail: walletStatus
    }));
    
    return walletStatus;
  }
  
  // Run check immediately
  checkWalletAvailability();
  
  // Also check after a short delay to handle async loading
  setTimeout(checkWalletAvailability, 1000);
})(); 