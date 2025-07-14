const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting complete extension rebuild...');

// Path to the extension build directory
const buildDir = path.join(__dirname, 'extension-build');

// Check if the directory exists
if (fs.existsSync(buildDir)) {
  console.log('Removing existing extension-build directory...');
  
  // Delete the directory recursively
  try {
    fs.rmSync(buildDir, { recursive: true, force: true });
    console.log('✅ Deleted extension-build directory');
  } catch (error) {
    console.error('❌ Error deleting directory:', error.message);
    process.exit(1);
  }
}

// Run the build script
console.log('\nRunning build-extension.js...');
try {
  execSync('node build-extension.js', { stdio: 'inherit' });
  console.log('✅ Extension build completed');
} catch (error) {
  console.error('❌ Error during build:', error.message);
  process.exit(1);
}

// Run the compatibility fixes
console.log('\nApplying browser compatibility fixes...');
try {
  execSync('node fix-browser-compatibility.js', { stdio: 'inherit' });
  console.log('✅ Compatibility fixes applied');
} catch (error) {
  console.error('❌ Error applying compatibility fixes:', error.message);
  process.exit(1);
}

// Verify the popup.js file
console.log('\nVerifying popup.js file...');
const popupJsPath = path.join(buildDir, 'popup.js');

if (fs.existsSync(popupJsPath)) {
  const content = fs.readFileSync(popupJsPath, 'utf8');
  
  // Check for process.env.NODE_ENV
  if (content.includes('process.env.NODE_ENV')) {
    console.error('❌ Error: popup.js still contains process.env.NODE_ENV reference!');
    
    // Apply manual fix
    console.log('Applying manual fix...');
    const fixedContent = content.replace(
      /const isDevelopment = process\.env\.NODE_ENV === ['"]development['"] \|\| true;/g,
      'const isDevelopment = true; // Hardcoded to true instead of using process.env.NODE_ENV'
    );
    
    fs.writeFileSync(popupJsPath, fixedContent);
    console.log('✅ Manual fix applied');
  } else {
    console.log('✅ No process.env.NODE_ENV references found in popup.js');
  }
} else {
  console.error('❌ Error: popup.js file not found!');
}

console.log('\n✨ Extension rebuild completed successfully!');
console.log('\nNext steps:');
console.log('1. Go to chrome://extensions/');
console.log('2. Remove the existing extension');
console.log('3. Click "Load unpacked" and select the "extension-build" folder');
console.log('4. Test the extension to verify the issue is resolved'); 