const express = require('express');
const router = express.Router();
const db = require('./db');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Import debug helper if available
let debug = { log: console.log };
try {
  debug = require('./debug');
} catch (e) {
  console.log('Debug module not available, using console.log');
}

// Enhanced health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbResult = await db.query('SELECT 1');
    
    // Get system info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: Math.floor(process.uptime()),
      memory: {
        total: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
        free: `${Math.round(os.freemem() / (1024 * 1024))} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      },
      cpuCount: os.cpus().length,
      processId: process.pid
    };
    
    // Everything is ok
    res.status(200).json({ 
      status: 'ok', 
      environment: process.env.NODE_ENV,
      time: new Date().toISOString(),
      database: { connected: true },
      system: systemInfo
    });
    
    // Log health check for debugging
    debug.log('Health check successful', { time: new Date().toISOString() });
  } catch (err) {
    // Database connection issue
    console.error('Health check failed:', err);
    
    // Get system info even if DB fails
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: Math.floor(process.uptime()),
      memory: {
        total: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
        free: `${Math.round(os.freemem() / (1024 * 1024))} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      }
    };
    
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      errorDetails: err.message,
      environment: process.env.NODE_ENV,
      system: systemInfo
    });
    
    // Log health check failure for debugging
    debug.log('Health check failed', { error: err.message, time: new Date().toISOString() });
  }
});

// Add a detailed diagnostic endpoint
router.get('/diagnostics', async (req, res) => {
  const diagnostics = {
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: Math.floor(process.uptime()),
      memory: {
        total: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
        free: `${Math.round(os.freemem() / (1024 * 1024))} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      },
      cpuCount: os.cpus().length
    },
    process: {
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'Not set'
    }
  };
  
  // Check database connection
  try {
    await db.query('SELECT 1');
    diagnostics.database = { connected: true };
    
    // Try to get database table count if connected
    try {
      const tablesResult = await db.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name=t.table_name) AS columns
        FROM information_schema.tables t
        WHERE table_schema = 'public'
      `);
      
      diagnostics.database.tables = tablesResult.rows;
    } catch (e) {
      diagnostics.database.tablesError = e.message;
    }
  } catch (err) {
    diagnostics.database = { 
      connected: false,
      error: err.message
    };
  }
  
  res.json(diagnostics);
  
  // Log diagnostics check for debugging
  debug.log('Diagnostics check performed', { time: diagnostics.time });
});

module.exports = router;
