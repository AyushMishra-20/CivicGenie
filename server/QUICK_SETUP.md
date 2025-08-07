# Quick Setup Guide

## Option 1: MongoDB Atlas (Recommended for Development)

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)

### Step 2: Create Database
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select your preferred region
4. Click "Create"

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

### Step 4: Update Environment
Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/civigenie
PORT=5000
NODE_ENV=development
```

### Step 5: Run Migration
```bash
npm run migrate
```

## Option 2: Local MongoDB

### Install MongoDB
```bash
# Windows (using Chocolatey)
choco install mongodb

# Or download from mongodb.com
```

### Start MongoDB Service
```bash
# Windows
net start MongoDB

# Verify it's running
mongosh
```

### Run Migration
```bash
npm run migrate
```

## Option 3: Use In-Memory Database (Fallback)

If you can't set up MongoDB right now, you can temporarily use the in-memory storage:

1. Comment out the database connection in `src/app.ts`
2. Use the original in-memory routes
3. Data will be lost when server restarts

## Test the Setup

After setting up MongoDB:

1. Start the server: `npm run dev`
2. Submit a complaint through the frontend
3. Check the dashboard to see if it's saved
4. Restart the server and verify data persists

## Troubleshooting

- **Connection refused**: MongoDB not running or wrong connection string
- **Authentication failed**: Wrong username/password in Atlas
- **Network error**: Check firewall or use Atlas instead of local MongoDB 