/**
 * Creates a popup window
 * @param {string} path - The path to open in the popup
 * @param {number} width - The width of the popup
 * @param {number} height - The height of the popup
 * @param {Object} params - Additional parameters to pass to the popup
 * @returns {Promise<chrome.windows.Window>} The created window
 */
export function createPopupWindow(path, width, height, params = {}) {
  return new Promise((resolve, reject) => {
    const urlParams = new URLSearchParams();
    
    // Add params to URL if provided
    if (params) {
      Object.keys(params).forEach(key => {
        urlParams.append(key, params[key]);
      });
    }
    
    const url = chrome.runtime.getURL(path) + (urlParams.toString() ? `?${urlParams.toString()}` : '');
    
    // Calculate position for center of screen
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    const left = Math.round((screenWidth - width) / 2);
    const top = Math.round((screenHeight - height) / 2);
    
    chrome.windows.create({
      url: url,
      type: 'popup',
      width: width,
      height: height,
      left: left,
      top: top,
      focused: true
    }, (window) => {
      if (chrome.runtime.lastError) {
        console.error('Error creating popup:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('Popup window created:', window);
        resolve(window);
      }
    });
  });
} 