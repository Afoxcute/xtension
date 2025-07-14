import { WalletDetectionResult } from '../types';

// Wallet detection script - loaded as an external script
(function() {
  // Function to check wallet availability
  function checkWalletAvailability(): WalletDetectionResult {
    const walletStatus: WalletDetectionResult = {
      phantom: {
        detected: !!(window.phantom?.solana?.isPhantom),
        provider: window.phantom?.solana
      },
      solflare: {
        detected: !!window.solflare,
        provider: window.solflare
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