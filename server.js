const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the 'docs' directory
app.use(express.static(path.join(__dirname, 'docs')));

// Serve static files from the 'public' directory as a fallback
app.use(express.static(path.join(__dirname, 'public')));

// Route for the wallet connection page
app.get('/wallet-connect.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'wallet-connect.html'));
});

// Default route - redirect to wallet-connect.html
app.get('/', (req, res) => {
  res.redirect('/wallet-connect.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Wallet connection page available at: http://localhost:${PORT}/wallet-connect.html`);
}); 