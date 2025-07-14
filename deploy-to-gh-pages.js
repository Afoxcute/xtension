// Script to prepare files for GitHub Pages deployment
const fs = require('fs');
const path = require('path');

// Define directories
const extensionBuildDir = path.join(__dirname, 'extension-build');
const publicDir = path.join(__dirname, 'public');
const ghPagesDir = path.join(__dirname, 'docs'); // GitHub Pages serves from /docs or /root

// Create GitHub Pages directory if it doesn't exist
if (!fs.existsSync(ghPagesDir)) {
  fs.mkdirSync(ghPagesDir, { recursive: true });
}

// Files needed for wallet connection on GitHub Pages
const filesToCopy = [
  'wallet-connect.html',
  'wallet-connect-script.js',
  'solana-wallet.js'
];

// Copy the necessary files to the GitHub Pages directory
console.log('Copying files to GitHub Pages directory...');
filesToCopy.forEach(file => {
  // First check if the file exists in the public directory (for latest version)
  let sourcePath = path.join(publicDir, file);
  if (!fs.existsSync(sourcePath)) {
    // If not in public, try extension-build
    sourcePath = path.join(extensionBuildDir, file);
  }
  
  const destPath = path.join(ghPagesDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to ${ghPagesDir}`);
  } else {
    console.error(`Error: ${file} not found in ${publicDir} or ${extensionBuildDir}`);
  }
});

// Create index.html that redirects to wallet-connect.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solana Wallet Connector</title>
  <meta http-equiv="refresh" content="0;url=wallet-connect.html">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Redirecting to Wallet Connection Page...</h1>
    <p>If you are not redirected automatically, <a href="wallet-connect.html">click here</a>.</p>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(ghPagesDir, 'index.html'), indexHtml);
console.log('Created index.html with redirect');

// Create a README for the GitHub Pages repository
const readmeContent = `# Solana Wallet Connector

This repository hosts the wallet connection page for the My NextJS App browser extension.

## How it Works

1. The browser extension opens this page in a new tab when connecting to a Solana wallet
2. This page runs in a secure HTTPS context (required by Phantom wallet)
3. After successful connection, the wallet address is sent back to the extension

## Files

- \`index.html\`: Redirects to the wallet connection page
- \`wallet-connect.html\`: The main wallet connection interface
- \`wallet-connect-script.js\`: JavaScript for wallet connection functionality
- \`solana-wallet.js\`: Solana wallet adapter implementation

## Development

To update this page, modify the files in the \`public\` directory of the main repository and run the deployment script.
`;

fs.writeFileSync(path.join(ghPagesDir, 'README.md'), readmeContent);
console.log('Created README.md for GitHub Pages');

console.log('\nGitHub Pages deployment files prepared successfully!');
console.log(`Files are ready in the ${ghPagesDir} directory.`);
console.log('\nNext steps:');
console.log('1. Commit and push these files to your GitHub repository');
console.log('2. Enable GitHub Pages in your repository settings (Settings > Pages)');
console.log('3. Set the source to "main branch" and folder to "/docs"');
console.log('4. Update your extension to use the GitHub Pages URL for wallet connection'); 