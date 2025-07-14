const https = require('https');
const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Railway Deployment Test Tool');
console.log('===========================');
console.log('This tool tests if your Railway deployment is working correctly.');
console.log('It will check if the wallet connection page is accessible.\n');

rl.question('Enter your Railway URL (e.g., https://solana-wallet-extension.up.railway.app): ', (url) => {
  if (!url) {
    console.error('Error: No URL provided');
    rl.close();
    return;
  }

  // Clean up URL if needed
  let testUrl = url.trim();
  
  // Add https:// if not present
  if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
    testUrl = 'https://' + testUrl;
  }
  
  // Add wallet-connect.html if not present
  if (!testUrl.endsWith('/wallet-connect.html')) {
    testUrl = testUrl.replace(/\/?$/, '/wallet-connect.html');
  }

  console.log(`\nTesting connection to: ${testUrl}\n`);

  // Choose http or https module based on URL
  const requester = testUrl.startsWith('https://') ? https : http;

  const req = requester.get(testUrl, (res) => {
    const { statusCode } = res;
    let data = '';

    console.log(`Status Code: ${statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}\n`);

    // Check if the status code indicates success
    if (statusCode !== 200) {
      console.error(`Error: Request failed with status code ${statusCode}`);
      rl.close();
      return;
    }

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      // Check if the response contains expected content
      if (data.includes('Connect Wallet') && data.includes('Solana')) {
        console.log('✅ Success! The wallet connection page is accessible.');
        console.log('✅ The page contains expected wallet connection content.');
        
        console.log('\nNext steps:');
        console.log('1. Update the PRODUCTION_URL in build-extension-production.js to:');
        console.log(`   ${testUrl}`);
        console.log('2. Rebuild your extension with: npm run build:extension:prod');
        console.log('3. Load the updated extension in your browser');
      } else {
        console.error('❌ Error: The page does not contain expected wallet connection content.');
        console.log('Response preview:');
        console.log(data.substring(0, 200) + '...');
      }
      
      rl.close();
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Error: ${error.message}`);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your Railway deployment is running');
    console.log('2. Check if the URL is correct');
    console.log('3. Verify that your server is serving the wallet-connect.html file');
    rl.close();
  });

  // Set a timeout for the request
  req.setTimeout(10000, () => {
    req.destroy();
    console.error('❌ Error: Request timed out after 10 seconds');
    rl.close();
  });
}); 