# Solana Wallet Browser Extension - Railway Deployment Guide

This guide provides detailed instructions for deploying and using the Solana Wallet Browser Extension with Railway.

## Overview

This extension connects to Solana wallets and uses Railway as the backend server to host the wallet connection page. The extension is designed to work exclusively with Railway for production deployment.

## Deployment Steps

### 1. Deploy the Backend on Railway

1. **Create a Railway account**
   - Sign up at [Railway](https://railway.app/) if you don't have an account

2. **Deploy to Railway**
   - Fork or clone this repository
   - Create a new project on Railway
   - Select "Deploy from GitHub repo"
   - Select your forked/cloned repository

3. **Get your Railway URL**
   - After deployment, Railway will provide a URL for your project
   - Note this URL, as you'll need it for the extension

### 2. Build the Extension for Railway

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Build the extension specifically for Railway**
   ```bash
   npm run build:railway
   # or
   yarn build:railway
   ```

   This will:
   - Build the extension
   - Apply browser compatibility fixes
   - Bundle the extension (non-ES modules version)
   - Update the Railway URL in the extension
   - Create a zip file for distribution

3. **The extension will be available in two forms**:
   - As a directory: `extension-bundled/`
   - As a zip file: `solana-wallet-extension-railway.zip`

### 3. Load the Extension in Your Browser

#### Chrome / Edge / Brave:
1. Open your browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" and select the `extension-bundled` folder

#### Firefox:
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..." and select any file in the `extension-bundled` folder

## Using the Extension

1. **Click on the extension icon** in your browser toolbar
2. **Connect your wallet**:
   - Click the "Connect Wallet" button
   - A new tab will open with the wallet connection page
   - Select your wallet (Phantom, Solflare, etc.)
   - Approve the connection in your wallet

3. **View your wallet address and points** in the extension popup

## Troubleshooting

If you encounter issues with the extension:

1. **Test your Railway deployment**:
   ```bash
   npm run test:railway
   # or
   yarn test:railway
   ```
   When prompted, enter your Railway URL.

2. **Check the browser console** for errors:
   - Right-click on the extension popup
   - Select "Inspect" or "Inspect Element"
   - Go to the Console tab

3. **Use the Debug button** in the extension to view storage information

## Extension Architecture

- **Background Script**: Handles communication with the wallet and stores the wallet address
- **Popup UI**: Displays wallet information and points
- **LocalStorage Utility**: Manages storage of wallet address and points
- **Debug Tools**: Help diagnose issues with storage and connections

## Customizing the Extension

To customize the extension for your own Railway deployment:

1. Update the `RAILWAY_URL` constant in `build-for-railway.js` with your own Railway URL
2. Run the build script again:
   ```bash
   npm run build:railway
   ```

## License

MIT 