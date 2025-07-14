const fs = require('fs');
const path = require('path');

// Function to create a simple SVG icon
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0070f3"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" fill="white" text-anchor="middle" dominant-baseline="middle">N</text>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create icons of different sizes
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(iconPath, createSVGIcon(size));
  console.log(`Created icon: ${iconPath}`);
});

console.log('All icons created successfully!'); 