const express = require('express');
const router = express.Router();
const db = require('../db');

// Import the authenticate middleware directly from auth module
// Note: auth.js exports { router, authenticate }
const authModule = require('./auth');
const authenticate = authModule.authenticate;

// Get all templates
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get templates by courier type
router.get('/by-courier/:courierType', authenticate, async (req, res) => {
  try {
    const { courierType } = req.params;
    const result = await db.query(
      'SELECT * FROM templates WHERE courier_type = $1 ORDER BY created_at DESC',
      [courierType]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates by courier type:', error);
    res.status(500).json({ error: 'Failed to fetch templates by courier type' });
  }
});

// Get template by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM templates WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching template by ID:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create a new template
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      html,
      css,
      json,
      courier_type,
      is_default
    } = req.body;
    
    // Check if this is being set as a default template
    if (is_default) {
      // If so, unset default for all other templates of this courier type
      await db.query(
        'UPDATE templates SET is_default = false WHERE courier_type = $1',
        [courier_type]
      );
    }
    
    const result = await db.query(
      `INSERT INTO templates 
       (name, html, css, json, courier_type, is_default)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, html, css, json, courier_type, is_default]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update a template
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      html,
      css,
      json,
      courier_type,
      is_default
    } = req.body;
    
    // Check if this is being set as a default template
    if (is_default) {
      // If so, unset default for all other templates of this courier type
      await db.query(
        'UPDATE templates SET is_default = false WHERE courier_type = $1 AND id != $2',
        [courier_type, id]
      );
    }
    
    const result = await db.query(
      `UPDATE templates 
       SET name = $1,
           html = $2,
           css = $3,
           json = $4,
           courier_type = $5,
           is_default = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, html, css, json, courier_type, is_default, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete a template
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template is default before deletion
    const checkResult = await db.query(
      'SELECT is_default, courier_type FROM templates WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Don't allow deletion of default templates
    if (checkResult.rows[0].is_default) {
      return res.status(400).json({ error: 'Cannot delete a default template' });
    }
    
    await db.query('DELETE FROM templates WHERE id = $1', [id]);
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Initialize default templates if none exist
router.post('/init-defaults', authenticate, async (req, res) => {
  try {
    // Check if any templates exist
    const checkResult = await db.query('SELECT COUNT(*) FROM templates');
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Templates already exist, initialization skipped' 
      });
    }
    
    // Default courier types
    const courierTypes = ['trackon', 'steel', 'globalprimex', 'shree'];
    
    // Create default templates for each courier type
    for (const courierType of courierTypes) {
      await db.query(
        `INSERT INTO templates 
         (name, html, css, json, courier_type, is_default)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [
          `Default ${courierType.charAt(0).toUpperCase() + courierType.slice(1)} Template`,
          '', // Empty HTML
          '', // Empty CSS
          '{}', // Empty JSON
          courierType
        ]
      );
    }
    
    res.status(201).json({ message: 'Default templates initialized successfully' });
  } catch (error) {
    console.error('Error initializing default templates:', error);
    res.status(500).json({ error: 'Failed to initialize default templates' });
  }
});

module.exports = router;
