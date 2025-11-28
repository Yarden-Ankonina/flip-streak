import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '../public');
const assetsDir = join(__dirname, '../src/assets/coins');
const headsCorgiPath = join(assetsDir, 'heads-corgi.png');

// Use heads-corgi.png as source if available, otherwise fall back to icon.svg
let sourcePath: string;
let isPng = false;

if (existsSync(headsCorgiPath)) {
  sourcePath = headsCorgiPath;
  isPng = true;
  console.log('Using heads-corgi.png as icon source');
} else {
  sourcePath = join(publicDir, 'icon.svg');
  console.log('Using icon.svg as icon source');
}

const sizes = [
  { size: 32, name: 'favicon.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateIcons() {
  try {
    const sourceBuffer = readFileSync(sourcePath);
    
    console.log('Generating icons from:', sourcePath);
    
    for (const { size, name } of sizes) {
      const outputPath = join(publicDir, name);
      
      if (isPng) {
        await sharp(sourceBuffer)
          .resize(size, size, { fit: 'cover' })
          .png()
          .toFile(outputPath);
      } else {
        await sharp(sourceBuffer)
          .resize(size, size)
          .png()
          .toFile(outputPath);
      }
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    console.log('\n🎉 All icons generated successfully!');
    console.log('Icons are in:', publicDir);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

