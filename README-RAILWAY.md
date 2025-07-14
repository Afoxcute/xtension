# Solana Wallet Browser Extension - Railway Backend

This repository contains the backend server for the Solana Wallet Browser Extension. It serves the wallet connection page that allows users to connect their Solana wallets to the extension.

## Deployment on Railway

### Prerequisites

- A Railway account
- Git installed on your local machine

### Deployment Steps

1. **Fork or clone this repository**

2. **Create a new project on Railway**
   - Go to [Railway](https://railway.app/)
   - Click on "New Project"
   - Select "Deploy from GitHub repo"
   - Select your forked/cloned repository

3. **Configure environment variables (if needed)**
   - No environment variables are required for basic functionality
   - You can add custom environment variables in the Railway dashboard

4. **Deploy the project**
   - Railway will automatically deploy the project
   - The deployment process will:
     - Install dependencies
     - Run the build script (which prepares the wallet connection files)
     - Start the server

5. **Update the extension**
   - After deployment, Railway will provide you with a URL for your project
   - Update the `PRODUCTION_URL` constant in the `background.js` file of your extension:
     ```javascript
     const PRODUCTION_URL = 'https://your-railway-app-url.up.railway.app/wallet-connect.html';
     ```
   - Rebuild the extension with the updated URL

## Local Development

1. **Install dependencies**
   ```
   npm install
   ```

2. **Run the development server**
   ```
   npm run dev
   ```

3. **Access the wallet connection page**
   - Open your browser and navigate to `http://localhost:3000/wallet-connect.html`

## Project Structure

- `server.js` - Express server that serves the wallet connection page
- `docs/` - Contains the wallet connection files
- `public/` - Contains the extension files
- `deploy-to-gh-pages.js` - Script to prepare files for deployment

## Extension Features

- Connect to Solana wallets (Phantom, Solflare)
- Display wallet address in the extension UI
- Sign messages with the connected wallet
- Multiple deployment options:
  - Railway (production)
  - GitHub Pages (alternative)
  - Local development

## License

MIT 