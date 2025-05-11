const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all couriers
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM couriers ORDER BY name');
    
    // Transform DB rows to expected format
    const couriers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      startingTrackingNumber: row.starting_tracking_number,
      currentTrackingNumber: row.current_tracking_number,
      endTrackingNumber: row.end_tracking_number,
      charges: {
        air: row.air_charges,
        surface: row.surface_charges,
      },
      isCustomCourier: row.is_custom_courier,
      defaultShipmentMethod: row.default_shipment_method,
      defaultPrintType: row.default_print_type,
      expressPrefix: row.express_prefix,
      expressStartingTrackingNumber: row.express_starting_tracking_number,
      expressCurrentTrackingNumber: row.express_current_tracking_number,
      expressEndTrackingNumber: row.express_end_tracking_number,
      expressCharges: row.express_air_charges ? {
        air: row.express_air_charges,
        surface: row.express_surface_charges,
      } : undefined,
      isExpressMasterToggle: row.is_express_master_toggle,
    }));
    
    res.json(couriers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get courier by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM couriers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Courier not found' });
    }
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const courier = {
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      startingTrackingNumber: row.starting_tracking_number,
      currentTrackingNumber: row.current_tracking_number,
      endTrackingNumber: row.end_tracking_number,
      charges: {
        air: row.air_charges,
        surface: row.surface_charges,
      },
      isCustomCourier: row.is_custom_courier,
      defaultShipmentMethod: row.default_shipment_method,
      defaultPrintType: row.default_print_type,
      expressPrefix: row.express_prefix,
      expressStartingTrackingNumber: row.express_starting_tracking_number,
      expressCurrentTrackingNumber: row.express_current_tracking_number,
      expressEndTrackingNumber: row.express_end_tracking_number,
      expressCharges: row.express_air_charges ? {
        air: row.express_air_charges,
        surface: row.express_surface_charges,
      } : undefined,
      isExpressMasterToggle: row.is_express_master_toggle,
    };
    
    res.json(courier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create courier
router.post('/', async (req, res) => {
  const { 
    name, prefix, startingTrackingNumber, currentTrackingNumber, endTrackingNumber,
    charges, isCustomCourier, defaultShipmentMethod, defaultPrintType,
    expressPrefix, expressStartingTrackingNumber, expressCurrentTrackingNumber,
    expressEndTrackingNumber, expressCharges, isExpressMasterToggle
  } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO couriers (
        name, prefix, starting_tracking_number, current_tracking_number, end_tracking_number,
        air_charges, surface_charges, is_custom_courier, default_shipment_method, default_print_type,
        express_prefix, express_starting_tracking_number, express_current_tracking_number,
        express_end_tracking_number, express_air_charges, express_surface_charges, is_express_master_toggle
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        name,
        prefix,
        startingTrackingNumber,
        currentTrackingNumber || startingTrackingNumber,
        endTrackingNumber,
        charges?.air,
        charges?.surface,
        isCustomCourier || false,
        defaultShipmentMethod,
        defaultPrintType,
        expressPrefix,
        expressStartingTrackingNumber,
        expressCurrentTrackingNumber || expressStartingTrackingNumber,
        expressEndTrackingNumber,
        expressCharges?.air,
        expressCharges?.surface,
        isExpressMasterToggle || false
      ]
    );
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const courier = {
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      startingTrackingNumber: row.starting_tracking_number,
      currentTrackingNumber: row.current_tracking_number,
      endTrackingNumber: row.end_tracking_number,
      charges: {
        air: row.air_charges,
        surface: row.surface_charges,
      },
      isCustomCourier: row.is_custom_courier,
      defaultShipmentMethod: row.default_shipment_method,
      defaultPrintType: row.default_print_type,
      expressPrefix: row.express_prefix,
      expressStartingTrackingNumber: row.express_starting_tracking_number,
      expressCurrentTrackingNumber: row.express_current_tracking_number,
      expressEndTrackingNumber: row.express_end_tracking_number,
      expressCharges: row.express_air_charges ? {
        air: row.express_air_charges,
        surface: row.express_surface_charges,
      } : undefined,
      isExpressMasterToggle: row.is_express_master_toggle,
    };
    
    res.status(201).json(courier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update courier
router.patch('/:id', async (req, res) => {
  const {
    name, prefix, startingTrackingNumber, currentTrackingNumber, endTrackingNumber,
    charges, isCustomCourier, defaultShipmentMethod, defaultPrintType,
    expressPrefix, expressStartingTrackingNumber, expressCurrentTrackingNumber,
    expressEndTrackingNumber, expressCharges, isExpressMasterToggle
  } = req.body;
  
  try {
    // First check if courier exists
    const check = await db.query('SELECT * FROM couriers WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Courier not found' });
    }
    
    // Build the update query dynamically
    let updateQuery = 'UPDATE couriers SET ';
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
    addParam('prefix', prefix);
    addParam('starting_tracking_number', startingTrackingNumber);
    addParam('current_tracking_number', currentTrackingNumber);
    addParam('end_tracking_number', endTrackingNumber);
    if (charges) {
      addParam('air_charges', charges.air);
      addParam('surface_charges', charges.surface);
    }
    addParam('is_custom_courier', isCustomCourier);
    addParam('default_shipment_method', defaultShipmentMethod);
    addParam('default_print_type', defaultPrintType);
    addParam('express_prefix', expressPrefix);
    addParam('express_starting_tracking_number', expressStartingTrackingNumber);
    addParam('express_current_tracking_number', expressCurrentTrackingNumber);
    addParam('express_end_tracking_number', expressEndTrackingNumber);
    if (expressCharges) {
      addParam('express_air_charges', expressCharges.air);
      addParam('express_surface_charges', expressCharges.surface);
    }
    addParam('is_express_master_toggle', isExpressMasterToggle);
    
    // If no fields to update, return the existing courier transformed
    if (params.length === 0) {
      const row = check.rows[0];
      return res.json({
        id: row.id,
        name: row.name,
        prefix: row.prefix,
        startingTrackingNumber: row.starting_tracking_number,
        currentTrackingNumber: row.current_tracking_number,
        endTrackingNumber: row.end_tracking_number,
        charges: {
          air: row.air_charges,
          surface: row.surface_charges,
        },
        isCustomCourier: row.is_custom_courier,
        defaultShipmentMethod: row.default_shipment_method,
        defaultPrintType: row.default_print_type,
        expressPrefix: row.express_prefix,
        expressStartingTrackingNumber: row.express_starting_tracking_number,
        expressCurrentTrackingNumber: row.express_current_tracking_number,
        expressEndTrackingNumber: row.express_end_tracking_number,
        expressCharges: row.express_air_charges ? {
          air: row.express_air_charges,
          surface: row.express_surface_charges,
        } : undefined,
        isExpressMasterToggle: row.is_express_master_toggle,
      });
    }
    
    // Complete the query
    updateQuery += params.join(', ');
    updateQuery += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(req.params.id);
    
    const result = await db.query(updateQuery, values);
    
    // Transform DB row to expected format
    const row = result.rows[0];
    const courier = {
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      startingTrackingNumber: row.starting_tracking_number,
      currentTrackingNumber: row.current_tracking_number,
      endTrackingNumber: row.end_tracking_number,
      charges: {
        air: row.air_charges,
        surface: row.surface_charges,
      },
      isCustomCourier: row.is_custom_courier,
      defaultShipmentMethod: row.default_shipment_method,
      defaultPrintType: row.default_print_type,
      expressPrefix: row.express_prefix,
      expressStartingTrackingNumber: row.express_starting_tracking_number,
      expressCurrentTrackingNumber: row.express_current_tracking_number,
      expressEndTrackingNumber: row.express_end_tracking_number,
      expressCharges: row.express_air_charges ? {
        air: row.express_air_charges,
        surface: row.express_surface_charges,
      } : undefined,
      isExpressMasterToggle: row.is_express_master_toggle,
    };
    
    res.json(courier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete courier
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM couriers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Courier not found' });
    }
    res.json({ message: 'Courier deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Increment tracking number
router.post('/:id/increment-tracking-number', async (req, res) => {
  const { isExpressMode = false } = req.body;
  
  try {
    // First get the courier to check current tracking number
    const courier = await db.query('SELECT * FROM couriers WHERE id = $1', [req.params.id]);
    if (courier.rows.length === 0) {
      return res.status(404).json({ error: 'Courier not found' });
    }
    
    let newNumber = 0;
    let remainingCount = 0;
    let isLow = false;
    
    if (isExpressMode) {
      // Express mode tracking number
      newNumber = (courier.rows[0].express_current_tracking_number || 0) + 1;
      remainingCount = (courier.rows[0].express_end_tracking_number || 9999) - newNumber;
      isLow = remainingCount <= 10;
      
      // Update in database
      await db.query(
        'UPDATE couriers SET express_current_tracking_number = $1 WHERE id = $2',
        [newNumber, req.params.id]
      );
    } else {
      // Standard mode tracking number
      newNumber = courier.rows[0].current_tracking_number + 1;
      remainingCount = courier.rows[0].end_tracking_number - newNumber;
      isLow = remainingCount <= 10;
      
      // Update in database
      await db.query(
        'UPDATE couriers SET current_tracking_number = $1 WHERE id = $2',
        [newNumber, req.params.id]
      );
    }
    
    res.json({ newNumber, remainingCount, isLow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
