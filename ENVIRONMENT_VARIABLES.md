# Environment Variables for Vercel Deployment

## Required Environment Variables

Copy these environment variables to your Vercel project settings:

### 1. MongoDB Connection String
```bash
MONGODB_URI=mongodb+srv://ayushmishra_20:<db_password>@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ Important:** Replace `<db_password>` with your actual MongoDB password.

### 2. JWT Secret
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**🔑 Generate a Secure JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Node Environment
```bash
NODE_ENV=production
```

### 4. CORS Origin
```bash
CORS_ORIGIN=https://your-app.vercel.app
```

## Optional Environment Variables

### 5. OpenAI API Key (for AI features)
```bash
OPENAI_API_KEY=your-openai-api-key
```

### 6. Anthropic API Key (for AI features)
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your CiviGenie project
3. Click on "Settings" tab
4. Click on "Environment Variables"
5. Add each variable one by one:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://ayushmishra_20:<your_actual_password>@cluster0.wg3bhlr.mongodb.net/civigenie?retryWrites=true&w=majority&appName=Cluster0`
   - **Environment**: Production (and Preview if needed)

6. Repeat for all other environment variables
7. Click "Save" after adding each variable

## Verification

After setting up environment variables:

1. **Redeploy** your application in Vercel
2. **Test the health endpoint**: `https://your-app.vercel.app/api/health`
3. **Check the response**:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "database": "Connected"
   }
   ```

## Troubleshooting

### Database Connection Issues
- Verify your MongoDB password is correct
- Check if MongoDB Atlas IP whitelist includes Vercel
- Ensure the database user has proper permissions

### JWT Issues
- Make sure JWT_SECRET is a strong, random string
- Regenerate if you suspect it's compromised

### CORS Issues
- Update CORS_ORIGIN with your actual Vercel domain
- Include the full URL (https://your-app.vercel.app)
