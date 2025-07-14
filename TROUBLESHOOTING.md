# Troubleshooting Guide

This document provides solutions for common issues you might encounter when using the Solana Wallet Browser Extension.

## Wallet Connection Issues

### "No Solana wallet found" Error

If you see the error "No Solana wallet found. Please install Phantom or Solflare extension":

1. Make sure you have installed either the [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/) wallet extension
2. After installing the wallet extension, reload the browser extension page
3. Reload the extension by:
   - For Chrome/Edge/Brave: Click the refresh icon on the extension card in chrome://extensions
   - For Firefox: Remove and reload the extension from about:debugging

### Wallet Doesn't Connect

If you have a wallet installed but still can't connect:

1. Make sure your wallet is unlocked (you've entered your password)
2. Check the browser console for errors (press F12 to open developer tools)
3. Verify that the connection page is being served over HTTPS or localhost
4. Try restarting your browser
5. Check if your wallet works on other Solana dApps (like [Solana Explorer](https://explorer.solana.com/))

## JavaScript Errors

### "Uncaught ReferenceError: process is not defined"

If you see this error in the console:

1. This happens because the extension code is trying to access the Node.js `process` object, which isn't available in browser environments
2. To fix it:
   - Option 1: Run the automated fix script:
     ```bash
     npm run fix:compatibility
     # or
     yarn fix:compatibility
     ```
     Then reload the extension in your browser
   
   - Option 2: Fix it manually:
     - Open `extension-build/popup.js`
     - Find the line containing `process.env.NODE_ENV`
     - Replace it with `const isDevelopment = true;`
     - Reload the extension

3. To prevent this issue when rebuilding:
   - The build scripts now automatically run the compatibility fixes
   - You can also run the fix script separately anytime

### Other JavaScript Errors

If you encounter other JavaScript errors:

1. Check the browser console (F12) for specific error messages
2. Make sure all required files are included in the extension build
3. Try rebuilding the extension with `npm run build:extension` or `npm run build:extension:prod`

## HTTPS Connection Issues

### Wallet Connection Page Not Loading

Phantom and other Solana wallets require a secure context (HTTPS or localhost) to connect:

1. If using GitHub Pages:
   - Make sure your GitHub Pages site is properly deployed
   - Check that the URL in `background.js` matches your actual GitHub Pages URL
   - Verify that the wallet-connect.html file exists in your GitHub Pages repository

2. If using Railway:
   - Make sure your Railway deployment is running
   - Check that the URL in `background.js` matches your actual Railway URL
   - Run `npm run test:railway` to verify your deployment

3. If using local development:
   - Make sure your local server is running (`npm run dev` or `node serve-https.js`)
   - If using HTTPS locally, ensure you've set up certificates correctly

## Extension Loading Issues

### Extension Not Working After Installation

1. Make sure you've built the extension correctly:
   ```bash
   npm run build:extension
   # or for production
   npm run build:extension:prod
   ```

2. Check that all required files are in the `extension-build` directory:
   - manifest.json
   - background.js
   - popup.js
   - solana-wallet.js
   - and other necessary files

3. Try reloading the extension:
   - Chrome/Edge/Brave: Go to chrome://extensions, find the extension, and click the refresh icon
   - Firefox: Go to about:debugging#/runtime/this-firefox, remove the extension, and load it again

### Background Script Not Running

If the extension's background script isn't running:

1. Check the browser console for errors
2. Verify that the service worker is registered correctly in manifest.json
3. Try reloading the extension

## Storage Issues

### Wallet Address Not Displaying

If your wallet address isn't displaying after connecting:

1. Click the "Debug" button in the extension popup
2. Check if the wallet address is stored correctly in Chrome storage
3. If not, try reconnecting your wallet
4. If the issue persists, check the browser console for errors

## Environment Switching Issues

### Can't Switch Between Environments

If you're having trouble switching between environments (Railway, GitHub Pages, local):

1. Check the browser console for errors
2. Verify that the environment toggle buttons are working correctly
3. Try reloading the extension
4. Check Chrome storage to see if the environment flags are being set correctly

## Railway Deployment Issues

### Railway Deployment Not Working

1. Make sure you've configured your Railway project correctly
2. Check that the server is running on Railway
3. Verify that the `wallet-connect.html` file is being served correctly
4. Run the test script:
   ```bash
   npm run test:railway
   ```

## GitHub Pages Deployment Issues

### GitHub Pages Not Working

1. Make sure you've run the deployment script:
   ```bash
   npm run build
   ```
2. Check that the files are correctly pushed to your GitHub repository
3. Verify that GitHub Pages is enabled in your repository settings
4. Make sure the URL in `background.js` matches your actual GitHub Pages URL

## Extension Packaging Issues

### Error Creating Extension ZIP

If you're having issues creating the extension ZIP file:

1. Make sure you have the archiver package installed:
   ```bash
   npm install archiver --save-dev
   ```
2. Run the production build script:
   ```bash
   npm run build:extension:prod
   ```
3. Check for any errors in the console output

## Still Having Issues?

If you're still experiencing problems:

1. Check the browser console for specific error messages
2. Try using a different browser
3. Clear your browser cache and cookies
4. Reinstall the extension from scratch
5. File an issue on the GitHub repository with detailed information about the problem 