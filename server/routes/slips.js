const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all slips
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM courier_slips
      ORDER BY generated_at DESC
    `);
    
    // Transform DB rows to expected format
    const slips = result.rows.map(row => ({
      id: row.id,
      trackingId: row.tracking_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerMobile: row.customer_mobile,
      courierId: row.courier_id,
      courierName: row.courier_name,
      senderAddressId: row.sender_address_id,
      senderName: row.sender_name,
      senderAddress: row.sender_address,
      method: row.method,
      weight: row.weight,
      numberOfBoxes: row.number_of_boxes,
      boxWeights: row.box_weights,
      weighedAt: row.weighed_at,
      weighedBy: row.weighed_by,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
      charges: row.charges,
      emailSent: row.email_sent,
      isCancelled: row.is_cancelled,
      isToPayShipping: row.is_to_pay_shipping,
      isPacked: row.is_packed,
      packedAt: row.packed_at,
      packedBy: row.packed_by,
      isExpressMode: row.is_express_mode,
    }));
    
    res.json(slips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get slip by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM courier_slips WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slip not found' });
    }
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const slip = {
      id: row.id,
      trackingId: row.tracking_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerMobile: row.customer_mobile,
      courierId: row.courier_id,
      courierName: row.courier_name,
      senderAddressId: row.sender_address_id,
      senderName: row.sender_name,
      senderAddress: row.sender_address,
      method: row.method,
      weight: row.weight,
      numberOfBoxes: row.number_of_boxes,
      boxWeights: row.box_weights,
      weighedAt: row.weighed_at,
      weighedBy: row.weighed_by,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
      charges: row.charges,
      emailSent: row.email_sent,
      isCancelled: row.is_cancelled,
      isToPayShipping: row.is_to_pay_shipping,
      isPacked: row.is_packed,
      packedAt: row.packed_at,
      packedBy: row.packed_by,
      isExpressMode: row.is_express_mode,
    };
    
    res.json(slip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create slip
router.post('/', async (req, res) => {
  const {
    trackingId,
    customerId,
    customerName,
    customerAddress,
    customerMobile,
    courierId,
    courierName,
    senderAddressId,
    senderName,
    senderAddress,
    method,
    weight,
    numberOfBoxes,
    boxWeights,
    generatedBy,
    charges,
    isToPayShipping,
    isExpressMode,
  } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO courier_slips (
        tracking_id, customer_id, customer_name, customer_address, customer_mobile,
        courier_id, courier_name, sender_address_id, sender_name, sender_address,
        method, weight, number_of_boxes, box_weights, generated_by, generated_at,
        charges, email_sent, is_cancelled, is_to_pay_shipping, is_packed, is_express_mode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), $16, $17, $18, $19, $20, $21) RETURNING *`,
      [
        trackingId,
        customerId,
        customerName,
        customerAddress,
        customerMobile,
        courierId,
        courierName,
        senderAddressId,
        senderName,
        senderAddress,
        method,
        weight,
        numberOfBoxes,
        boxWeights ? JSON.stringify(boxWeights) : null,
        generatedBy,
        charges,
        false, // email_sent
        false, // is_cancelled
        isToPayShipping || false,
        false, // is_packed
        isExpressMode || false
      ]
    );
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const slip = {
      id: row.id,
      trackingId: row.tracking_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerMobile: row.customer_mobile,
      courierId: row.courier_id,
      courierName: row.courier_name,
      senderAddressId: row.sender_address_id,
      senderName: row.sender_name,
      senderAddress: row.sender_address,
      method: row.method,
      weight: row.weight,
      numberOfBoxes: row.number_of_boxes,
      boxWeights: row.box_weights,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
      charges: row.charges,
      emailSent: row.email_sent,
      isCancelled: row.is_cancelled,
      isToPayShipping: row.is_to_pay_shipping,
      isPacked: row.is_packed,
      isExpressMode: row.is_express_mode,
    };
    
    res.status(201).json(slip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update slip
router.patch('/:id', async (req, res) => {
  const {
    trackingId,
    customerId,
    customerName,
    customerAddress,
    customerMobile,
    courierId,
    courierName,
    senderAddressId,
    senderName,
    senderAddress,
    method,
    weight,
    numberOfBoxes,
    boxWeights,
    weighedBy,
    generatedBy,
    charges,
    emailSent,
    isCancelled,
    isToPayShipping,
    isPacked,
  } = req.body;
  
  try {
    // First check if slip exists
    const check = await db.query('SELECT * FROM courier_slips WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Slip not found' });
    }
    
    // Build the update query dynamically
    let updateQuery = 'UPDATE courier_slips SET ';
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
    addParam('tracking_id', trackingId);
    addParam('customer_id', customerId);
    addParam('customer_name', customerName);
    addParam('customer_address', customerAddress);
    addParam('customer_mobile', customerMobile);
    addParam('courier_id', courierId);
    addParam('courier_name', courierName);
    addParam('sender_address_id', senderAddressId);
    addParam('sender_name', senderName);
    addParam('sender_address', senderAddress);
    addParam('method', method);
    addParam('weight', weight);
    addParam('number_of_boxes', numberOfBoxes);
    
    // Handle box weights specially since it's an array that needs to be stored as JSON
    if (boxWeights !== undefined) {
      params.push(`box_weights = $${params.length + 1}`);
      values.push(JSON.stringify(boxWeights));
      
      // If box weights are updated, also update weighed_at and weighed_by
      params.push(`weighed_at = $${params.length + 1}`);
      values.push(new Date().toISOString());
      
      if (weighedBy) {
        params.push(`weighed_by = $${params.length + 1}`);
        values.push(weighedBy);
      }
    }
    
    addParam('generated_by', generatedBy);
    addParam('charges', charges);
    addParam('email_sent', emailSent);
    addParam('is_cancelled', isCancelled);
    addParam('is_to_pay_shipping', isToPayShipping);
    
    // Handle packing specially, if marking as packed add timestamp
    if (isPacked !== undefined) {
      addParam('is_packed', isPacked);
      
      if (isPacked === true && !check.rows[0].is_packed) {
        params.push(`packed_at = $${params.length + 1}`);
        values.push(new Date().toISOString());
        
        if (req.body.packedBy) {
          params.push(`packed_by = $${params.length + 1}`);
          values.push(req.body.packedBy);
        }
      }
    }
    
    // If no fields to update, return the existing slip
    if (params.length === 0) {
      // Transform the row to the expected format
      const row = check.rows[0];
      return res.json({
        id: row.id,
        trackingId: row.tracking_id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerAddress: row.customer_address,
        customerMobile: row.customer_mobile,
        courierId: row.courier_id,
        courierName: row.courier_name,
        senderAddressId: row.sender_address_id,
        senderName: row.sender_name,
        senderAddress: row.sender_address,
        method: row.method,
        weight: row.weight,
        numberOfBoxes: row.number_of_boxes,
        boxWeights: row.box_weights,
        weighedAt: row.weighed_at,
        weighedBy: row.weighed_by,
        generatedBy: row.generated_by,
        generatedAt: row.generated_at,
        charges: row.charges,
        emailSent: row.email_sent,
        isCancelled: row.is_cancelled,
        isToPayShipping: row.is_to_pay_shipping,
        isPacked: row.is_packed,
        packedAt: row.packed_at,
        packedBy: row.packed_by,
        isExpressMode: row.is_express_mode,
      });
    }
    
    // Complete the query
    updateQuery += params.join(', ');
    updateQuery += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(req.params.id);
    
    const result = await db.query(updateQuery, values);
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const slip = {
      id: row.id,
      trackingId: row.tracking_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerMobile: row.customer_mobile,
      courierId: row.courier_id,
      courierName: row.courier_name,
      senderAddressId: row.sender_address_id,
      senderName: row.sender_name,
      senderAddress: row.sender_address,
      method: row.method,
      weight: row.weight,
      numberOfBoxes: row.number_of_boxes,
      boxWeights: row.box_weights,
      weighedAt: row.weighed_at,
      weighedBy: row.weighed_by,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
      charges: row.charges,
      emailSent: row.email_sent,
      isCancelled: row.is_cancelled,
      isToPayShipping: row.is_to_pay_shipping,
      isPacked: row.is_packed,
      packedAt: row.packed_at,
      packedBy: row.packed_by,
      isExpressMode: row.is_express_mode,
    };
    
    res.json(slip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark slip as packed
router.patch('/:id/packed', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const result = await db.query(
      `UPDATE courier_slips 
       SET is_packed = true, packed_at = NOW(), packed_by = $1
       WHERE id = $2 AND is_packed = false
       RETURNING *`,
      [username, req.params.id]
    );
    
    if (result.rows.length === 0) {
      // Check if the slip exists
      const check = await db.query('SELECT * FROM courier_slips WHERE id = $1', [req.params.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Slip not found' });
      } else {
        return res.status(400).json({ error: 'Slip is already packed' });
      }
    }
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const slip = {
      id: row.id,
      trackingId: row.tracking_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerMobile: row.customer_mobile,
      courierId: row.courier_id,
      courierName: row.courier_name,
      senderAddressId: row.sender_address_id,
      senderName: row.sender_name,
      senderAddress: row.sender_address,
      method: row.method,
      weight: row.weight,
      numberOfBoxes: row.number_of_boxes,
      boxWeights: row.box_weights,
      weighedAt: row.weighed_at,
      weighedBy: row.weighed_by,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
      charges: row.charges,
      emailSent: row.email_sent,
      isCancelled: row.is_cancelled,
      isToPayShipping: row.is_to_pay_shipping,
      isPacked: row.is_packed,
      packedAt: row.packed_at,
      packedBy: row.packed_by,
      isExpressMode: row.is_express_mode,
    };
    
    res.json(slip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update box weights
router.patch('/:id/box-weights', async (req, res) => {
  const { box_weights, weight, weighed_by } = req.body;
  
  if (!box_weights || !Array.isArray(box_weights)) {
    return res.status(400).json({ error: 'Box weights must be an array' });
  }
  
  try {
    const result = await db.query(
      `UPDATE courier_slips 
       SET box_weights = $1, weight = $2, weighed_at = NOW(), weighed_by = $3
       WHERE id = $4
       RETURNING *`,
      [JSON.stringify(box_weights), weight, weighed_by, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slip not found' });
    }
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const slip = {
      id: row.id,
      trackingId: row.tracking_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerMobile: row.customer_mobile,
      courierId: row.courier_id,
      courierName: row.courier_name,
      senderAddressId: row.sender_address_id,
      senderName: row.sender_name,
      senderAddress: row.sender_address,
      method: row.method,
      weight: row.weight,
      numberOfBoxes: row.number_of_boxes,
      boxWeights: row.box_weights,
      weighedAt: row.weighed_at,
      weighedBy: row.weighed_by,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
      charges: row.charges,
      emailSent: row.email_sent,
      isCancelled: row.is_cancelled,
      isToPayShipping: row.is_to_pay_shipping,
      isPacked: row.is_packed,
      packedAt: row.packed_at,
      packedBy: row.packed_by,
      isExpressMode: row.is_express_mode,
    };
    
    res.json(slip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
