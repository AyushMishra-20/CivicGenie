# CiviGenie Deployment Guide

## Frontend Deployment (Netlify)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your `CivicGenie` repository
   - Set build settings:
     - **Base directory**: `client`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

## Backend Deployment (Cyclic.sh) - FREE, NO CREDIT CARD REQUIRED

1. **Deploy to Cyclic**:
   - Go to [cyclic.sh](https://cyclic.sh) and sign up/login with GitHub
   - Click "Link Your Own" → "Connect GitHub"
   - Select your `CivicGenie` repository
   - Configure the app:
     - **Root Directory**: `server`
     - **Branch**: `main`
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A random secret string (e.g., `your-super-secret-jwt-key-here`)
     - `NODE_ENV`: `production`
   - Click "Deploy"

2. **Get your backend URL**:
   - Once deployed, Cyclic will give you a URL like: `https://civigenie-backend.cyclic.app`
   - Copy this URL

3. **Update frontend API URL**:
   - In your Netlify deployment, go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://civigenie-backend.cyclic.app`
   - Redeploy the site

## Alternative Backend Platforms (All Free)

### Option 1: Glitch.com (No Credit Card Required)
- Go to [glitch.com](https://glitch.com)
- Create new project → Import from GitHub
- Select your repository
- Set environment variables in `.env` file
- Get your app URL and update frontend

### Option 2: Replit.com (No Credit Card Required)
- Go to [replit.com](https://replit.com)
- Create new Node.js repl
- Import from GitHub
- Set environment variables
- Deploy and get URL

### Option 3: Heroku (Free Tier - No Credit Card for Basic)
- Go to [heroku.com](https://heroku.com)
- Create new app
- Connect GitHub repository
- Set environment variables
- Deploy

## Troubleshooting

### Common Issues:
1. **Build fails**: Check if all dependencies are in `package.json`
2. **Port issues**: Make sure backend uses `process.env.PORT`
3. **CORS errors**: Backend should allow frontend domain
4. **Database connection**: Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Environment Variables Checklist:
- [ ] `MONGODB_URI` (MongoDB connection string)
- [ ] `JWT_SECRET` (random secret string)
- [ ] `NODE_ENV` (production)
- [ ] `PORT` (platform default)
- [ ] `VITE_API_URL` (frontend only - backend URL)

## Quick Test
After deployment:
1. Frontend should load at your Netlify URL
2. Try creating an account
3. Try logging in
4. Check browser console for any errors
5. Check backend logs for any issues
