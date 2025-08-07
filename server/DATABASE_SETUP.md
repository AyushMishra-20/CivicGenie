# Database Setup Guide

## MongoDB Integration

CiviGenie now uses MongoDB for persistent data storage. This guide will help you set up the database.

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud service)

2. **Node.js Dependencies**
   - All required packages are already installed: `mongoose`, `dotenv`

## Setup Instructions

### Option 1: Local MongoDB

1. **Install MongoDB locally**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb
   
   # macOS (using Homebrew)
   brew install mongodb-community
   
   # Linux (Ubuntu)
   sudo apt-get install mongodb
   ```

2. **Start MongoDB service**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # Should connect to MongoDB shell
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a free account

2. **Create a cluster**
   - Choose "Free" tier
   - Select your preferred region
   - Create cluster

3. **Get connection string**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update environment variables**
   ```bash
   # Create .env file in server directory
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civigenie
   ```

## Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/civigenie

# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key_here
```

## Database Migration

Run the migration script to set up the database:

```bash
cd server
npm run migrate
```

This will:
- Connect to MongoDB
- Create necessary indexes
- Verify database setup

## Database Schema

### Complaint Collection

The main collection stores complaint data with the following structure:

```typescript
{
  _id: ObjectId,
  user: String,
  description: String,
  language: "en" | "hi" | "mr",
  category: "roads" | "garbage" | "water" | "electricity" | "sewage" | "traffic" | "streetlight" | "other",
  status: "open" | "in_progress" | "resolved",
  priority: "low" | "medium" | "high" | "urgent",
  department: String,
  estimatedResolutionTime: String,
  keywords: [String],
  confidence: Number,
  suggestions: [String],
  photos: [String],
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  notificationPreferences: {
    enabled: Boolean,
    email: String,
    phone: String,
    browserNotifications: Boolean,
    statusUpdates: Boolean,
    resolutionUpdates: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

The following indexes are automatically created for optimal performance:

- `{ status: 1, createdAt: -1 }` - For status-based queries
- `{ category: 1, status: 1 }` - For category filtering
- `{ priority: 1, status: 1 }` - For priority filtering
- `{ 'location.city': 1, status: 1 }` - For location-based queries
- `{ user: 1, createdAt: -1 }` - For user-specific queries

## API Endpoints

The database integration adds several new endpoints:

- `GET /api/complaints/stats/overview` - Get complaint statistics
- `GET /api/complaints/user/:user` - Get complaints by user
- `GET /api/complaints/search/:term` - Search complaints
- `PATCH /api/complaints/:id/notifications` - Update notification preferences
- `DELETE /api/complaints/:id` - Delete complaint (admin)

## Troubleshooting

### Connection Issues

1. **MongoDB not running**
   ```bash
   # Check if MongoDB is running
   mongosh
   # If connection fails, start MongoDB service
   ```

2. **Wrong connection string**
   - Verify your `MONGODB_URI` in `.env`
   - For Atlas, ensure username/password are correct
   - Check if IP is whitelisted (for Atlas)

3. **Permission issues**
   - Ensure MongoDB has write permissions
   - Check if database directory exists

### Data Issues

1. **Empty database**
   - Run `npm run migrate` to set up indexes
   - Submit a test complaint to verify functionality

2. **Migration errors**
   - Check MongoDB connection
   - Verify database permissions
   - Check console for specific error messages

## Backup and Restore

### Backup
```bash
# Local MongoDB
mongodump --db civigenie --out ./backup

# Atlas (using mongodump)
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/civigenie" --out ./backup
```

### Restore
```bash
# Local MongoDB
mongorestore --db civigenie ./backup/civigenie

# Atlas
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/civigenie" ./backup/civigenie
```

## Performance Tips

1. **Use indexes** - All necessary indexes are created automatically
2. **Limit query results** - Use pagination for large datasets
3. **Use lean queries** - Service layer uses `.lean()` for better performance
4. **Monitor query performance** - Use MongoDB Compass for query analysis

## Next Steps

After setting up the database:

1. **Test the application** - Submit a complaint and verify it's saved
2. **Check the dashboard** - Verify complaints are displayed correctly
3. **Test notifications** - Ensure notification preferences are saved
4. **Monitor performance** - Check database performance under load 