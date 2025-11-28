# PWA Icons Setup

The PWA requires several icon sizes. You can generate these from the `icon.svg` file.

## Required Icons

1. **pwa-192x192.png** - 192x192px (Android)
2. **pwa-512x512.png** - 512x512px (Android)
3. **apple-touch-icon.png** - 180x180px (iOS)

## Quick Setup Options

### Option 1: Use Online Tool

1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `icon.svg`
3. Download generated icons
4. Place them in `/public/` directory

### Option 2: Use ImageMagick (Command Line)

```bash
# Install ImageMagick first: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)

# Convert SVG to PNGs
convert -background none -resize 192x192 icon.svg public/pwa-192x192.png
convert -background none -resize 512x512 icon.svg public/pwa-512x512.png
convert -background none -resize 180x180 icon.svg public/apple-touch-icon.png
```

### Option 3: Use Figma/Design Tool

1. Open `icon.svg` in Figma or similar
2. Export at required sizes
3. Place in `/public/` directory

## Temporary Placeholder

For development, the PWA plugin will work without these icons, but you should add proper icons before production.

## Icon Design Guidelines

- Use a simple, recognizable design (coin symbol)
- Ensure icons look good at small sizes (192px)
- Use high contrast for visibility
- Follow platform guidelines:
  - iOS: 180x180px, no transparency
  - Android: 192x192px and 512x512px, can be maskable
