# Vercel Deployment Guide for CiviGenie

This guide will help you deploy the CiviGenie application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **MongoDB Atlas**: Set up a MongoDB database (recommended) or use local MongoDB

## Step 1: Prepare Your Repository

### 1.1 Environment Variables

You'll need to set up the following environment variables in Vercel:

#### Required Environment Variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `NODE_ENV`: Set to `production`

#### Optional Environment Variables:
- `OPENAI_API_KEY`: For AI features (OpenAI integration)
- `ANTHROPIC_API_KEY`: For AI features (Anthropic integration)
- `CORS_ORIGIN`: Your Vercel domain (e.g., `https://your-app.vercel.app`)

### 1.2 Database Setup

#### Option A: MongoDB Atlas (Recommended)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Add it as `MONGODB_URI` in Vercel environment variables

**Your MongoDB Connection String:**
```
mongodb+srv://ayushmishra_20:<db_password>@cluster0.wg3bhlr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ Important:** Replace `<db_password>` with your actual MongoDB password.

#### Option B: Local MongoDB
- Not recommended for production deployment

## Step 2: Deploy to Vercel

### 2.1 Connect Your Repository

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing CiviGenie

### 2.2 Configure Build Settings

Vercel will automatically detect the configuration from `vercel.json`, but you can verify these settings:

- **Framework Preset**: Other
- **Build Command**: `npm run build` (handled by vercel.json)
- **Output Directory**: `client/dist` (handled by vercel.json)
- **Install Command**: `npm install`

### 2.3 Set Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

```bash
# Replace <db_password> with your actual MongoDB password
MONGODB_URI=mongodb+srv://ayushmishra_20:<db_password>@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

**🔑 Generate a Secure JWT Secret:**
You can generate a secure JWT secret using this command:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-app.vercel.app`

## Step 3: Verify Deployment

### 3.1 Check Health Endpoint

Visit: `https://your-app.vercel.app/api/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "Connected"
}
```

### 3.2 Test Frontend

1. Visit your Vercel domain
2. Test the complaint submission
3. Check the dashboard
4. Verify all features work

## Step 4: Post-Deployment

### 4.1 Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS settings as instructed

### 4.2 Environment Variables for Custom Domain

If you're using a custom domain, update the `CORS_ORIGIN` environment variable:

```bash
CORS_ORIGIN=https://your-custom-domain.com
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check if all dependencies are properly installed
   - Verify `vercel.json` configuration
   - Check build logs in Vercel dashboard

2. **Database Connection Fails**
   - Verify `MONGODB_URI` is correct (replace `<db_password>` with actual password)
   - Check if MongoDB Atlas IP whitelist includes Vercel
   - Ensure database user has proper permissions

3. **API Routes Not Working**
   - Check if routes are properly configured in `vercel.json`
   - Verify environment variables are set
   - Check server logs in Vercel dashboard

4. **Frontend Not Loading**
   - Check if client build completed successfully
   - Verify `outputDirectory` in `vercel.json`
   - Check if static files are being served correctly

### Debugging

1. **Check Build Logs**
   - Go to your project in Vercel dashboard
   - Click on the latest deployment
   - Check build logs for errors

2. **Check Function Logs**
   - Go to Functions tab in Vercel dashboard
   - Check serverless function logs

3. **Test Locally**
   - Run `npm run build` locally to check for build issues
   - Test the production build locally

## Maintenance

### Updates

1. Push changes to your Git repository
2. Vercel will automatically redeploy
3. Check deployment status in dashboard

### Monitoring

1. Use Vercel Analytics (if enabled)
2. Monitor function execution times
3. Check error rates in dashboard

## Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Check GitHub issues for similar problems
4. Contact Vercel support if needed

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)
- [Node.js on Vercel](https://vercel.com/docs/runtimes#official-runtimes/node-js)
