# Solana Wallet Connector

This repository hosts the wallet connection page for the My NextJS App browser extension.

## How it Works

1. The browser extension opens this page in a new tab when connecting to a Solana wallet
2. This page runs in a secure HTTPS context (required by Phantom wallet)
3. After successful connection, the wallet address is sent back to the extension

## Files

- `index.html`: Redirects to the wallet connection page
- `wallet-connect.html`: The main wallet connection interface
- `wallet-connect-script.js`: JavaScript for wallet connection functionality
- `solana-wallet.js`: Solana wallet adapter implementation

## Development

To update this page, modify the files in the `public` directory of the main repository and run the deployment script.
