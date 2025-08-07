# PWA Testing Guide for Mobile Devices

## Quick Setup for Phone Testing

### 1. Find Your Computer's IP Address

First, we need to find your computer's IP address so your phone can connect to it:

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.0.x.x)

**On Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

### 2. Start the Development Server

The development server should already be running. If not, run:
```bash
cd client
npm run dev
```

### 3. Access from Your Phone

1. **Connect both devices to the same WiFi network**
2. **On your phone, open the browser** (Chrome, Safari, or Firefox)
3. **Navigate to:** `http://[YOUR_COMPUTER_IP]:5173`
   
   Example: `http://192.168.1.100:5173`

### 4. Test PWA Features

#### ✅ Install Prompt
- Look for the "Install App" banner or prompt
- On Android: Chrome should show "Add to Home Screen"
- On iOS: Use Safari's "Add to Home Screen" option

#### ✅ Offline Functionality
1. Submit a complaint while online
2. Turn off WiFi/mobile data
3. Try to submit another complaint
4. Check if it shows "Offline Mode" indicator
5. Turn internet back on and verify sync

#### ✅ Pull-to-Refresh
- Pull down on the dashboard to refresh data
- Should see loading animation

#### ✅ Auto-Save Drafts
1. Start filling out a complaint form
2. Navigate away without submitting
3. Return to the form - data should be auto-saved

#### ✅ Smart Sync Indicator
- Look for sync status in the top-right corner
- Should show connection status and sync progress

#### ✅ Push Notifications (if implemented)
- Accept notification permissions
- Test notification delivery

## Advanced Testing

### Chrome DevTools (Desktop)
1. Open Chrome DevTools (F12)
2. Click the device icon (mobile/tablet icon)
3. Select a mobile device
4. Test PWA features in mobile view

### Lighthouse PWA Audit
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Check "Progressive Web App"
4. Click "Generate report"
5. Review PWA score and recommendations

### Service Worker Testing
1. Open Chrome DevTools
2. Go to "Application" tab
3. Click "Service Workers" in left sidebar
4. Check if service worker is registered and active
5. Test offline functionality

## Troubleshooting

### Can't Access from Phone?
- **Check firewall settings** - allow port 5173
- **Verify same network** - both devices must be on same WiFi
- **Try different browser** - some browsers handle localhost differently

### PWA Not Installing?
- **Use HTTPS** - PWAs require secure connection for install
- **Check manifest.json** - ensure all required fields are present
- **Clear browser cache** - old cached files might interfere

### Offline Not Working?
- **Check service worker** - ensure it's registered and active
- **Verify cache strategy** - check if files are being cached
- **Test in incognito mode** - eliminates cache issues

## Production Testing

For production testing, you'll need to:
1. Build the project: `npm run build`
2. Deploy to a hosting service (Vercel, Netlify, etc.)
3. Access via HTTPS URL
4. Test all PWA features in production environment

## Expected PWA Score

Your PWA should achieve:
- ✅ **Installable** - Can be installed on home screen
- ✅ **PWA Optimized** - Fast loading and responsive
- ✅ **Offline Support** - Works without internet
- ✅ **Modern Image Formats** - Uses optimized images
- ✅ **Accessibility** - Screen reader friendly

## Quick Commands

```bash
# Start development server
cd client && npm run dev

# Build for production
cd client && npm run build

# Preview production build
cd client && npm run preview

# Check PWA manifest
curl http://localhost:5173/manifest.json

# Check service worker
curl http://localhost:5173/sw.js
```

## Next Steps

After testing:
1. **Fix any issues** found during testing
2. **Optimize performance** based on Lighthouse scores
3. **Deploy to production** for real-world testing
4. **Gather user feedback** on PWA experience
5. **Implement additional features** from PWA_ENHANCEMENTS.md
