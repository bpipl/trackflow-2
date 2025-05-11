#!/usr/bin/env node

/**
 * Railway CLI Diagnostic Tool for Track Flow Courier
 * 
 * Usage via Railway CLI:
 * 1. Install Railway CLI: curl -fsSL https://railway.app/install.sh | sh
 * 2. railway link -p 9f8ad38f-5de4-4d1c-bf79-4dd97985a270
 * 3. railway run node server/railway-cli-diagnostics.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const http = require('http');
const { Pool } = require('pg');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}==============================================${RESET}`);
console.log(`${BOLD}🔍 RAILWAY DEPLOYMENT DIAGNOSTIC TOOL${RESET}`);
console.log(`${BOLD}==============================================${RESET}\n`);

async function runDiagnostics() {
  // System information
  console.log(`${BOLD}📊 SYSTEM INFORMATION${RESET}`);
  console.log(`Node Version: ${process.version}`);
  console.log(`Platform: ${process.platform} (${os.release()})`);
  console.log(`Architecture: ${os.arch()}`);
  console.log(`Memory: ${Math.round(os.totalmem() / (1024 * 1024))} MB`);
  console.log(`Free Memory: ${Math.round(os.freemem() / (1024 * 1024))} MB`);
  console.log(`CPU Cores: ${os.cpus().length}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log();

  // Environment variables
  console.log(`${BOLD}🔐 ENVIRONMENT VARIABLES${RESET}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
  console.log(`PORT: ${process.env.PORT || 'Not set'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  
  // Check for other important variables
  const envMissing = [];
  ['JWT_SECRET', 'JWT_EXPIRES_IN'].forEach(envVar => {
    if (!process.env[envVar]) {
      envMissing.push(envVar);
    }
  });
  
  if (envMissing.length > 0) {
    console.log(`${YELLOW}⚠️ Missing environment variables: ${envMissing.join(', ')}${RESET}`);
  } else {
    console.log(`All key environment variables are set`);
  }
  console.log();

  // File system checks
  console.log(`${BOLD}📁 FILE SYSTEM CHECKS${RESET}`);
  
  // Check for dist directory
  const distPath = path.join(process.cwd(), 'dist');
  const distExists = fs.existsSync(distPath);
  
  if (distExists) {
    console.log(`${GREEN}✅ Frontend build directory (dist/) exists${RESET}`);
    
    // Check for index.html
    const indexHtmlPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      console.log(`${GREEN}✅ index.html exists${RESET}`);
      
      // Print file size and last modified date
      const stats = fs.statSync(indexHtmlPath);
      console.log(`   - Size: ${Math.round(stats.size / 1024)} KB`);
      console.log(`   - Last modified: ${stats.mtime}`);
    } else {
      console.log(`${RED}❌ index.html does not exist in dist directory${RESET}`);
    }
    
    // List some files in dist
    try {
      console.log(`Top 5 files in dist directory:`);
      const distFiles = fs.readdirSync(distPath).slice(0, 5);
      distFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
      
      if (distFiles.length === 0) {
        console.log(`${YELLOW}⚠️ No files found in dist directory${RESET}`);
      }
    } catch (err) {
      console.log(`${RED}❌ Error reading dist directory: ${err.message}${RESET}`);
    }
  } else {
    console.log(`${RED}❌ Frontend build directory (dist/) does not exist${RESET}`);
    console.log(`   This is likely why the application is not responding.`);
    console.log(`   Run "npm run build" locally, then commit and push the dist folder.`);
  }
  console.log();

  // Check server files
  console.log(`${BOLD}🖥️ SERVER FILES${RESET}`);
  const serverDir = path.join(process.cwd(), 'server');
  if (fs.existsSync(serverDir)) {
    console.log(`${GREEN}✅ Server directory exists${RESET}`);
    
    // Check key server files
    const serverFiles = ['index.js', 'health.js', 'db/index.js', 'db/runMigrations.js'];
    const missingServerFiles = [];
    
    serverFiles.forEach(file => {
      const filePath = path.join(serverDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`   - ${file}: ${GREEN}✅ exists${RESET}`);
      } else {
        missingServerFiles.push(file);
        console.log(`   - ${file}: ${RED}❌ missing${RESET}`);
      }
    });
    
    if (missingServerFiles.length > 0) {
      console.log(`${YELLOW}⚠️ Some server files are missing!${RESET}`);
    }
  } else {
    console.log(`${RED}❌ Server directory does not exist${RESET}`);
  }
  console.log();

  // Database connection test
  console.log(`${BOLD}🗄️ DATABASE CONNECTION TEST${RESET}`);
  if (process.env.DATABASE_URL) {
    try {
      // Configure pool with SSL if in production
      const isProduction = process.env.NODE_ENV === 'production';
      const sslConfig = isProduction ? {
        ssl: {
          rejectUnauthorized: false
        }
      } : {};
      
      // Create connection pool
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ...sslConfig,
        connectionTimeoutMillis: 5000, // Reduce timeout for diagnostics
      });
      
      // Test query
      const startTime = Date.now();
      const result = await pool.query('SELECT NOW() as time');
      const endTime = Date.now();
      
      console.log(`${GREEN}✅ Database connection successful${RESET}`);
      console.log(`   - Response time: ${endTime - startTime}ms`);
      console.log(`   - Current database time: ${result.rows[0].time}`);
      
      // Check tables
      const tablesResult = await pool.query(`
        SELECT count(*) FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      const tableCount = parseInt(tablesResult.rows[0].count);
      
      console.log(`   - Tables found: ${tableCount}`);
      
      if (tableCount === 0) {
        console.log(`${RED}❌ No tables found in the database!${RESET}`);
        console.log(`   This suggests migrations didn't run correctly.`);
      } else if (tableCount < 11) {
        console.log(`${YELLOW}⚠️ Expected at least 11 tables, but found ${tableCount}${RESET}`);
        console.log(`   Some migrations may not have run properly.`);
      } else {
        console.log(`${GREEN}✅ Expected number of tables present${RESET}`);
      }
      
      // List tables
      const tableListResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      console.log(`   - Table list:`);
      tableListResult.rows.forEach(row => {
        console.log(`     • ${row.table_name}`);
      });
      
      // End pool
      await pool.end();
    } catch (err) {
      console.log(`${RED}❌ Database connection failed: ${err.message}${RESET}`);
      console.log(`   Error details: ${err.stack.split('\n')[0]}`);
      
      if (err.message.includes('no pg_hba.conf entry for host')) {
        console.log(`   This suggests a network connectivity issue between your app and database.`);
        console.log(`   Check that your DATABASE_URL is correctly referenced from PostgreSQL.`);
      }
      
      if (err.message.includes('SSL')) {
        console.log(`   This suggests an SSL configuration issue.`);
        console.log(`   Try setting NODE_TLS_REJECT_UNAUTHORIZED=0 temporarily to debug.`);
      }
    }
  } else {
    console.log(`${RED}❌ DATABASE_URL is not set${RESET}`);
    console.log(`   The application cannot connect to the database without this.`);
    console.log(`   Set this in Railway variables to reference your PostgreSQL instance.`);
  }
  console.log();

  // Network connectivity
  console.log(`${BOLD}🌐 NETWORK CONNECTIVITY${RESET}`);
  console.log(`Internal IP addresses:`);
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      if (iface.family === 'IPv4') {
        console.log(`   - ${interfaceName}: ${iface.address}`);
      }
    });
  });
  
  // Check if port is occupied
  const port = process.env.PORT || 3001;
  try {
    const server = http.createServer();
    server.listen(port);
    
    // Give it a moment to detect if the port is actually available
    await new Promise(resolve => {
      server.on('listening', () => {
        console.log(`${GREEN}✅ Port ${port} is available${RESET}`);
        server.close(() => resolve());
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`${YELLOW}⚠️ Port ${port} is already in use${RESET}`);
          console.log(`   This suggests that another instance of the server is already running.`);
        } else {
          console.log(`${RED}❌ Error checking port ${port}: ${err.message}${RESET}`);
        }
        resolve();
      });
    });
  } catch (err) {
    console.log(`${RED}❌ Error checking port: ${err.message}${RESET}`);
  }
  console.log();

  // Procfile check
  console.log(`${BOLD}📄 PROCFILE CHECK${RESET}`);
  const procfilePath = path.join(process.cwd(), 'Procfile');
  if (fs.existsSync(procfilePath)) {
    const procfileContent = fs.readFileSync(procfilePath, 'utf8');
    console.log(`${GREEN}✅ Procfile exists${RESET}`);
    console.log(`   Content: ${procfileContent.trim()}`);
    
    if (!procfileContent.includes('node server/index.js')) {
      console.log(`${YELLOW}⚠️ Procfile might not be correctly configured${RESET}`);
      console.log(`   Expected "web: node server/index.js" or similar.`);
    }
  } else {
    console.log(`${YELLOW}⚠️ Procfile does not exist${RESET}`);
    console.log(`   Railway might be using default start command.`);
  }
  console.log();

  // Check Railway configuration
  console.log(`${BOLD}🚂 RAILWAY CONFIGURATION${RESET}`);
  const railwayJsonPath = path.join(process.cwd(), 'railway.json');
  if (fs.existsSync(railwayJsonPath)) {
    try {
      const railwayJson = JSON.parse(fs.readFileSync(railwayJsonPath, 'utf8'));
      console.log(`${GREEN}✅ railway.json exists${RESET}`);
      console.log(`   Content: ${JSON.stringify(railwayJson, null, 2)}`);
    } catch (err) {
      console.log(`${RED}❌ Error parsing railway.json: ${err.message}${RESET}`);
    }
  } else {
    console.log(`${YELLOW}⚠️ railway.json does not exist${RESET}`);
    console.log(`   This file is used to configure Railway-specific settings.`);
  }
  console.log();

  // Check for running processes
  console.log(`${BOLD}⚙️ RUNNING PROCESSES${RESET}`);
  try {
    // On Linux (which Railway uses), this command works
    const processes = execSync('ps aux', { encoding: 'utf8' });
    
    // Look for node processes
    const nodeProcesses = processes.split('\n')
      .filter(line => line.includes('node'))
      .map(line => line.trim());
    
    if (nodeProcesses.length > 0) {
      console.log(`Found ${nodeProcesses.length} Node.js processes:`);
      nodeProcesses.forEach(process => {
        console.log(`   - ${process}`);
      });
    } else {
      console.log(`${YELLOW}⚠️ No Node.js processes found running${RESET}`);
      console.log(`   This suggests the application may not be running.`);
    }
  } catch (err) {
    console.log(`${YELLOW}⚠️ Could not check running processes: ${err.message}${RESET}`);
  }
  console.log();

  // Summary and recommendations
  console.log(`${BOLD}📋 DIAGNOSTIC SUMMARY${RESET}`);
  
  if (!process.env.DATABASE_URL) {
    console.log(`${RED}❌ CRITICAL: DATABASE_URL environment variable is not set${RESET}`);
    console.log(`   - Set DATABASE_URL to reference your PostgreSQL service`);
    console.log(`   - In Railway UI: Add variable reference from PostgreSQL to your app`);
  }
  
  if (!distExists) {
    console.log(`${RED}❌ CRITICAL: Frontend build (dist/ directory) is missing${RESET}`);
    console.log(`   - Run "npm run build" locally`);
    console.log(`   - Commit and push the dist folder`);
    console.log(`   - Or set up a build step in Railway`);
  }
  
  console.log(`\n${BOLD}==============================================${RESET}`);
  console.log(`${BOLD}🔧 NEXT STEPS${RESET}`);
  console.log(`${BOLD}==============================================${RESET}`);
  console.log(`1. Check if your application's DATABASE_URL correctly references the PostgreSQL service`);
  console.log(`2. Ensure your frontend is built and the dist/ directory is pushed to Railway`);
  console.log(`3. Verify that the server is configured to serve the static files correctly`);
  console.log(`4. If issues persist, try redeploying the application`);
  console.log(`5. For more detailed Railway help: https://docs.railway.app/troubleshoot/fixing-common-errors`);
}

// Run the diagnostics
runDiagnostics()
  .then(() => {
    console.log('\nDiagnostics completed!');
  })
  .catch(err => {
    console.error(`Error running diagnostics: ${err.message}`);
  });
