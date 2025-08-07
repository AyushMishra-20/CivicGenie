# Vercel Environment Variables - Final Setup

## Required Environment Variables

Add these **exact** environment variables in Vercel's "Environment Variables" section:

### 1. MongoDB Connection String
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://ayushmishra_20:YOUR_ACTUAL_PASSWORD@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0`
- ⚠️ **Replace** `YOUR_ACTUAL_PASSWORD` with your actual MongoDB password

### 2. JWT Secret
- **Key**: `JWT_SECRET`
- **Value**: `5ea3933fc497efa86a537bf64c8ae38614c69fff9b1576e915b048ee075c31cc4399d7bf5d322d1ef0458dd97304e5e1d96f5d8b8414875b018db6f33ee0cf9c`

### 3. Node Environment
- **Key**: `NODE_ENV`
- **Value**: `production`

### 4. CORS Origin
- **Key**: `CORS_ORIGIN`
- **Value**: `https://civic-genie-client.vercel.app`

## Step-by-Step Instructions

1. **Go to Vercel Dashboard** → Your project → Settings → Environment Variables
2. **Click "+ Add More"** for each variable
3. **Add each variable** with the exact Key and Value shown above
4. **Click "Save"** after adding each variable

## Example Setup in Vercel

Your environment variables should look exactly like this:

```
Key: MONGODB_URI
Value: mongodb+srv://ayushmishra_20:your_actual_password@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0

Key: JWT_SECRET
Value: 5ea3933fc497efa86a537bf64c8ae38614c69fff9b1576e915b048ee075c31cc4399d7bf5d322d1ef0458dd97304e5e1d96f5d8b8414875b018db6f33ee0cf9c

Key: NODE_ENV
Value: production

Key: CORS_ORIGIN
Value: https://civic-genie-client.vercel.app
```

## After Adding Environment Variables

1. **Click "Deploy"** to start the deployment
2. **Wait for build** (should take 2-3 minutes now)
3. **Test your deployment**:
   - **Health check**: `https://civic-genie-client.vercel.app/api/health`
   - **Frontend**: `https://civic-genie-client.vercel.app`

## What Each Variable Does

- **MONGODB_URI**: Connects your app to MongoDB Atlas database
- **JWT_SECRET**: Secures user authentication tokens (already generated for you)
- **NODE_ENV**: Tells the app it's running in production
- **CORS_ORIGIN**: Allows your frontend to communicate with the backend

## Troubleshooting

If you still see build errors:
1. **Make sure all 4 variables are added** exactly as shown
2. **Check that the MongoDB password is correct**
3. **Verify the CORS_ORIGIN matches your Vercel domain**
4. **Redeploy after adding variables**

## Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Health endpoint returns: `{"status": "OK", "database": "Connected"}`
- ✅ Frontend loads at your Vercel domain
- ✅ You can submit complaints and view the dashboard
