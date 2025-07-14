const fs = require('fs');
const path = require('path');

console.log('Running browser compatibility fixes...');

// Files to check and fix
const filesToFix = [
  'public/popup.js',
  'extension-build/popup.js'
];

// Fixes to apply
const fixes = [
  {
    // Fix for "process is not defined" error
    search: /const isDevelopment = process\.env\.NODE_ENV === ['"]development['"] \|\| true;/,
    replace: 'const isDevelopment = true; // Hardcoded to true instead of using process.env.NODE_ENV'
  }
];

// Apply fixes to each file
filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} (file not found)`);
    return;
  }
  
  try {
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    let fixesApplied = 0;
    
    // Apply each fix
    fixes.forEach(fix => {
      if (fix.search.test(content)) {
        content = content.replace(fix.search, fix.replace);
        fixesApplied++;
      }
    });
    
    // Write back to file if changes were made
    if (fixesApplied > 0) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed ${fixesApplied} issue(s) in ${filePath}`);
    } else {
      console.log(`✓ No issues found in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('Browser compatibility fixes completed!'); 