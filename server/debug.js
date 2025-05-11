// Debug helper script for Railway deployment
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create a log directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Log file path
const logFilePath = path.join(logDir, 'startup-debug.log');

// Logger function
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (data) {
    if (typeof data === 'object') {
      logMessage += '\n' + JSON.stringify(data, null, 2);
    } else {
      logMessage += ` ${data}`;
    }
  }
  
  logMessage += '\n';
  
  // Write to file
  fs.appendFileSync(logFilePath, logMessage);
  
  // Also output to console
  console.log(logMessage);
}

// Log system info
function logSystemInfo() {
  log('=== SYSTEM INFORMATION ===');
  log('Node Version:', process.version);
  log('Platform:', process.platform);
  log('Architecture:', process.arch);
  log('Memory:', {
    total: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
    free: `${Math.round(os.freemem() / (1024 * 1024))} MB`
  });
  log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : 'Not set'
  });
}

// Log the current directory structure
function logDirectoryStructure() {
  log('=== DIRECTORY STRUCTURE ===');
  
  function readDirRecursive(dir, level = 0) {
    const indent = '  '.repeat(level);
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      // Skip node_modules and logs directory
      if (file === 'node_modules' || file === 'logs') continue;
      
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        log(`${indent}📁 ${file}/`);
        readDirRecursive(filePath, level + 1);
      } else {
        log(`${indent}📄 ${file}`);
      }
    }
  }
  
  readDirRecursive(path.join(__dirname, '..'));
}

// Test database connection
async function testDatabaseConnection() {
  log('=== DATABASE CONNECTION TEST ===');
  
  try {
    const db = require('./db');
    log('Attempting to connect to database...');
    
    const result = await db.query('SELECT NOW() as time');
    log('Database connection successful:', result.rows[0]);
    
    // Test table existence
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    log('Database tables:', tables.rows.map(row => row.table_name));
    
    return true;
  } catch (error) {
    log('Database connection failed:', {
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

// Main debug function
async function runDebug() {
  try {
    log('Starting debug script...');
    logSystemInfo();
    logDirectoryStructure();
    
    const dbConnected = await testDatabaseConnection();
    
    // Final status
    if (dbConnected) {
      log('Debug completed successfully. Database connection is working.');
    } else {
      log('Debug completed with errors. Check database connection.');
    }
  } catch (error) {
    log('Error running debug script:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Export functions for use in other files
module.exports = {
  log,
  runDebug
};

// Run debug if this file is executed directly
if (require.main === module) {
  runDebug();
}
