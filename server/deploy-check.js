/**
 * Pre-deployment check script for Track Flow Courier
 * Run this script before deploying to verify all necessary components
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

console.log('\n=== TRACK FLOW COURIER DEPLOYMENT CHECK ===\n');

// Check environment
console.log('Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Not set ✗');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
console.log('- PORT:', process.env.PORT || '3001 (default)');

// Check file structure
console.log('\nFile Structure Check:');

const requiredFiles = [
  'server/index.js',
  'server/health.js',
  'server/db/index.js',
  'server/db/migrations.sql',
  'server/db/runMigrations.js',
  'server/routes/auth.js',
  'server/routes/customers.js',
  'server/routes/couriers.js',
  'server/routes/slips.js',
  'server/routes/senderAddresses.js',
  'server/routes/auditLogs.js',
  'server/routes/whatsAppSettings.js',
  'server/routes/templates.js'
];

const missingFiles = [];
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`- ${file}: Found ✓`);
  } else {
    console.log(`- ${file}: Missing ✗`);
    missingFiles.push(file);
  }
}

// Check for production configuration
console.log('\nProduction Configuration Check:');
const railwayFileExists = fs.existsSync(path.join(__dirname, '..', 'railway.json'));
console.log('- railway.json:', railwayFileExists ? 'Found ✓' : 'Missing ✗');

const procfileExists = fs.existsSync(path.join(__dirname, '..', 'Procfile'));
console.log('- Procfile:', procfileExists ? 'Found ✓' : 'Missing ✗');

// Check migration SQL for required tables
console.log('\nDatabase Schema Check:');
const migrationPath = path.join(__dirname, 'db', 'migrations.sql');
const migrations = fs.readFileSync(migrationPath, 'utf8');

const requiredTables = [
  'users', 
  'user_roles', 
  'user_permissions', 
  'customers', 
  'couriers', 
  'sender_addresses', 
  'slips', 
  'audit_logs',
  'whatsapp_settings',
  'templates', 
  'reports'
];

const missingTables = [];
for (const table of requiredTables) {
  if (migrations.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
    console.log(`- Table ${table}: Found in schema ✓`);
  } else {
    console.log(`- Table ${table}: Missing from schema ✗`);
    missingTables.push(table);
  }
}

// Try to connect to database
console.log('\nDatabase Connection Test:');
async function testDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    console.log('- Connection test skipped: DATABASE_URL not set');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    const client = await pool.connect();
    console.log('- Database connection: Success ✓');
    
    // Check if tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = res.rows.map(row => row.table_name);
    console.log(`- Found ${existingTables.length} tables in database`);
    
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`  - Table ${table}: Exists in database ✓`);
      } else {
        console.log(`  - Table ${table}: Not in database yet, will be created by migrations ⚠️`);
      }
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.log('- Database connection: Failed ✗');
    console.log(`  Error: ${error.message}`);
  }
}

// Summary and recommendations
async function runChecks() {
  await testDatabaseConnection();
  
  console.log('\n=== SUMMARY ===');
  
  if (missingFiles.length > 0) {
    console.log('\n⚠️ Missing files:', missingFiles.join(', '));
    console.log('These files need to be created before deployment.');
  } else {
    console.log('\n✓ All required files are present.');
  }
  
  if (missingTables.length > 0) {
    console.log('\n⚠️ Missing tables in schema:', missingTables.join(', '));
    console.log('These tables need to be added to migrations.sql.');
  } else {
    console.log('\n✓ All required tables are in the schema.');
  }
  
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
    console.log('\n⚠️ NODE_ENV is not set to production');
    console.log('Set NODE_ENV=production in your .env file or Railway environment variables.');
  }
  
  if (!process.env.DATABASE_URL) {
    console.log('\n⚠️ DATABASE_URL is not set');
    console.log('Set DATABASE_URL in your .env file or Railway environment variables.');
  }
  
  if (!process.env.JWT_SECRET) {
    console.log('\n⚠️ JWT_SECRET is not set');
    console.log('Set JWT_SECRET in your .env file or Railway environment variables.');
  }
  
  console.log('\nDeployment Check Complete!');
}

runChecks();
