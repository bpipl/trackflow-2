const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import debug helper if available
let debug = { log: console.log };
try {
  debug = require('./debug');
} catch (e) {
  console.log('Debug module not available, using console.log');
}

// Static status page route - accessible without database connection
router.get('/', (req, res) => {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Flow Courier - Deployment Status</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #2d3748;
        margin-bottom: 0;
      }
      .status-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .status-card h2 {
        margin-top: 0;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 10px;
        color: #4a5568;
      }
      .success {
        color: #38a169;
        font-weight: bold;
      }
      .warning {
        color: #d69e2e;
        font-weight: bold;
      }
      .error {
        color: #e53e3e;
        font-weight: bold;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
      }
      .info-table td {
        padding: 8px;
        border-bottom: 1px solid #e2e8f0;
      }
      .info-table tr:last-child td {
        border-bottom: none;
      }
      .info-table td:first-child {
        font-weight: bold;
        width: 40%;
      }
      .links {
        margin-top: 30px;
        text-align: center;
      }
      .links a {
        display: inline-block;
        margin: 0 10px;
        padding: 10px 20px;
        background: #4299e1;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      }
      .links a:hover {
        background: #3182ce;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Track Flow Courier</h1>
      <p>Deployment Status Check</p>
    </div>
    
    <div class="status-card">
      <h2>Server Status</h2>
      <p class="success">✅ Server is running</p>
      <table class="info-table">
        <tr>
          <td>Environment</td>
          <td>${process.env.NODE_ENV || 'development'}</td>
        </tr>
        <tr>
          <td>Start Time</td>
          <td>${new Date().toISOString()}</td>
        </tr>
        <tr>
          <td>Node Version</td>
          <td>${process.version}</td>
        </tr>
        <tr>
          <td>Platform</td>
          <td>${process.platform} (${os.release()})</td>
        </tr>
      </table>
    </div>
    
    <div class="status-card">
      <h2>Frontend Status</h2>
      <p>This lightweight page is served directly from the backend. Static files status:</p>
      
      <table class="info-table">
        <tr>
          <td>Static Files Directory</td>
          <td>${path.join(__dirname, '../dist')}</td>
        </tr>
        <tr>
          <td>Directory Exists</td>
          <td>${fs.existsSync(path.join(__dirname, '../dist')) ? 
            '<span class="success">✅ Yes</span>' : 
            '<span class="error">❌ No - Build may be missing</span>'}</td>
        </tr>
        <tr>
          <td>index.html Exists</td>
          <td>${fs.existsSync(path.join(__dirname, '../dist/index.html')) ? 
            '<span class="success">✅ Yes</span>' : 
            '<span class="error">❌ No - Missing main file</span>'}</td>
        </tr>
      </table>
    </div>
    
    <div class="links">
      <a href="/health">Health Check API</a>
      <a href="/health/diagnostics">Detailed Diagnostics</a>
      <a href="/">Main Application</a>
    </div>
  </body>
  </html>
  `;
  
  res.send(htmlContent);
});

// Check frontend static files
router.get('/check-static', (req, res) => {
  const distPath = path.join(__dirname, '../dist');
  const results = {
    distExists: false,
    indexHtmlExists: false,
    staticFiles: [],
    errors: []
  };
  
  try {
    // Check if dist directory exists
    if (fs.existsSync(distPath)) {
      results.distExists = true;
      
      // Check for index.html
      if (fs.existsSync(path.join(distPath, 'index.html'))) {
        results.indexHtmlExists = true;
      }
      
      // List some static files
      try {
        const files = fs.readdirSync(distPath);
        results.staticFiles = files.slice(0, 10); // Just list first 10 files
      } catch (err) {
        results.errors.push(`Error reading dist directory: ${err.message}`);
      }
    }
  } catch (err) {
    results.errors.push(`Error checking static files: ${err.message}`);
  }
  
  res.json(results);
});

module.exports = router;
