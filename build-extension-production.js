const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create extension build directory
const buildDir = path.join(__dirname, 'extension-build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Production URL for Railway deployment
// Replace this with your actual Railway URL after deployment
const PRODUCTION_URL = 'https://solana-wallet-extension.up.railway.app/wallet-connect.html';

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
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // If this is the background.js file, update the PRODUCTION_URL
        if (entry.name === 'background.js') {
          content = content.replace(
            /const PRODUCTION_URL = ['"].*?['"]/,
            `const PRODUCTION_URL = '${PRODUCTION_URL}'`
          );
          console.log('Updated PRODUCTION_URL in background.js');
        }
        
        // Write to destination
        fs.writeFileSync(destPath, content);
        
        // Validate the copy
        const destContent = fs.readFileSync(destPath, 'utf8');
        if (content.length !== destContent.length) {
          console.error(`Warning: File ${entry.name} may not have been copied correctly. Source size: ${content.length}, Destination size: ${destContent.length}`);
        } else {
          console.log(`Successfully copied ${entry.name} (${content.length} bytes)`);
        }
      } catch (error) {
        console.error(`Error copying file ${entry.name}:`, error);
      }
    }
  }
}

// Copy public directory contents to build directory
const publicDir = path.join(__dirname, 'public');
copyDir(publicDir, buildDir);

// Verify critical files
const criticalFiles = [
  'background.js',
  'popup.js',
  'solana-wallet.js',
  'gh-pages-bridge.js',
  'wallet-connect-script.js'
];

console.log('\nVerifying critical files:');
criticalFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > 0) {
      console.log(`✓ ${file} (${stats.size} bytes)`);
    } else {
      console.error(`✗ ${file} exists but is empty (0 bytes)`);
    }
  } else {
    console.error(`✗ ${file} is missing from build directory`);
  }
});

// Create a zip file for easy distribution
try {
  const archiver = require('archiver');
  const output = fs.createWriteStream(path.join(__dirname, 'extension-production.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });
  
  output.on('close', function() {
    console.log(`\nExtension packaged successfully: ${archive.pointer()} total bytes`);
    console.log('Zip file created: extension-production.zip');
  });
  
  archive.on('error', function(err) {
    throw err;
  });
  
  archive.pipe(output);
  archive.directory(buildDir, false);
  archive.finalize();
} catch (error) {
  console.log('\nCould not create zip file. If you want to package the extension, install archiver:');
  console.log('npm install archiver --save-dev');
  console.log('\nExtension files copied to build directory!');
}

console.log('\nExtension is ready in the "extension-build" folder.');
console.log('\nTo load the extension in Chrome:');
console.log('1. Open Chrome and navigate to chrome://extensions/');
console.log('2. Enable "Developer mode" (toggle in the top right)');
console.log('3. Click "Load unpacked" and select the "extension-build" folder');
console.log('\nTo load the extension in Firefox:');
console.log('1. Open Firefox and navigate to about:debugging#/runtime/this-firefox');
console.log('2. Click "Load Temporary Add-on..." and select any file in the "extension-build" folder'); 