# Solana Wallet Browser Extension

A browser extension that allows users to connect their Solana wallets and interact with Solana dApps.

## Features

- Connect to Solana wallets (Phantom, Solflare)
- Display wallet address in the extension UI
- Sign messages with the connected wallet
- Multiple deployment options:
  - Railway (production)
  - GitHub Pages (alternative)
  - Local development

## Project Structure

```
.
├── public/                 # Extension source files
│   ├── background.js       # Background script
│   ├── popup.js            # Popup UI script
│   ├── content.js          # Content script
│   ├── manifest.json       # Extension manifest
│   └── ...                 # Other extension files
├── docs/                   # GitHub Pages files
│   ├── wallet-connect.html # Wallet connection page
│   └── ...                 # Other GitHub Pages files
├── extension-build/        # Built extension files
├── server.js              # Express server for Railway deployment
├── build-extension.js     # Script to build extension for local testing
├── build-extension-production.js # Script to build extension for production
└── deploy-to-gh-pages.js  # Script to deploy to GitHub Pages
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Chromium-based browser (Chrome, Edge, Brave) or Firefox

## Setup & Development

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Build the extension

For local development:
```bash
npm run build:extension
# or
yarn build:extension
```

For production:
```bash
npm run build:extension:prod
# or
yarn build:extension:prod
```

If you encounter browser compatibility issues (like "process is not defined"), you can run:
```bash
npm run fix:compatibility
# or
yarn fix:compatibility
```

### 3. Load the extension in your browser

#### Chrome / Edge / Brave:
1. Open your browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" and select the `extension-build` folder

#### Firefox:
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..." and select any file in the `extension-build` folder

## Deployment Options

The extension requires a secure (HTTPS) endpoint to connect to Solana wallets. You have three options:

### Option 1: Railway (Recommended for Production)

1. **Create a Railway account** at [railway.app](https://railway.app/)

2. **Deploy to Railway**:
   - Fork/clone this repository
   - Create a new project on Railway
   - Select "Deploy from GitHub repo"
   - Select your forked/cloned repository

3. **Update the extension**:
   - After deployment, Railway will provide you with a URL
   - Update the `PRODUCTION_URL` constant in `build-extension-production.js`:
     ```javascript
     const PRODUCTION_URL = 'https://your-railway-app-url.up.railway.app/wallet-connect.html';
     ```
   - Build the extension for production:
     ```bash
     npm run build:extension:prod
     # or
     yarn build:extension:prod
     ```

### Option 2: GitHub Pages

1. **Deploy to GitHub Pages**:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Update the extension**:
   - Update the `GITHUB_PAGES_URL` constant in `public/background.js`:
     ```javascript
     const GITHUB_PAGES_URL = 'https://your-username.github.io/your-repo/wallet-connect.html';
     ```
   - Build the extension:
     ```bash
     npm run build:extension
     # or
     yarn build:extension
     ```

### Option 3: Local Development

1. **Start the local server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **For HTTPS local development** (recommended for wallet connections):
   ```bash
   node serve-https.js
   ```

## Usage

1. **Install the extension** in your browser as described above

2. **Click on the extension icon** to open the popup

3. **Connect your wallet**:
   - Click the "Connect Wallet" button
   - A new tab will open with the wallet connection page
   - Select your wallet (Phantom, Solflare, etc.)
   - Approve the connection in your wallet

4. **Switch environments** (if needed):
   - In the extension popup, click on the gear icon
   - Select your preferred environment:
     - Production (Railway)
     - GitHub Pages
     - Local Development

## Debugging

The extension includes debugging tools:

1. **View extension logs**:
   - Open your browser's developer tools
   - Navigate to the "Console" tab
   - Filter for messages from the extension

2. **Debug storage**:
   - Click the "Debug" button in the extension popup
   - View current storage values and connection state

3. **Test Railway deployment**:
   ```bash
   npm run test:railway
   ```

For more detailed troubleshooting steps, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Building for Distribution

To create a packaged zip file for distribution:

```bash
npm run build:extension:prod
# or
yarn build:extension:prod
```

This will create `extension-production.zip` in the project root.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## Troubleshooting

For common issues and their solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## License

MIT
