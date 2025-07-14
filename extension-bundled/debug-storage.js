
// LocalStorage utility
/**
 * Utility class for handling Chrome storage operations
 */
class LocalStorage {
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

// Debug storage script
// Import the LocalStorage utility


// Create HTML structure
document.body.innerHTML = `
<div class="container">
  <h2>Solana Wallet Extension Debug</h2>
  <div class="debug-section">
    <h3>Storage Information</h3>
    <div id="storage-info"></div>
    <div class="actions">
      <button id="refresh-btn">Refresh</button>
      <button id="clear-btn">Clear Storage</button>
      <button id="test-data-btn">Set Test Data</button>
    </div>
  </div>
</div>
`;

// Add styles
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  h2 {
    color: #333;
    margin-top: 0;
  }
  .debug-section {
    margin-bottom: 20px;
  }
  h3 {
    color: #555;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  th, td {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  th {
    background-color: #f9f9f9;
    font-weight: bold;
  }
  .actions {
    margin-top: 20px;
  }
  button {
    padding: 8px 16px;
    margin-right: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  #refresh-btn {
    background-color: #4CAF50;
    color: white;
  }
  #clear-btn {
    background-color: #f44336;
    color: white;
  }
  #test-data-btn {
    background-color: #2196F3;
    color: white;
  }
`;
document.head.appendChild(style);

// Function to display storage information
async function displayStorageInfo() {
  const storageInfo = document.getElementById('storage-info');
  
  // Create table
  const table = document.createElement('table');
  
  // Add header row
  const headerRow = document.createElement('tr');
  const keyHeader = document.createElement('th');
  keyHeader.textContent = 'Key';
  const valueHeader = document.createElement('th');
  valueHeader.textContent = 'Value';
  headerRow.appendChild(keyHeader);
  headerRow.appendChild(valueHeader);
  table.appendChild(headerRow);
  
  // Get data from LocalStorage utility
  const solanaAddress = await LocalStorage.getSolanaAddress();
  const points = await LocalStorage.getPoints();
  const token = await LocalStorage.getToken();
  const isConnected = await LocalStorage.isWalletConnected();
  
  // Add rows for each value
  addTableRow(table, 'Solana Address', solanaAddress || 'Not set');
  addTableRow(table, 'Points', points || '0');
  addTableRow(table, 'Auth Token', token || 'Not set');
  addTableRow(table, 'Wallet Connected', isConnected ? 'Yes' : 'No');
  
  // Also get raw Chrome storage for debugging
  chrome.storage.local.get(null, function(items) {
    // Add a separator
    const separatorRow = document.createElement('tr');
    const separatorCell = document.createElement('td');
    separatorCell.colSpan = 2;
    separatorCell.textContent = 'Raw Chrome Storage';
    separatorCell.style.backgroundColor = '#f9f9f9';
    separatorCell.style.fontWeight = 'bold';
    separatorRow.appendChild(separatorCell);
    table.appendChild(separatorRow);
    
    // Add rows for each storage item
    for (const key in items) {
      addTableRow(table, key, JSON.stringify(items[key]));
    }
    
    // Clear previous content and add table
    storageInfo.innerHTML = '';
    storageInfo.appendChild(table);
  });
}

// Helper function to add a row to the table
function addTableRow(table, key, value) {
  const row = document.createElement('tr');
  
  const keyCell = document.createElement('td');
  keyCell.textContent = key;
  
  const valueCell = document.createElement('td');
  valueCell.textContent = value;
  valueCell.style.wordBreak = 'break-all';
  
  row.appendChild(keyCell);
  row.appendChild(valueCell);
  table.appendChild(row);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Display initial storage info
  displayStorageInfo();
  
  // Set up button event listeners
  document.getElementById('refresh-btn').addEventListener('click', displayStorageInfo);
  
  document.getElementById('clear-btn').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all storage?')) {
      LocalStorage.clearAll();
      setTimeout(displayStorageInfo, 100); // Refresh after a short delay
    }
  });
  
  document.getElementById('test-data-btn').addEventListener('click', function() {
    // Set test data
    LocalStorage.setSolanaAddress('TEST_SOLANA_ADDRESS_123456789');
    LocalStorage.setPoint(25);
    LocalStorage.setToken('TEST_AUTH_TOKEN');
    
    // Refresh the display
    setTimeout(displayStorageInfo, 100);
  });
}); 
