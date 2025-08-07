const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes for PWA
const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// Create a simple SVG icon
const createSVGIcon = (size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
    <text x="${size/2}" y="${size/2 + innerSize*0.15}" font-family="Arial, sans-serif" font-size="${innerSize * 0.4}" fill="white" text-anchor="middle" font-weight="bold">🏛️</text>
    <text x="${size/2}" y="${size/2 + innerSize*0.4}" font-family="Arial, sans-serif" font-size="${innerSize * 0.15}" fill="white" text-anchor="middle">Civi</text>
  </svg>`;
};

// Create shortcut icons
const createShortcutIcon = (type, size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  const icons = {
    complaint: '📝',
    dashboard: '📊',
    chat: '💬'
  };
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad-${type})" rx="${size * 0.2}"/>
    <text x="${size/2}" y="${size/2 + innerSize*0.1}" font-family="Arial, sans-serif" font-size="${innerSize * 0.5}" fill="white" text-anchor="middle">${icons[type]}</text>
  </svg>`;
};

// Create additional icons
const createAdditionalIcon = (type, size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  const icons = {
    badge: '🔔',
    checkmark: '✓',
    xmark: '✗'
  };
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad-${type})" rx="${size * 0.2}"/>
    <text x="${size/2}" y="${size/2 + innerSize*0.1}" font-family="Arial, sans-serif" font-size="${innerSize * 0.5}" fill="white" text-anchor="middle">${icons[type]}</text>
  </svg>`;
};

// Generate main icons
console.log('Generating PWA icons...');

iconSizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

// Generate shortcut icons
['complaint', 'dashboard', 'chat'].forEach(type => {
  const svg = createShortcutIcon(type, 96);
  const filePath = path.join(iconsDir, `${type}-96x96.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created ${type}-96x96.svg`);
});

// Generate additional icons
['badge'].forEach(type => {
  const svg = createAdditionalIcon(type, 72);
  const filePath = path.join(iconsDir, `${type}-72x72.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created ${type}-72x72.svg`);
});

['checkmark', 'xmark'].forEach(type => {
  const svg = createAdditionalIcon(type, 24);
  const filePath = path.join(iconsDir, `${type}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Created ${type}.svg`);
});

console.log('\nIcon generation complete!');
console.log('\nNote: These are SVG placeholder icons. For production, you should:');
console.log('1. Convert them to PNG format');
console.log('2. Use a proper design tool to create high-quality icons');
console.log('3. Ensure they meet PWA requirements');
console.log('4. Test them on various devices and backgrounds'); 