const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all audit logs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM audit_logs
      ORDER BY timestamp DESC
    `);
    
    // Transform DB rows to expected format
    const logs = result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      username: row.username,
      action: row.action,
      details: row.details,
    }));
    
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get audit log by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM audit_logs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const log = {
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      username: row.username,
      action: row.action,
      details: row.details,
    };
    
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create audit log
router.post('/', async (req, res) => {
  const { timestamp, userId, username, action, details } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO audit_logs (
        timestamp, user_id, username, action, details
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        timestamp || new Date().toISOString(),
        userId,
        username,
        action,
        details
      ]
    );
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const log = {
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      username: row.username,
      action: row.action,
      details: row.details,
    };
    
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get logs by date range
router.get('/filter/date-range', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  
  try {
    const result = await db.query(
      `SELECT * FROM audit_logs
       WHERE timestamp >= $1 AND timestamp <= $2
       ORDER BY timestamp DESC`,
      [startDate, endDate]
    );
    
    // Transform DB rows to expected format
    const logs = result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      username: row.username,
      action: row.action,
      details: row.details,
    }));
    
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get logs by action type
router.get('/filter/action/:action', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM audit_logs
       WHERE action = $1
       ORDER BY timestamp DESC`,
      [req.params.action]
    );
    
    // Transform DB rows to expected format
    const logs = result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      username: row.username,
      action: row.action,
      details: row.details,
    }));
    
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
