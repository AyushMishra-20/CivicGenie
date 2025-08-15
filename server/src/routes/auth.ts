import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { User, IUser } from '../models/User';
import { authenticateToken, requireRole, JWTPayload } from '../middleware/auth';
import { config } from '../config/env';
import bcrypt from 'bcryptjs';

const router = express.Router();

// In-memory user storage for fallback
const inMemoryUsers: any[] = [];

// Rate limiting for auth routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased for testing)
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again in 15 minutes'
  }
});

// Generate JWT token
const generateToken = (user: any): string => {
  const payload: JWTPayload = {
    userId: (user._id || user.id).toString(),
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' });
};

// Register new user
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, password, phone, and role are required'
      });
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (error) {
      // If database is not available, check in-memory storage
      existingUser = inMemoryUsers.find(u => u.email === email);
    }

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password (reduced salt rounds for faster development)
    const saltRounds = 4;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      isActive: true
    };

    // Try to save to database first
    let newUser;
    try {
      newUser = await User.create(userData);
    } catch (error) {
      // If database fails, save to in-memory storage
      newUser = {
        id: Date.now().toString(),
        ...userData,
        _id: Date.now().toString()
      };
      inMemoryUsers.push(newUser);
    }

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and role are required'
      });
    }

    // Find user
    let user;
    try {
      user = await User.findOne({ email, role });
    } catch (error) {
      // If database is not available, check in-memory storage
      user = inMemoryUsers.find(u => u.email === email && u.role === role);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

  // Get current user profile
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?._id;
    
    let user;
    try {
      user = await User.findById(userId).select('-password');
    } catch (error) {
      // If database is not available, check in-memory storage
      user = inMemoryUsers.find(u => (u._id || u.id) === userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        user = userWithoutPassword;
      }
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Internal server error'
    });
  }
});

  // Update user profile
  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      const userId = req.user?._id;
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.email;
    delete updates.role;

    let user;
    try {
      user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    } catch (error) {
      // If database is not available, update in-memory storage
      const userIndex = inMemoryUsers.findIndex(u => (u._id || u.id) === userId);
      if (userIndex !== -1) {
        inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...updates };
        const { password, ...userWithoutPassword } = inMemoryUsers[userIndex];
        user = userWithoutPassword;
      }
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Internal server error'
    });
  }
});

export default router; 