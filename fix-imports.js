const fs = require('fs');
const path = require('path');

console.log('Fixing import statements in extension files...');

// Files to process
const filesToFix = [
  'extension-build/background.js',
  'extension-build/popup.js'
];

// Process each file
filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} (file not found)`);
    return;
  }
  
  try {
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove import statements
    content = content.replace(/import\s+\{\s*(\w+)\s*\}\s+from\s+['"]\.\/utils\/(\w+)\.js['"];?/g, '// Import removed: $1 from $2.js');
    
    // Write back to file
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed import statements in ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('Import fixes completed!'); 