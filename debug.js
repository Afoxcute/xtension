// Debug script to check Chrome extension storage
console.log('Debug script loaded');

// Function to check Chrome storage
function checkChromeStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(null, function(items) {
      console.log('Chrome storage contents:', items);
      
      // Display in the DOM if we're in a page context
      if (document.body) {
        const debugDiv = document.createElement('div');
        debugDiv.id = 'debug-info';
        debugDiv.style.position = 'fixed';
        debugDiv.style.bottom = '10px';
        debugDiv.style.right = '10px';
        debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        debugDiv.style.color = 'white';
        debugDiv.style.padding = '10px';
        debugDiv.style.borderRadius = '5px';
        debugDiv.style.zIndex = '9999';
        debugDiv.style.maxWidth = '300px';
        debugDiv.style.maxHeight = '200px';
        debugDiv.style.overflow = 'auto';
        debugDiv.style.fontSize = '12px';
        debugDiv.style.fontFamily = 'monospace';
        
        let html = '<h3>Debug Info</h3>';
        html += '<p>Chrome Storage:</p>';
        html += '<ul>';
        
        for (const key in items) {
          html += `<li><strong>${key}:</strong> ${JSON.stringify(items[key])}</li>`;
        }
        
        html += '</ul>';
        
        debugDiv.innerHTML = html;
        document.body.appendChild(debugDiv);
      }
    });
  } else {
    console.error('Chrome storage API not available');
  }
}

// Check storage when the script loads
checkChromeStorage();

// Export for use in other scripts
window.debugTools = {
  checkChromeStorage: checkChromeStorage
}; 