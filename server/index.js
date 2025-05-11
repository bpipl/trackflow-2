const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const auth = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const courierRoutes = require('./routes/couriers');
const slipRoutes = require('./routes/slips');
const senderAddressRoutes = require('./routes/senderAddresses');
const auditLogRoutes = require('./routes/auditLogs');
const healthRoutes = require('./health');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Health check endpoint - must be before other routes for quick access
app.use('/health', healthRoutes);

// API Routes - using router from the exported modules
app.use('/api/auth', auth.router);
app.use('/api/customers', customerRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/slips', slipRoutes);
app.use('/api/sender-addresses', senderAddressRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Serve React app for any other request in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      status: err.status || 500
    }
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
