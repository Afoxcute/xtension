const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the extension-build directory
app.use(express.static(path.join(__dirname, 'extension-build')));

// Route for the wallet connection page
app.get('/wallet-connect.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'extension-build', 'wallet-connect.html'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'extension-build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 