# Vercel Environment Variables - Quick Reference

## Required Environment Variables

Add these environment variables in Vercel's "Environment Variables" section:

### 1. MongoDB Connection String
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://ayushmishra_20:YOUR_ACTUAL_PASSWORD@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0`
- **Replace**: `YOUR_ACTUAL_PASSWORD` with your actual MongoDB password

### 2. JWT Secret
- **Key**: `JWT_SECRET`
- **Value**: `[Generate a secure random string]`
- **Generate**: Run this command in your terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 3. Node Environment
- **Key**: `NODE_ENV`
- **Value**: `production`

### 4. CORS Origin
- **Key**: `CORS_ORIGIN`
- **Value**: `https://civic-genie-client.vercel.app`
- **Note**: Update this with your actual Vercel domain after deployment

## How to Add in Vercel

1. **Click "+ Add More"** for each environment variable
2. **Enter the Key** (e.g., `MONGODB_URI`)
3. **Enter the Value** (e.g., your MongoDB connection string)
4. **Click "Save"** after adding each variable

## Example Setup

Your environment variables should look like this:

```
Key: MONGODB_URI
Value: mongodb+srv://ayushmishra_20:your_actual_password@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0

Key: JWT_SECRET
Value: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

Key: NODE_ENV
Value: production

Key: CORS_ORIGIN
Value: https://civic-genie-client.vercel.app
```

## Optional Environment Variables

### 5. OpenAI API Key (for AI features)
- **Key**: `OPENAI_API_KEY`
- **Value**: `your-openai-api-key`

### 6. Anthropic API Key (for AI features)
- **Key**: `ANTHROPIC_API_KEY`
- **Value**: `your-anthropic-api-key`

## After Adding Variables

1. **Click "Deploy"** to start the deployment
2. **Wait for build** (may take a few minutes)
3. **Test the deployment**:
   - Health check: `https://civic-genie-client.vercel.app/api/health`
   - Frontend: `https://civic-genie-client.vercel.app`
