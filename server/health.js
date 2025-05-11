const express = require('express');
const router = express.Router();
const db = require('./db');

// A simple health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Everything is ok
    res.status(200).json({ 
      status: 'ok', 
      environment: process.env.NODE_ENV,
      time: new Date().toISOString()
    });
  } catch (err) {
    // Database connection issue
    console.error('Health check failed:', err);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      environment: process.env.NODE_ENV
    });
  }
});

module.exports = router;
