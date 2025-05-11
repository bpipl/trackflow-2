// Health check endpoint for Railway
const express = require('express');
const router = express.Router();

// Simple health check endpoint that responds with 200 OK
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

module.exports = router;
