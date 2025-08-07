# Vercel Environment Variables Setup

## Correct Format for Environment Variables

Make sure to set up the environment variables with the correct **Key** and **Value** format:

### 1. MongoDB Connection String
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://ayushmishra_20:YOUR_ACTUAL_PASSWORD@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0`

### 2. JWT Secret
- **Key**: `JWT_SECRET`
- **Value**: `[Generate a secure random string]`

### 3. Node Environment
- **Key**: `NODE_ENV`
- **Value**: `production`

### 4. CORS Origin
- **Key**: `CORS_ORIGIN`
- **Value**: `https://civic-genie.vercel.app`

## How to Add Environment Variables in Vercel

1. **Click "+ Add More"** to add each environment variable
2. **For each variable**:
   - **Key field**: Enter the variable name (e.g., `MONGODB_URI`)
   - **Value field**: Enter the actual value (e.g., your MongoDB connection string)
3. **Click "Save"** after adding each variable

## Current Status Check

Based on what I can see, you need to:

1. **Verify the Key/Value format** - Make sure:
   - Key: `MONGODB_URI`
   - Value: Your complete MongoDB connection string

2. **Add the remaining required variables**:
   - `JWT_SECRET`
   - `NODE_ENV`
   - `CORS_ORIGIN`

3. **Test the connection** after deployment by visiting:
   - `https://civic-genie.vercel.app/api/health`

## Quick Verification

After adding all environment variables, your setup should look like:

```
Key: MONGODB_URI
Value: mongodb+srv://ayushmishra_20:YOUR_PASSWORD@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0

Key: JWT_SECRET
Value: [your-generated-secret]

Key: NODE_ENV
Value: production

Key: CORS_ORIGIN
Value: https://civic-genie.vercel.app
```

Once you have all these set up correctly, you can click **"Deploy"**!
