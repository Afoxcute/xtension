const fs = require('fs');
const path = require('path');

console.log('Testing Railway deployment setup...');

// Check if all required files exist
const requiredFiles = [
  'server.js',
  'build-for-railway.js',
  'railway.json',
  'Procfile',
  'package.json'
];

let allFilesExist = true;

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✓ ${file} exists`);
  } else {
    console.error(`✗ ${file} is missing`);
    allFilesExist = false;
  }
}

// Check package.json for railway script
const packageJson = require('./package.json');
if (packageJson.scripts && packageJson.scripts.railway) {
  console.log('✓ "railway" script found in package.json');
} else {
  console.error('✗ "railway" script is missing in package.json');
  allFilesExist = false;
}

// Check Procfile content
if (fs.existsSync(path.join(__dirname, 'Procfile'))) {
  const procfileContent = fs.readFileSync(path.join(__dirname, 'Procfile'), 'utf8');
  if (procfileContent.includes('web: npm run railway')) {
    console.log('✓ Procfile contains correct command');
  } else {
    console.error('✗ Procfile does not contain "web: npm run railway"');
    allFilesExist = false;
  }
}

// Check railway.json content
if (fs.existsSync(path.join(__dirname, 'railway.json'))) {
  const railwayJson = require('./railway.json');
  if (railwayJson.deploy && railwayJson.deploy.startCommand === 'npm run railway') {
    console.log('✓ railway.json contains correct startCommand');
  } else {
    console.error('✗ railway.json does not contain correct startCommand');
    allFilesExist = false;
  }
}

// Check extension-build directory
if (fs.existsSync(path.join(__dirname, 'extension-build'))) {
  console.log('✓ extension-build directory exists');
  
  // Check critical files in extension-build
  const criticalFiles = [
    'wallet-connect.html',
    'wallet-connect-script.js',
    'background.js'
  ];
  
  for (const file of criticalFiles) {
    if (fs.existsSync(path.join(__dirname, 'extension-build', file))) {
      console.log(`✓ extension-build/${file} exists`);
    } else {
      console.error(`✗ extension-build/${file} is missing`);
      allFilesExist = false;
    }
  }
} else {
  console.error('✗ extension-build directory is missing');
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n✅ All required files for Railway deployment are present!');
  console.log('\nYou can deploy to Railway using:');
  console.log('1. Railway CLI: railway up');
  console.log('2. Railway Dashboard: Connect your GitHub repository');
} else {
  console.error('\n❌ Some required files are missing. Please fix the issues above before deploying.');
} 