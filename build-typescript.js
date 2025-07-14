const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building TypeScript files...');

try {
  // Create a temporary package.json with the build script
  const packageJson = require('./package.json');
  const tempPackageJson = {
    ...packageJson,
    scripts: {
      ...packageJson.scripts,
      'build-ts': 'webpack --config webpack.config.js'
    }
  };

  // Write the temporary package.json
  fs.writeFileSync('temp-package.json', JSON.stringify(tempPackageJson, null, 2));

  // Run the build script
  execSync('node node_modules/webpack/bin/webpack.js --config webpack.config.js', { stdio: 'inherit' });

  // Delete the temporary package.json
  fs.unlinkSync('temp-package.json');

  console.log('TypeScript build completed successfully!');
} catch (error) {
  console.error('Error building TypeScript files:', error);
  process.exit(1);
} 