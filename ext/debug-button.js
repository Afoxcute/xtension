// Debug button event listener
document.addEventListener('DOMContentLoaded', function() {
  const debugButton = document.getElementById('debugButton');
  if (debugButton) {
    debugButton.addEventListener('click', function() {
      if (window.debugTools) {
        window.debugTools.checkChromeStorage();
      } else {
        console.error('Debug tools not available');
      }
    });
    console.log('Debug button event listener attached');
  } else {
    console.error('Debug button not found');
  }
}); 