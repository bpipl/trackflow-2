const { Pool } = require('pg');
require('dotenv').config();

// Import debug helper if available
let debug = { log: console.log };
try {
  debug = require('../debug');
} catch (e) {
  console.log('Debug module not available, using console.log');
}

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Configure SSL for production (Railway)
const sslConfig = isProduction ? {
  ssl: {
    rejectUnauthorized: false
  }
} : {};

// Configure other pool settings
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ...sslConfig,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
};

debug.log('Initializing database connection pool with config:', {
  ...poolConfig,
  connectionString: process.env.DATABASE_URL ? '[REDACTED]' : 'Not set'
});

// Create connection pool
const pool = new Pool(poolConfig);

// Setup event handlers for the pool
pool.on('connect', client => {
  debug.log('New database connection established');
});

pool.on('error', (err, client) => {
  debug.log('Unexpected database error on idle client:', err);
});

pool.on('remove', client => {
  debug.log('Database client removed from pool');
});

// Enhanced query function with retry logic
async function query(text, params, retryCount = 3, retryDelay = 1000) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      debug.log(`Database query attempt ${attempt}/${retryCount}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      const result = await pool.query(text, params);
      
      if (attempt > 1) {
        debug.log(`Database query succeeded after ${attempt} attempts`);
      }
      
      return result;
    } catch (err) {
      lastError = err;
      debug.log(`Database query error (attempt ${attempt}/${retryCount}):`, {
        message: err.message,
        code: err.code,
        detail: err.detail
      });
      
      if (attempt < retryCount) {
        debug.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Exponential backoff
        retryDelay *= 2;
      }
    }
  }
  
  debug.log(`Database query failed after ${retryCount} attempts`);
  throw lastError;
}

// Function to test database connection
async function testConnection() {
  try {
    debug.log('Testing database connection...');
    const result = await query('SELECT NOW() as time');
    debug.log('Database connection test successful:', result.rows[0]);
    return true;
  } catch (err) {
    debug.log('Database connection test failed:', {
      message: err.message,
      code: err.code
    });
    return false;
  }
}

// Connection health check
async function healthCheck() {
  try {
    await query('SELECT 1');
    return { connected: true, message: 'Database connection is healthy' };
  } catch (err) {
    return { 
      connected: false, 
      message: 'Database connection failed', 
      error: err.message
    };
  }
}

module.exports = {
  query,
  pool,
  testConnection,
  healthCheck
};
