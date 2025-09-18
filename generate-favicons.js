const fs = require('fs');
const { execSync } = require('child_process');
const sharp = require('sharp');

// Create favicon.ico
async function generateFavicons() {
  try {
    // Generate favicon.ico (16x16, 32x32, 48x48)
    await sharp('public/icon.svg')
      .resize(32, 32)
      .toFile('public/favicon.ico');
    
    // Generate favicon-16x16.png
    await sharp('public/icon.svg')
      .resize(16, 16)
      .toFile('public/favicon-16x16.png');
    
    // Generate favicon-32x32.png
    await sharp('public/icon.svg')
      .resize(32, 32)
      .toFile('public/favicon-32x32.png');
    
    // Generate apple-touch-icon.png (180x180)
    await sharp('public/icon.svg')
      .resize(180, 180)
      .toFile('public/apple-touch-icon.png');
    
    // Generate safari-pinned-tab.svg
    fs.copyFileSync('public/icon.svg', 'public/safari-pinned-tab.svg');
    
    console.log('✅ Favicons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

// Install sharp if not already installed
if (!fs.existsSync('node_modules/sharp')) {
  console.log('Installing sharp...');
  execSync('npm install sharp', { stdio: 'inherit' });
}

// Generate favicons
generateFavicons();
