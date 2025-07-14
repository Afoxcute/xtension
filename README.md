# My NextJS App with Browser Extension and Solana Wallet Support

This project is a Next.js application that has been converted into a browser extension with Solana wallet integration.

## Project Structure

- `src/`: Next.js application source code
- `public/`: Static assets and browser extension files
- `extension-build/`: The built browser extension ready for loading into browsers

## Development

### Next.js App

To run the Next.js application:

```bash
npm run dev
```

To build the Next.js application:

```bash
npm run build
```

### Browser Extension

The browser extension files are located in the `public/` directory:

- `manifest.json`: Extension manifest file
- `index.html`: Popup HTML
- `popup.css`: Popup styles
- `popup.js`: Popup functionality
- `content.js`: Content script that runs on web pages
- `background.js`: Background script for extension functionality
- `solana-wallet.js`: Solana wallet adapter implementation
- `icons/`: Extension icons

To build the browser extension:

1. Make any changes to the extension files in the `public/` directory
2. Run the following command to copy the files to the `extension-build/` directory:

```bash
# On Windows PowerShell
mkdir -Force extension-build
mkdir -Force extension-build\icons
Copy-Item -Path "public\manifest.json" -Destination "extension-build\"
Copy-Item -Path "public\index.html" -Destination "extension-build\"
Copy-Item -Path "public\popup.css" -Destination "extension-build\"
Copy-Item -Path "public\popup.js" -Destination "extension-build\"
Copy-Item -Path "public\content.js" -Destination "extension-build\"
Copy-Item -Path "public\background.js" -Destination "extension-build\"
Copy-Item -Path "public\icons\*.svg" -Destination "extension-build\icons\"
Copy-Item -Path "public\*.svg" -Destination "extension-build\"
```

## Installation Instructions

### Chrome / Edge / Brave / Opera

1. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Opera: `opera://extensions/`

2. Enable "Developer mode" (usually a toggle in the top right)

3. Click "Load unpacked" and select the `extension-build` folder

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`

2. Click "Load Temporary Add-on..." and select any file in the `extension-build` folder

## Usage

### Solana Wallet Connection

1. Click on the extension icon in your browser toolbar to open the popup

2. Click the "Connect Solana Wallet" button to connect to your Phantom or Solflare wallet
   - Note: You must have either Phantom or Solflare browser extension installed

3. Once connected, your wallet address will be displayed and the "Take Action" and "Sign Message" buttons will be enabled

4. You can disconnect your wallet by clicking the "Disconnect" button

### Extension Actions

1. Click the "Take Action" button to interact with the current web page
   - This will display a notification on the page with your wallet address

2. Click the "Sign Message" button to sign a message using your Solana wallet
   - This will prompt your wallet to sign a message

### Requirements

- Phantom or Solflare wallet extension must be installed in your browser to use the Solana wallet features

## Troubleshooting

### HTTPS Requirement for Wallet Connection

Phantom wallet requires a secure context (HTTPS or localhost) to connect. When using the extension:

1. The extension popup itself runs in a special extension context that is considered secure
2. When opening the wallet-connect.html page in a new tab, it needs to be served over HTTPS or localhost

#### GitHub Pages Deployment (Recommended)

The easiest way to meet the HTTPS requirement is to deploy the wallet connection page to GitHub Pages:

1. Run the GitHub Pages deployment script:
   ```bash
   node deploy-to-gh-pages.js
   ```

2. Commit and push the `docs` directory to your GitHub repository

3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Set the source to "Deploy from a branch"
   - Select "main" branch and "/docs" folder
   - Click "Save"

4. Update the `GITHUB_PAGES_URL` constant in `background.js` with your GitHub Pages URL:
   ```javascript
   const GITHUB_PAGES_URL = 'https://YOUR_USERNAME.github.io/my-nextjs-app/wallet-connect.html';
   ```

5. Rebuild the extension and reload it in your browser

#### Local Development (Alternative)

For local development and testing, you can:
- Use the extension as is (the popup should work)
- Use the included HTTPS server for testing the wallet connection page:

```bash
# Install mkcert to create self-signed certificates
npm install -g mkcert
mkcert -install
mkcert localhost

# Run the HTTPS server
node serve-https.js
```

Then visit https://localhost:8443/wallet-connect.html to test the wallet connection page.

You can toggle between GitHub Pages and local development mode using the switch in the extension popup.

### "No Solana wallet found" Error

If you see the error "No Solana wallet found. Please install Phantom or Solflare extension":

1. Make sure you have installed either the [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/) wallet extension
2. After installing the wallet extension, reload the browser extension page
3. Reload the extension by:
   - For Chrome/Edge/Brave: Click the refresh icon on the extension card in chrome://extensions
   - For Firefox: Remove and reload the extension from about:debugging

### Wallet Connection Issues

If you have a wallet installed but still can't connect:

1. Make sure your wallet is unlocked (you've entered your password)
2. Try restarting your browser
3. Check if your wallet works on other Solana dApps (like [Solana Explorer](https://explorer.solana.com/))
4. Make sure you're using the latest version of the wallet extension
