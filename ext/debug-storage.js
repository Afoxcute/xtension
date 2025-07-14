// Debug script to check wallet storage
document.addEventListener('DOMContentLoaded', function() {
  const debugButton = document.getElementById('debug-button');
  
  if (debugButton) {
    debugButton.addEventListener('click', function() {
      // Create or get the debug container
      let debugContainer = document.getElementById('debug-container');
      
      if (!debugContainer) {
        debugContainer = document.createElement('div');
        debugContainer.id = 'debug-container';
        debugContainer.style.padding = '10px';
        debugContainer.style.marginTop = '20px';
        debugContainer.style.backgroundColor = '#f0f0f0';
        debugContainer.style.borderRadius = '5px';
        debugContainer.style.fontSize = '12px';
        debugContainer.style.maxHeight = '200px';
        debugContainer.style.overflowY = 'auto';
        
        // Add to the page
        document.querySelector('.container').appendChild(debugContainer);
      }
      
      // Clear previous content
      debugContainer.innerHTML = '<h3>Debug Information</h3>';
      
      // Check Chrome storage
      chrome.storage.local.get(null, function(items) {
        const storageInfo = document.createElement('div');
        storageInfo.innerHTML = '<h4>Chrome Storage:</h4>';
        
        // Create a table for storage items
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Add header row
        const headerRow = document.createElement('tr');
        const keyHeader = document.createElement('th');
        keyHeader.textContent = 'Key';
        keyHeader.style.textAlign = 'left';
        keyHeader.style.padding = '5px';
        keyHeader.style.borderBottom = '1px solid #ddd';
        
        const valueHeader = document.createElement('th');
        valueHeader.textContent = 'Value';
        valueHeader.style.textAlign = 'left';
        valueHeader.style.padding = '5px';
        valueHeader.style.borderBottom = '1px solid #ddd';
        
        headerRow.appendChild(keyHeader);
        headerRow.appendChild(valueHeader);
        table.appendChild(headerRow);
        
        // Add rows for each storage item
        for (const key in items) {
          const row = document.createElement('tr');
          
          const keyCell = document.createElement('td');
          keyCell.textContent = key;
          keyCell.style.padding = '5px';
          keyCell.style.borderBottom = '1px solid #ddd';
          
          const valueCell = document.createElement('td');
          valueCell.textContent = JSON.stringify(items[key]);
          valueCell.style.padding = '5px';
          valueCell.style.borderBottom = '1px solid #ddd';
          valueCell.style.wordBreak = 'break-all';
          
          row.appendChild(keyCell);
          row.appendChild(valueCell);
          table.appendChild(row);
        }
        
        storageInfo.appendChild(table);
        debugContainer.appendChild(storageInfo);
        
        // Add actions
        const actionsDiv = document.createElement('div');
        actionsDiv.style.marginTop = '10px';
        
        // Clear storage button
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear Storage';
        clearButton.style.marginRight = '10px';
        clearButton.style.padding = '5px 10px';
        clearButton.style.backgroundColor = '#ff4444';
        clearButton.style.color = 'white';
        clearButton.style.border = 'none';
        clearButton.style.borderRadius = '3px';
        clearButton.style.cursor = 'pointer';
        
        clearButton.addEventListener('click', function() {
          chrome.storage.local.clear(function() {
            alert('Storage cleared!');
            // Refresh debug info
            debugButton.click();
          });
        });
        
        // Set test data button
        const testDataButton = document.createElement('button');
        testDataButton.textContent = 'Set Test Data';
        testDataButton.style.padding = '5px 10px';
        testDataButton.style.backgroundColor = '#4444ff';
        testDataButton.style.color = 'white';
        testDataButton.style.border = 'none';
        testDataButton.style.borderRadius = '3px';
        testDataButton.style.cursor = 'pointer';
        
        testDataButton.addEventListener('click', function() {
          chrome.storage.local.set({
            walletConnected: true,
            walletPublicKey: 'TEST_PUBLIC_KEY',
            solanaAddress: 'TEST_PUBLIC_KEY',
            userPoints: 25
          }, function() {
            alert('Test data set!');
            // Refresh debug info
            debugButton.click();
          });
        });
        
        actionsDiv.appendChild(clearButton);
        actionsDiv.appendChild(testDataButton);
        debugContainer.appendChild(actionsDiv);
      });
    });
  }
}); 