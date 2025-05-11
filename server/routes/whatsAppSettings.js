const express = require('express');
const router = express.Router();
const db = require('../db');

// Import the authenticate middleware directly from auth module
// Note: auth.js exports { router, authenticate }
const authModule = require('./auth');
const authenticate = authModule.authenticate;

// Get WhatsApp settings
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM whatsapp_settings LIMIT 1');
    
    if (result.rows.length === 0) {
      // If no settings exist, create default settings
      const defaultSettings = {
        auto_send_delay: 3,
        enable_auto_send: false,
        message_template: "Hello {{customer_name}}, your shipment with tracking ID {{tracking_id}} has been sent via {{courier_name}} on {{date}}. Your package consists of {{box_count}} boxes with a total weight of {{weight}} kg.",
        start_sending_time: "10:00",
        send_delay_between_customers: 60,
        allow_manual_override: true,
        enable_batch_summary: true
      };
      
      const insertResult = await db.query(
        `INSERT INTO whatsapp_settings 
         (auto_send_delay, enable_auto_send, message_template, start_sending_time, 
          send_delay_between_customers, allow_manual_override, enable_batch_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          defaultSettings.auto_send_delay,
          defaultSettings.enable_auto_send,
          defaultSettings.message_template,
          defaultSettings.start_sending_time,
          defaultSettings.send_delay_between_customers,
          defaultSettings.allow_manual_override,
          defaultSettings.enable_batch_summary
        ]
      );
      
      res.json(insertResult.rows[0]);
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp settings' });
  }
});

// Update WhatsApp settings
router.put('/', authenticate, async (req, res) => {
  try {
    const {
      auto_send_delay,
      enable_auto_send,
      message_template,
      start_sending_time,
      send_delay_between_customers,
      allow_manual_override,
      enable_batch_summary
    } = req.body;
    
    // First check if settings exist
    const checkResult = await db.query('SELECT id FROM whatsapp_settings LIMIT 1');
    
    if (checkResult.rows.length === 0) {
      // If no settings exist, create new
      const insertResult = await db.query(
        `INSERT INTO whatsapp_settings 
         (auto_send_delay, enable_auto_send, message_template, start_sending_time, 
          send_delay_between_customers, allow_manual_override, enable_batch_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          auto_send_delay,
          enable_auto_send,
          message_template,
          start_sending_time,
          send_delay_between_customers,
          allow_manual_override,
          enable_batch_summary
        ]
      );
      
      res.json(insertResult.rows[0]);
    } else {
      // Update existing settings
      const settingsId = checkResult.rows[0].id;
      
      const updateResult = await db.query(
        `UPDATE whatsapp_settings 
         SET auto_send_delay = $1,
             enable_auto_send = $2,
             message_template = $3,
             start_sending_time = $4,
             send_delay_between_customers = $5,
             allow_manual_override = $6,
             enable_batch_summary = $7,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
        [
          auto_send_delay,
          enable_auto_send,
          message_template,
          start_sending_time,
          send_delay_between_customers,
          allow_manual_override,
          enable_batch_summary,
          settingsId
        ]
      );
      
      res.json(updateResult.rows[0]);
    }
  } catch (error) {
    console.error('Error updating WhatsApp settings:', error);
    res.status(500).json({ error: 'Failed to update WhatsApp settings' });
  }
});

module.exports = router;
