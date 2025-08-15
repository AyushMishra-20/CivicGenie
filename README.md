# 🏛️ CiviGenie - Civic Complaint Management System

A modern, AI-powered platform for citizens to report and track civic issues with role-based access for administrators and department staff.

## ✨ Features

### 🏠 **Citizen Features**
- 📝 Submit complaints with detailed descriptions
- 📍 Share precise location (live GPS or manual input)
- 📸 Attach photos from camera or gallery
- 🔔 Enable notifications for status updates
- 📊 Track complaint history and status
- 🏠 Home dashboard with quick actions

### 👨‍💼 **Administrator Features**
- 📈 Analytics dashboard with complaint trends
- 🔄 Bulk status updates
- 📤 Export complaint data
- 🏢 Department assignment management
- ⚡ Priority management system
- ⚙️ System settings configuration

### 👷 **Department Staff Features**
- 📋 View assigned complaints
- 🔄 Update complaint status
- 📊 Work completion tracking
- 🏢 Department-specific dashboard

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (optional)

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd CiviGenie

# Install dependencies
npm install

# Start development servers
npm run dev
```

Access the application at:
- **Frontend**: http://localhost:3003
- **Backend**: http://localhost:5000

## 🌐 Deployment

### Option 1: Vercel + Railway (Recommended)

#### Deploy Backend to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Deploy from GitHub
4. Set environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key
   MONGODB_URI=your-mongodb-atlas-uri
   ```

#### Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Configure:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-app.railway.app/api/complaints
   ```

### Option 2: All-in-One Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Lucide React** for icons
- **Custom CSS** with modern gradients

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Deployment
- **Vercel** for frontend hosting
- **Railway** for backend hosting
- **MongoDB Atlas** for database

## 📁 Project Structure

```
CiviGenie/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx        # Main application
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Custom middleware
│   │   └── config/        # Configuration files
│   └── package.json
├── deploy.md              # Detailed deployment guide
└── README.md              # This file
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civigenie
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com/api/complaints
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Complaint submission with location and photos
- [ ] Admin panel functionality
- [ ] Staff panel functionality
- [ ] Notification system
- [ ] Mobile responsiveness
- [ ] Image upload and camera capture
- [ ] Location sharing (GPS and manual)

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS settings include your frontend URL
   - Check environment variables are set correctly

2. **Build Failures**
   - Verify Node.js version (18+)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

3. **Database Connection**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string format

4. **Authentication Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration settings

## 📈 Performance Optimizations

- ✅ Optimized bcrypt rounds (4 for development)
- ✅ Lazy loading of components
- ✅ Efficient state management
- ✅ Optimized image handling
- ✅ Responsive design for all devices

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on auth routes
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Environment variable protection

## 📱 PWA Features

- ✅ Service worker for offline capability
- ✅ Installable on mobile devices
- ✅ Fast loading with Vite
- ✅ Responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment issues, check:
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)

---

**Built with ❤️ for better civic engagement**
