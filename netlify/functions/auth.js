const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory storage for demo (replace with database in production)
let users = [];
let complaints = [];

exports.handler = async (event, context) => {
  const { method, path } = event;
  const body = JSON.parse(event.body || '{}');

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Register endpoint
    if (method === 'POST' && path.includes('/register')) {
      const { name, email, password, phone, role } = body;
      
      if (users.find(u => u.email === email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'User already exists' })
        };
      }

      const hashedPassword = await bcrypt.hash(password, 4);
      const user = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'citizen'
      };
      
      users.push(user);
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        'civigenie-super-secret-key-2024',
        { expiresIn: '24h' }
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'User registered successfully',
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        })
      };
    }

    // Login endpoint
    if (method === 'POST' && path.includes('/login')) {
      const { email, password } = body;
      
      const user = users.find(u => u.email === email);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        'civigenie-super-secret-key-2024',
        { expiresIn: '24h' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Login successful',
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
