# PWA Icons

This directory contains icons for the CiviGenie Progressive Web App.

## Required Icons

For a complete PWA experience, you need the following icons:

### Basic Icons
- `icon-16x16.png` - 16x16 favicon
- `icon-32x32.png` - 32x32 favicon
- `icon-72x72.png` - 72x72 Android icon
- `icon-96x96.png` - 96x96 Android icon
- `icon-128x128.png` - 128x128 Android icon
- `icon-144x144.png` - 144x144 Android icon
- `icon-152x152.png` - 152x152 iOS icon
- `icon-192x192.png` - 192x192 Android icon
- `icon-384x384.png` - 384x384 Android icon
- `icon-512x512.png` - 512x512 Android icon

### Shortcut Icons
- `complaint-96x96.png` - Submit complaint shortcut
- `dashboard-96x96.png` - Dashboard shortcut
- `chat-96x96.png` - AI chat shortcut

### Additional Icons
- `badge-72x72.png` - Notification badge
- `checkmark.png` - Notification action
- `xmark.png` - Notification action

## Icon Design Guidelines

1. **Design**: Use a simple, recognizable design that works at small sizes
2. **Colors**: Primary color #2563eb (blue), secondary #764ba2 (purple)
3. **Style**: Modern, clean, government/civic theme
4. **Format**: PNG with transparency
5. **Quality**: High resolution, crisp edges

## Quick Setup

For development, you can create simple placeholder icons:

1. Use an online icon generator like:
   - [PWA Builder](https://www.pwabuilder.com/imageGenerator)
   - [Real Favicon Generator](https://realfavicongenerator.net/)
   - [Favicon.io](https://favicon.io/)

2. Or create a simple SVG and convert to PNG:
   ```svg
   <svg width="512" height="512" viewBox="0 0 512 512">
     <rect width="512" height="512" fill="#2563eb" rx="64"/>
     <text x="256" y="300" font-size="200" fill="white" text-anchor="middle">🏛️</text>
   </svg>
   ```

3. Generate all required sizes using an image editor or online tool

## Testing

After adding icons:

1. Clear browser cache
2. Test install prompt on mobile devices
3. Verify icons appear correctly in app launcher
4. Check notification icons work properly

## Notes

- Icons should be square (1:1 aspect ratio)
- Use PNG format for best compatibility
- Ensure icons are readable at small sizes
- Test on both light and dark backgrounds 