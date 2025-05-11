const fs = require('fs');
const path = require('path');
const db = require('./index');
require('dotenv').config();

// Max retry attempts for database connection
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000; // 3 seconds

// Helper function to wait between retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test database connection with retry logic
async function testConnection(retries = MAX_RETRIES) {
  try {
    console.log('Testing database connection...');
    await db.query('SELECT 1');
    console.log('Database connection successful!');
    return true;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Database connection failed, retrying in ${RETRY_DELAY_MS/1000} seconds... (${retries} attempts left)`);
      console.error('Connection error:', error.message);
      await sleep(RETRY_DELAY_MS);
      return testConnection(retries - 1);
    } else {
      console.error('Database connection failed after maximum retry attempts');
      throw error;
    }
  }
}

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // First ensure we can connect to the database
    await testConnection();
    
    // Read the migration SQL file
    const migrationsPath = path.join(__dirname, 'migrations.sql');
    const migrations = fs.readFileSync(migrationsPath, 'utf8');
    
    // Split migrations by semicolon to execute them one by one
    const migrationStatements = migrations
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    // Execute each migration statement
    for (let i = 0; i < migrationStatements.length; i++) {
      const statement = migrationStatements[i];
      console.log(`Executing migration ${i + 1}/${migrationStatements.length}`);
      try {
        await db.query(statement);
      } catch (err) {
        // Check if error is because table/index already exists and continue
        if (err.message.includes('already exists')) {
          console.log(`Migration ${i + 1} skipped: ${err.message}`);
        } else {
          // Otherwise rethrow the error
          throw err;
        }
      }
    }
    
    // Verify tables were created by counting them
    const tableCountResult = await db.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tableCountResult.rows[0].count);
    console.log(`Database contains ${tableCount} tables`);
    
    console.log('Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
