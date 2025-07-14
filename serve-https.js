// Simple HTTPS server for local development
const https = require('https');
const fs = require('fs');
const path = require('path');

// Self-signed certificate for local development
// In a real environment, you would use a proper certificate
const options = {
  key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem'))
};

const PORT = 8443;
const EXTENSION_DIR = path.join(__dirname, 'extension-build');

// Simple HTTPS file server
https.createServer(options, (req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(EXTENSION_DIR, url);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    
    // Set content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    
    switch (ext) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(PORT);

console.log(`HTTPS server running at https://localhost:${PORT}/`);
console.log(`Serving extension files from ${EXTENSION_DIR}`);
console.log('Note: You will need to accept the self-signed certificate warning in your browser');
console.log('\nTo generate self-signed certificates, run:');
console.log('mkcert -install');
console.log('mkcert localhost');
console.log('\nThis will create localhost.pem and localhost-key.pem files needed by this server.'); 