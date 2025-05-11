// Express server for Track Flow Courier application
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Railway's PostgreSQL
  }
});

// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Import health check routes
const healthRoutes = require('./health');

// Health check endpoint for Railway
app.use('/api', healthRoutes);

// Database health check (separate from the Railway healthcheck)
app.get('/api/db-health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'Database connection successful' });
  } catch (err) {
    console.error('Database connection error', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // In this simplified version, we're not using password_hash yet
    // In production, you would use bcrypt to compare passwords
    // const validPassword = await bcrypt.compare(password, user.password_hash);
    // if (!validPassword) return res.status(401).json({ error: 'Invalid username or password' });
    
    // Get user roles and permissions
    const rolesResult = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.id]
    );
    
    const permissionsResult = await pool.query(
      'SELECT permission, value FROM user_permissions WHERE user_id = $1',
      [user.id]
    );
    
    const userInfo = {
      id: user.id,
      username: user.username,
      role: rolesResult.rows.length > 0 ? rolesResult.rows[0].role : 'user',
      permissions: permissionsResult.rows.reduce((acc, curr) => {
        acc[curr.permission] = curr.value;
        return acc;
      }, {})
    };
    
    // Generate JWT token
    const token = jwt.sign(userInfo, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      user: userInfo,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login', details: err.message });
  }
});

// Get customers endpoint
app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
  }
});

// Get couriers endpoint
app.get('/api/couriers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM couriers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching couriers:', err);
    res.status(500).json({ error: 'Failed to fetch couriers', details: err.message });
  }
});

// Get sender addresses endpoint
app.get('/api/sender-addresses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sender_addresses ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sender addresses:', err);
    res.status(500).json({ error: 'Failed to fetch sender addresses', details: err.message });
  }
});

// Get slips endpoint
app.get('/api/slips', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM slips 
      ORDER BY generated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching slips:', err);
    res.status(500).json({ error: 'Failed to fetch slips', details: err.message });
  }
});

// Create a slip endpoint
app.post('/api/slips', authenticateToken, async (req, res) => {
  const {
    tracking_id,
    customer_id,
    customer_name,
    customer_address,
    customer_mobile,
    courier_id,
    courier_name,
    sender_address_id,
    sender_name,
    sender_address,
    method,
    weight,
    number_of_boxes,
    charges,
    is_to_pay_shipping,
    is_express_mode
  } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO slips (
        tracking_id, customer_id, customer_name, customer_address, customer_mobile,
        courier_id, courier_name, sender_address_id, sender_name, sender_address,
        method, weight, number_of_boxes, charges, is_to_pay_shipping,
        is_express_mode, generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *
    `, [
      tracking_id, customer_id, customer_name, customer_address, customer_mobile,
      courier_id, courier_name, sender_address_id, sender_name, sender_address,
      method, weight, number_of_boxes, charges, is_to_pay_shipping,
      is_express_mode, req.user.username
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating slip:', err);
    res.status(500).json({ error: 'Failed to create slip', details: err.message });
  }
});

// Update box weights endpoint
app.patch('/api/slips/:id/box-weights', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { box_weights, weight } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE slips 
      SET box_weights = $1, weight = $2, weighed_at = NOW(), weighed_by = $3
      WHERE id = $4
      RETURNING *
    `, [box_weights, weight, req.user.username, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slip not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating box weights:', err);
    res.status(500).json({ error: 'Failed to update box weights', details: err.message });
  }
});

// Add audit log endpoint
app.post('/api/audit-logs', authenticateToken, async (req, res) => {
  const { action, details } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO audit_logs (timestamp, user_id, username, action, details)
      VALUES (NOW(), $1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, req.user.username, action, details]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating audit log:', err);
    res.status(500).json({ error: 'Failed to create audit log', details: err.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
