const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building extension for Railway deployment...');

// Create extension build directory if it doesn't exist
const buildDir = path.join(__dirname, 'extension-build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy all files from public to build directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      try {
        // Read the source file
        const content = fs.readFileSync(srcPath);
        
        // Write to destination
        fs.writeFileSync(destPath, content);
        console.log(`Copied ${entry.name}`);
      } catch (error) {
        console.error(`Error copying file ${entry.name}:`, error);
      }
    }
  }
}

// Copy public directory contents to build directory
const publicDir = path.join(__dirname, 'public');
copyDir(publicDir, buildDir);

// Update background.js to use only Railway URL
const backgroundJsPath = path.join(buildDir, 'background.js');
if (fs.existsSync(backgroundJsPath)) {
  let backgroundJs = fs.readFileSync(backgroundJsPath, 'utf8');
  
  // Update the URL constants to only use Railway
  const railwayUrl = process.env.RAILWAY_STATIC_URL || 'https://solana-wallet-extension.up.railway.app';
  
  // Replace the URL constants section
  const urlConstantsRegex = /\/\/ Production URL for wallet connection[\s\S]*?const LOCAL_URLS[\s\S]*?\];/;
  const newUrlConstants = `// Production URL for wallet connection (Railway deployment)
const PRODUCTION_URL = '${railwayUrl}/wallet-connect.html';

// No fallback URLs for Railway deployment
const GITHUB_PAGES_URL = '${railwayUrl}/wallet-connect.html';

// No local development URLs for Railway deployment
const LOCAL_URLS = [
  '${railwayUrl}/wallet-connect.html'
];`;

  backgroundJs = backgroundJs.replace(urlConstantsRegex, newUrlConstants);
  
  // Disable local development and GitHub Pages options
  backgroundJs = backgroundJs.replace(/const newValue = !result\.useLocalDevelopment;/g, 'const newValue = false;');
  backgroundJs = backgroundJs.replace(/const newValue = !result\.useGitHubPages;/g, 'const newValue = false;');
  
  fs.writeFileSync(backgroundJsPath, backgroundJs);
  console.log('Updated background.js with Railway URL');
}

// Create a simple HTML page that redirects to the wallet-connect.html
const indexHtmlPath = path.join(buildDir, 'index.html');
const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solana Wallet Extension - Railway Deployment</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    h1 {
      color: #9945FF;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .button {
      display: inline-block;
      background-color: #9945FF;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
      text-decoration: none;
    }
    .button:hover {
      background-color: #7F38CC;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <h1>Solana Wallet Extension - Railway Deployment</h1>
  <div class="container">
    <p>This is the Railway deployment for the Solana Wallet Browser Extension.</p>
    <p>This server hosts the wallet connection page that is required for the browser extension to connect to Solana wallets.</p>
    <p>To use this service, you need to install the browser extension first.</p>
    <a href="/wallet-connect.html" class="button">Go to Wallet Connection Page</a>
  </div>
</body>
</html>`;

fs.writeFileSync(indexHtmlPath, redirectHtml);
console.log('Created index.html with redirect to wallet-connect.html');

console.log('Railway build completed successfully!'); 