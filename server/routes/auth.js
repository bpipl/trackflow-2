const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { compare, hash } = require('bcryptjs');
require('dotenv').config();

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    // Get user from database
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = result.rows[0];
    
    // Compare passwords
    const isValidPassword = await compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Create token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );
    
    // Transform user for response (excluding password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
    
    res.json({ 
      token,
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user (requires authentication)
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

// Register new user (admin only)
router.post('/register', authenticate, async (req, res) => {
  // Check if requester is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create new users' });
  }
  
  const { 
    username, 
    password, 
    email, 
    role = 'user',
    permissions = {} 
  } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    // Check if username already exists
    const check = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash the password
    const passwordHash = await hash(password, 10);
    
    // Insert new user
    const result = await db.query(
      `INSERT INTO users (
        username, password_hash, email, role, permissions
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, permissions`,
      [username, passwordHash, email, role, permissions]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', authenticate, async (req, res) => {
  // Check if requester is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view all users' });
  }
  
  try {
    const result = await db.query(
      'SELECT id, username, email, role, permissions FROM users ORDER BY username'
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (admin only, or self for limited fields)
router.patch('/users/:id', authenticate, async (req, res) => {
  const userId = req.params.id;
  const { 
    username, 
    password, 
    email, 
    role, 
    permissions 
  } = req.body;
  
  // Check if user is updating themselves or is admin
  const isSelf = req.user.id === userId;
  const isAdmin = req.user.role === 'admin';
  
  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'You can only update your own account unless you are an admin' });
  }
  
  // Non-admins can only update their email and password
  if (isSelf && !isAdmin && (role !== undefined || permissions !== undefined)) {
    return res.status(403).json({ error: 'You cannot update your role or permissions' });
  }
  
  try {
    // Build the update query dynamically
    let updateQuery = 'UPDATE users SET ';
    const values = [];
    const params = [];
    
    // Helper function to add params
    const addParam = (column, value) => {
      if (value !== undefined) {
        params.push(`${column} = $${params.length + 1}`);
        values.push(value);
      }
    };
    
    // Add all possible fields
    addParam('username', username);
    addParam('email', email);
    
    // If password is being updated, hash it
    if (password) {
      const passwordHash = await hash(password, 10);
      params.push(`password_hash = $${params.length + 1}`);
      values.push(passwordHash);
    }
    
    // Admin-only fields
    if (isAdmin) {
      addParam('role', role);
      if (permissions !== undefined) {
        params.push(`permissions = $${params.length + 1}`);
        values.push(permissions);
      }
    }
    
    // If no fields to update, return early
    if (params.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Complete the query
    updateQuery += params.join(', ');
    updateQuery += ` WHERE id = $${values.length + 1} RETURNING id, username, email, role, permissions`;
    values.push(userId);
    
    const result = await db.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticate, async (req, res) => {
  // Check if requester is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete users' });
  }
  
  try {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export the router and the authenticate middleware
module.exports = {
  router,
  authenticate
};
