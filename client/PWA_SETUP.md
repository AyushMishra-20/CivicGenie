# CiviGenie PWA Setup Guide

## Overview

CiviGenie is now a Progressive Web App (PWA) that provides a native app-like experience on mobile devices with offline capabilities, push notifications, and install prompts.

## Features Implemented

### 1. **PWA Manifest** (`/public/manifest.json`)
- App metadata and configuration
- Icons for different screen sizes
- Theme colors and display settings
- App shortcuts for quick access
- Screenshots for app store listings

### 2. **Service Worker** (`/public/sw.js`)
- Offline caching for static files and API responses
- Background sync for offline complaints
- Push notification handling
- Cache management and updates

### 3. **Offline Functionality**
- **Offline Complaint Submission**: Users can submit complaints when offline
- **Local Storage**: Complaints are saved in IndexedDB
- **Background Sync**: Automatically syncs when connection is restored
- **Offline Page**: Custom offline experience

### 4. **Push Notifications**
- **Permission Management**: Request and manage notification permissions
- **Subscription Management**: Subscribe/unsubscribe to push notifications
- **Notification Types**: Different notification preferences
- **Rich Notifications**: Actions and custom styling

### 5. **Install Prompt**
- **Native Install**: Prompt users to install the app
- **Install Criteria**: Meets PWA install requirements
- **App Shortcuts**: Quick access to key features

### 6. **Mobile Optimizations**
- **Responsive Design**: Works on all screen sizes
- **Touch-Friendly**: Optimized for touch interactions
- **Fast Loading**: Cached resources for quick access
- **Native Feel**: App-like navigation and interactions

## File Structure

```
client/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── offline.html           # Offline page
│   └── icons/                 # PWA icons
│       ├── icon-192x192.svg
│       ├── icon-512x512.svg
│       └── ...
├── src/
│   ├── utils/
│   │   └── pwaService.ts      # PWA service utilities
│   ├── components/
│   │   ├── PWAInstallPrompt.tsx
│   │   ├── OfflineIndicator.tsx
│   │   └── NotificationSettings.tsx
│   └── App.tsx               # Updated with PWA components
└── index.html               # Updated with PWA meta tags
```

## Setup Instructions

### 1. **Generate Icons**
```bash
cd client
node scripts/generate-icons.js
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Build and Serve**
```bash
npm run build
npm run preview
```

### 4. **Test PWA Features**

#### Install Prompt
- Open the app in Chrome/Edge
- Look for the install prompt in the address bar
- Or use the install button in the app

#### Offline Testing
1. Open Chrome DevTools
2. Go to Network tab
3. Check "Offline"
4. Try submitting a complaint
5. Uncheck "Offline" to test sync

#### Push Notifications
1. Click the notification bell icon
2. Grant notification permissions
3. Subscribe to notifications
4. Test notification delivery

## PWA Requirements Checklist

### ✅ **Manifest**
- [x] Valid JSON manifest
- [x] App name and description
- [x] Icons (192x192, 512x512)
- [x] Theme colors
- [x] Display mode (standalone)
- [x] Start URL

### ✅ **Service Worker**
- [x] Registered service worker
- [x] Offline functionality
- [x] Cache strategies
- [x] Background sync
- [x] Push notifications

### ✅ **HTTPS**
- [x] Served over HTTPS (required for PWA)
- [x] Local development with localhost

### ✅ **Responsive Design**
- [x] Mobile-first design
- [x] Touch-friendly interface
- [x] Fast loading times
- [x] Smooth animations

### ✅ **Install Experience**
- [x] Install prompt
- [x] App shortcuts
- [x] Splash screen
- [x] Native app feel

## Browser Support

### **Full PWA Support**
- Chrome (Android/Desktop)
- Edge (Windows/Android)
- Safari (iOS 11.3+)
- Firefox (Android/Desktop)

### **Partial Support**
- Samsung Internet
- UC Browser
- Opera

### **No Support**
- Internet Explorer
- Old Safari versions

## Testing Tools

### **Chrome DevTools**
- Application tab for PWA debugging
- Service Worker debugging
- Manifest validation
- Storage inspection

### **Lighthouse**
- PWA audit
- Performance metrics
- Accessibility testing
- Best practices

### **PWA Builder**
- Manifest validation
- Icon generation
- Store listings

## Production Deployment

### **Vercel/Netlify**
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### **Custom Server**
1. Build the app: `npm run build`
2. Serve the `dist` folder
3. Ensure HTTPS is enabled
4. Configure service worker caching

### **Environment Variables**
```env
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_API_URL=your_api_url
```

## Troubleshooting

### **Install Prompt Not Showing**
- Check if app meets install criteria
- Verify manifest is valid
- Ensure HTTPS is enabled
- Clear browser cache

### **Service Worker Not Registering**
- Check browser console for errors
- Verify service worker file exists
- Ensure HTTPS/localhost
- Check browser support

### **Offline Not Working**
- Verify service worker is active
- Check cache storage
- Test network conditions
- Review service worker code

### **Push Notifications Not Working**
- Check notification permissions
- Verify VAPID keys
- Test subscription creation
- Review server-side implementation

## Performance Optimization

### **Caching Strategy**
- Static files: Cache-first
- API responses: Network-first with cache fallback
- Images: Cache with size limits
- Dynamic content: Stale-while-revalidate

### **Bundle Optimization**
- Code splitting
- Tree shaking
- Lazy loading
- Compression

### **Image Optimization**
- WebP format
- Responsive images
- Lazy loading
- Compression

## Security Considerations

### **HTTPS Required**
- All PWA features require HTTPS
- Local development uses localhost exception
- Production must use valid SSL certificate

### **Service Worker Security**
- Same-origin policy
- No access to cross-origin resources
- Secure context required

### **Push Notifications**
- VAPID key authentication
- User permission required
- Secure subscription storage

## Future Enhancements

### **Advanced Features**
- [ ] Background sync with periodic sync
- [ ] Web Share API integration
- [ ] File system access
- [ ] Web Bluetooth integration
- [ ] Payment request API

### **Performance**
- [ ] Workbox for advanced caching
- [ ] Image optimization
- [ ] Bundle analysis
- [ ] Performance monitoring

### **User Experience**
- [ ] App-like navigation
- [ ] Gesture support
- [ ] Haptic feedback
- [ ] Biometric authentication

## Support

For PWA-related issues:
1. Check browser console for errors
2. Verify PWA requirements are met
3. Test on different devices/browsers
4. Review this documentation
5. Check browser compatibility tables

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse) 