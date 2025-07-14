const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building extension for Railway deployment...');

// Step 1: Build the extension
console.log('\nStep 1: Building extension...');
try {
  execSync('node build-extension.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building extension:', error);
  process.exit(1);
}

// Step 2: Apply browser compatibility fixes
console.log('\nStep 2: Applying browser compatibility fixes...');
try {
  execSync('node fix-browser-compatibility.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error applying compatibility fixes:', error);
  process.exit(1);
}

// Step 3: Bundle the extension (non-ES modules version)
console.log('\nStep 3: Bundling extension...');
try {
  execSync('node bundle-extension.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error bundling extension:', error);
  process.exit(1);
}

// Step 4: Update Railway URL in the bundled extension
console.log('\nStep 4: Updating Railway URL...');
const RAILWAY_URL = 'https://web-production-a2ab.up.railway.app/wallet-connect.html';

// Update background.js with the Railway URL
const backgroundPath = path.join(__dirname, 'extension-bundled', 'background.js');
let backgroundContent = fs.readFileSync(backgroundPath, 'utf8');
backgroundContent = backgroundContent.replace(
  /const PRODUCTION_URL = ['"].*?['"];/,
  `const PRODUCTION_URL = '${RAILWAY_URL}';`
);
fs.writeFileSync(backgroundPath, backgroundContent);

// Step 5: Create a zip file for easy distribution
console.log('\nStep 5: Creating distribution zip...');
try {
  const archiver = require('archiver');
  const output = fs.createWriteStream(path.join(__dirname, 'solana-wallet-extension-railway.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });
  
  output.on('close', function() {
    console.log(`\nExtension packaged successfully: ${archive.pointer()} total bytes`);
    console.log('Zip file created: solana-wallet-extension-railway.zip');
  });
  
  archive.on('error', function(err) {
    throw err;
  });
  
  archive.pipe(output);
  archive.directory(path.join(__dirname, 'extension-bundled'), false);
  archive.finalize();
} catch (error) {
  console.log('\nCould not create zip file. If you want to package the extension, install archiver:');
  console.log('npm install archiver --save-dev');
}

console.log('\nExtension built successfully for Railway deployment!');
console.log('\nTo load the extension in Chrome:');
console.log('1. Open Chrome and navigate to chrome://extensions/');
console.log('2. Enable "Developer mode" (toggle in the top right)');
console.log('3. Click "Load unpacked" and select the "extension-bundled" folder');
console.log('\nOr use the solana-wallet-extension-railway.zip file for distribution.'); 