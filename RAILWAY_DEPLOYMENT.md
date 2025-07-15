# Deploying the Solana Wallet Extension on Railway

This guide explains how to deploy the wallet connection page for your Solana wallet browser extension on Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. [Git](https://git-scm.com/) installed on your local machine
3. [Node.js](https://nodejs.org/) (v14 or higher) installed on your local machine

## Step 1: Prepare Your Repository

Make sure your repository contains all the necessary files:

- `server.js` - Express server to serve the wallet connection page
- `build-for-railway.js` - Script to prepare the extension for Railway deployment
- `railway.json` - Railway configuration file
- `Procfile` - Specifies the command to run on Railway
- `package.json` - With the consolidated "railway" script that handles both build and start

## Step 2: Deploy to Railway

### Option 1: Deploy using the Railway CLI

1. Install the Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to your Railway account:
   ```bash
   railway login
   ```

3. Initialize a new Railway project:
   ```bash
   railway init
   ```

4. Deploy your project:
   ```bash
   railway up
   ```

### Option 2: Deploy using the Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" > "Deploy from GitHub"
3. Select your repository
4. Railway will automatically detect the configuration and deploy your project

## Step 3: Get Your Railway URL

1. After deployment, go to your project in the Railway dashboard
2. Click on the "Settings" tab
3. Find your project's domain under "Domains"
4. Copy this URL - this is your Railway URL

## Step 4: Update Your Extension

1. Open `background.js` in your extension's source code
2. Update the `PRODUCTION_URL` constant with your Railway URL:
   ```javascript
   const PRODUCTION_URL = 'https://your-railway-url.up.railway.app/wallet-connect.html';
   ```

3. Rebuild your extension:
   ```bash
   npm run build:extension
   ```

## Step 5: Load the Updated Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" and select your `extension-build` folder
4. The extension should now be loaded with the Railway URL

## Troubleshooting

### Connection Issues

If your extension can't connect to the wallet:

1. Check if your Railway deployment is running
2. Verify the URL in your extension's `background.js` matches your Railway URL
3. Make sure the wallet connection page is accessible at `https://your-railway-url.up.railway.app/wallet-connect.html`
4. Check browser console for any CORS or connection errors

### Deployment Issues

If your deployment fails:

1. Check Railway logs for error messages
2. Verify your `package.json` "railway" script is correct and includes both build and start commands
3. Make sure all dependencies are properly listed in your `package.json`
4. Confirm that the Procfile contains `web: npm run railway`

## Automatic Updates

When you push changes to your GitHub repository, Railway will automatically redeploy your application if you've set up GitHub integration. 