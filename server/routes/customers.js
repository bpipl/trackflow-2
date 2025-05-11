const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customers ORDER BY name');
    
    // Transform DB rows to expected format with nested address
    const customers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      mobile: row.mobile,
      mobile2: row.mobile2,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
      },
      preferredCourier: row.preferred_courier,
      defaultToPayShipping: row.default_to_pay_shipping,
      notes: row.notes,
    }));
    
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const customer = {
      id: row.id,
      name: row.name,
      email: row.email,
      mobile: row.mobile,
      mobile2: row.mobile2,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
      },
      preferredCourier: row.preferred_courier,
      defaultToPayShipping: row.default_to_pay_shipping,
      notes: row.notes,
    };
    
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create customer
router.post('/', async (req, res) => {
  const { name, email, mobile, mobile2, address, preferredCourier, defaultToPayShipping, notes } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO customers (
        name, email, mobile, mobile2, address_line1, address_line2, landmark, city, state, pincode, 
        preferred_courier, default_to_pay_shipping, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        name, 
        email, 
        mobile, 
        mobile2, 
        address?.addressLine1, 
        address?.addressLine2, 
        address?.landmark, 
        address?.city, 
        address?.state, 
        address?.pincode, 
        preferredCourier, 
        defaultToPayShipping || false, 
        notes
      ]
    );
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const customer = {
      id: row.id,
      name: row.name,
      email: row.email,
      mobile: row.mobile,
      mobile2: row.mobile2,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
      },
      preferredCourier: row.preferred_courier,
      defaultToPayShipping: row.default_to_pay_shipping,
      notes: row.notes,
    };
    
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update customer
router.patch('/:id', async (req, res) => {
  const { name, email, mobile, mobile2, address, preferredCourier, defaultToPayShipping, notes } = req.body;
  
  try {
    // First check if customer exists
    const check = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Build the update query dynamically
    let updateQuery = 'UPDATE customers SET ';
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
    addParam('mobile', mobile);
    addParam('mobile2', mobile2);
    if (address) {
      addParam('address_line1', address.addressLine1);
      addParam('address_line2', address.addressLine2);
      addParam('landmark', address.landmark);
      addParam('city', address.city);
      addParam('state', address.state);
      addParam('pincode', address.pincode);
    }
    addParam('preferred_courier', preferredCourier);
    addParam('default_to_pay_shipping', defaultToPayShipping);
    addParam('notes', notes);
    
    // If no fields to update, return the existing customer transformed
    if (params.length === 0) {
      const row = check.rows[0];
      return res.json({
        id: row.id,
        name: row.name,
        email: row.email,
        mobile: row.mobile,
        mobile2: row.mobile2,
        address: {
          addressLine1: row.address_line1,
          addressLine2: row.address_line2,
          landmark: row.landmark,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
        },
        preferredCourier: row.preferred_courier,
        defaultToPayShipping: row.default_to_pay_shipping,
        notes: row.notes,
      });
    }
    
    // Complete the query
    updateQuery += params.join(', ');
    updateQuery += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(req.params.id);
    
    const result = await db.query(updateQuery, values);
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const customer = {
      id: row.id,
      name: row.name,
      email: row.email,
      mobile: row.mobile,
      mobile2: row.mobile2,
      address: {
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        landmark: row.landmark,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
      },
      preferredCourier: row.preferred_courier,
      defaultToPayShipping: row.default_to_pay_shipping,
      notes: row.notes,
    };
    
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
