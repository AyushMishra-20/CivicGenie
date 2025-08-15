# 🚀 CiviGenie Deployment Guide

## Quick Deployment to Vercel + Railway

### Step 1: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your CiviGenie repository**
5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here
   MONGODB_URI=your-mongodb-atlas-uri
   ```
6. **Deploy!** Railway will automatically detect it's a Node.js app

### Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/Login with GitHub**
3. **Click "New Project" → "Import Git Repository"**
4. **Select your CiviGenie repository**
5. **Configure:**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Add Environment Variable:**
   ```
   VITE_API_URL=https://your-railway-app-url.railway.app/api/complaints
   ```
7. **Deploy!**

### Step 3: Update API URLs

After deployment, update these files:

1. **In `client/src/App.tsx`:**
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'https://your-railway-url.railway.app/api/complaints';
   ```

2. **In `client/src/App.tsx` (auth functions):**
   ```typescript
   const response = await fetch('https://your-railway-url.railway.app/api/auth/login', {
   ```

### Step 4: Test Your Deployment

1. **Frontend**: `https://your-app.vercel.app`
2. **Backend**: `https://your-app.railway.app/api/health`

## Alternative: All-in-One Deployment

### Option A: Vercel (Frontend + Backend)

1. **Deploy to Vercel** (handles both frontend and backend)
2. **Set environment variables in Vercel dashboard**
3. **Done!**

### Option B: Netlify + Render

1. **Frontend**: Deploy to Netlify
2. **Backend**: Deploy to Render
3. **Update API URLs accordingly**

## Environment Variables Needed

### Backend (.env)
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civigenie
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com/api/complaints
```

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test user login
- [ ] Test complaint submission
- [ ] Test admin panel
- [ ] Test staff panel
- [ ] Verify notifications work
- [ ] Check mobile responsiveness
- [ ] Test image upload
- [ ] Test location sharing

## Troubleshooting

### Common Issues:
1. **CORS errors**: Add your frontend URL to backend CORS settings
2. **API 404**: Check if API routes are properly configured
3. **Build failures**: Check Node.js version compatibility
4. **Environment variables**: Ensure all required vars are set

### Support:
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
