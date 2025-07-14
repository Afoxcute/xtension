# My NextJS App Browser Extension with Solana Wallet Support

This browser extension was created from a Next.js application and includes Solana wallet integration.

## Features

- Simple popup interface
- Content script that interacts with web pages
- Background script for extension functionality
- **Solana wallet integration** for connecting to Phantom or Solflare wallets

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

## Requirements

- Phantom or Solflare wallet extension must be installed in your browser to use the Solana wallet features

## Troubleshooting

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

## Development

To modify this extension:

1. Edit the files in the `extension-build` directory

2. For Chrome-based browsers, click the refresh icon on the extension card in the extensions page

3. For Firefox, you'll need to reload the extension from `about:debugging` 