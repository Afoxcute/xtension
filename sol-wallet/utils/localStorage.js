/**
 * Utility class for handling Chrome storage operations
 */
export class LocalStorage {
  /**
   * Set the Solana wallet address
   * @param {string} address - The Solana wallet address
   */
  static setSolanaAddress(address) {
    if (!address) return;
    chrome.storage.local.set({ 
      walletConnected: true,
      walletPublicKey: address,
      solanaAddress: address // Adding for compatibility with both naming conventions
    });
    console.log('Solana address stored:', address);
  }

  /**
   * Get the Solana wallet address
   * @returns {Promise<string|null>} The stored Solana address or null
   */
  static async getSolanaAddress() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['walletPublicKey', 'solanaAddress'], (result) => {
        // Try both naming conventions
        const address = result.walletPublicKey || result.solanaAddress || null;
        resolve(address);
      });
    });
  }

  /**
   * Check if a wallet is connected
   * @returns {Promise<boolean>} Whether a wallet is connected
   */
  static async isWalletConnected() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['walletConnected'], (result) => {
        resolve(!!result.walletConnected);
      });
    });
  }

  /**
   * Set user points
   * @param {number} points - The number of points
   */
  static setPoint(points) {
    if (typeof points !== 'number') return;
    chrome.storage.local.set({ userPoints: points });
    console.log('User points set:', points);
  }

  /**
   * Get user points
   * @returns {Promise<number>} The stored points or 0
   */
  static async getPoints() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userPoints'], (result) => {
        resolve(result.userPoints || 0);
      });
    });
  }

  /**
   * Set authentication token
   * @param {string} token - The authentication token
   */
  static setToken(token) {
    if (!token) return;
    chrome.storage.local.set({ authToken: token });
    console.log('Auth token stored');
  }

  /**
   * Get authentication token
   * @returns {Promise<string|null>} The stored token or null
   */
  static async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result) => {
        resolve(result.authToken || null);
      });
    });
  }

  /**
   * Clear all stored data
   */
  static clearAll() {
    chrome.storage.local.clear();
    console.log('All local storage cleared');
  }
} 