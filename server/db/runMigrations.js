const fs = require('fs');
const path = require('path');
const db = require('./index');
require('dotenv').config();

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
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
      await db.query(statement);
    }
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
