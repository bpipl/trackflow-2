const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all sender addresses
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sender_addresses ORDER BY name');
    
    // Transform DB rows to expected format
    const senderAddresses = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      mobile: row.mobile,
      mobile2: row.mobile2,
      gstNumber: row.gst_number,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        district: row.district,
        state: row.state,
        pincode: row.pincode,
      },
      isDefault: row.is_default,
    }));
    
    res.json(senderAddresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get sender address by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sender_addresses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sender address not found' });
    }
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const senderAddress = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      mobile: row.mobile,
      mobile2: row.mobile2,
      gstNumber: row.gst_number,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        district: row.district,
        state: row.state,
        pincode: row.pincode,
      },
      isDefault: row.is_default,
    };
    
    res.json(senderAddress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create sender address
router.post('/', async (req, res) => {
  const { 
    name, email, phone, mobile, mobile2, gstNumber, address, isDefault 
  } = req.body;
  
  try {
    let newIsDefault = isDefault;
    
    // If this is set as default, unset any current default
    if (isDefault) {
      await db.query('UPDATE sender_addresses SET is_default = false WHERE is_default = true');
    } 
    // If no default is set and this is the first address, make it default
    else if (!isDefault) {
      const count = await db.query('SELECT COUNT(*) FROM sender_addresses');
      if (count.rows[0].count === '0') {
        newIsDefault = true;
      }
    }
    
    const result = await db.query(
      `INSERT INTO sender_addresses (
        name, email, phone, mobile, mobile2, gst_number, 
        address_line1, address_line2, landmark, city, district, state, pincode, 
        is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        name,
        email,
        phone,
        mobile,
        mobile2,
        gstNumber,
        address?.addressLine1,
        address?.addressLine2,
        address?.landmark,
        address?.city,
        address?.district,
        address?.state,
        address?.pincode,
        newIsDefault
      ]
    );
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const senderAddress = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      mobile: row.mobile,
      mobile2: row.mobile2,
      gstNumber: row.gst_number,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        district: row.district,
        state: row.state,
        pincode: row.pincode,
      },
      isDefault: row.is_default,
    };
    
    res.status(201).json(senderAddress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update sender address
router.patch('/:id', async (req, res) => {
  const { 
    name, email, phone, mobile, mobile2, gstNumber, address, isDefault 
  } = req.body;
  
  try {
    // First check if sender address exists
    const check = await db.query('SELECT * FROM sender_addresses WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Sender address not found' });
    }
    
    // If setting this as default, unset any current default
    if (isDefault === true) {
      await db.query('UPDATE sender_addresses SET is_default = false WHERE is_default = true');
    }
    
    // Build the update query dynamically
    let updateQuery = 'UPDATE sender_addresses SET ';
    const values = [];
    const params = [];
    
    // Helper function to add params
    const addParam = (column, value) => {
      if (value !== undefined) {
        params.push(`${column} = $${params.length + 1}`);
        values.push(value);
      }
    };
    
    // Add all possible fields
    addParam('name', name);
    addParam('email', email);
    addParam('phone', phone);
    addParam('mobile', mobile);
    addParam('mobile2', mobile2);
    addParam('gst_number', gstNumber);
    if (address) {
      addParam('address_line1', address.addressLine1);
      addParam('address_line2', address.addressLine2);
      addParam('landmark', address.landmark);
      addParam('city', address.city);
      addParam('district', address.district);
      addParam('state', address.state);
      addParam('pincode', address.pincode);
    }
    addParam('is_default', isDefault);
    
    // If no fields to update, return the existing sender address
    if (params.length === 0) {
      const row = check.rows[0];
      return res.json({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        mobile: row.mobile,
        mobile2: row.mobile2,
        gstNumber: row.gst_number,
        address: {
          addressLine1: row.address_line1,
          addressLine2: row.address_line2,
          landmark: row.landmark,
          city: row.city,
          district: row.district,
          state: row.state,
          pincode: row.pincode,
        },
        isDefault: row.is_default,
      });
    }
    
    // Complete the query
    updateQuery += params.join(', ');
    updateQuery += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(req.params.id);
    
    const result = await db.query(updateQuery, values);
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const senderAddress = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      mobile: row.mobile,
      mobile2: row.mobile2,
      gstNumber: row.gst_number,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        district: row.district,
        state: row.state,
        pincode: row.pincode,
      },
      isDefault: row.is_default,
    };
    
    res.json(senderAddress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete sender address
router.delete('/:id', async (req, res) => {
  try {
    // Check if we're trying to delete the default address
    const check = await db.query('SELECT is_default FROM sender_addresses WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Sender address not found' });
    }
    
    // Count total addresses
    const count = await db.query('SELECT COUNT(*) FROM sender_addresses');
    if (count.rows[0].count === '1') {
      return res.status(400).json({ error: 'Cannot delete the only sender address' });
    }
    
    // If deleting the default address, set another one as default
    if (check.rows[0].is_default) {
      const nextDefault = await db.query(
        'SELECT id FROM sender_addresses WHERE id != $1 LIMIT 1',
        [req.params.id]
      );
      
      if (nextDefault.rows.length > 0) {
        await db.query(
          'UPDATE sender_addresses SET is_default = true WHERE id = $1',
          [nextDefault.rows[0].id]
        );
      }
    }
    
    // Delete the address
    await db.query('DELETE FROM sender_addresses WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Sender address deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
