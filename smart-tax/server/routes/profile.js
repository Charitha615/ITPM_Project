const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth(['taxpayer', 'admin']));

// Get user profile
router.get('/', async (req, res) => {
  try {
    const [profile] = await db.promise().query(
      'SELECT * FROM tax_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json(profile[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/', async (req, res) => {
  try {
    const { tax_id, first_name, last_name, date_of_birth, address, filing_status } = req.body;
    
    // Check if profile exists
    const [existing] = await db.promise().query(
      'SELECT id FROM tax_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (existing.length > 0) {
      // Update existing
      await db.promise().query(
        `UPDATE tax_profiles SET 
          tax_id = ?, first_name = ?, last_name = ?, 
          date_of_birth = ?, address = ?, filing_status = ?
         WHERE user_id = ?`,
        [tax_id, first_name, last_name, date_of_birth, address, filing_status, req.user.id]
      );
    } else {
      // Create new
      await db.promise().query(
        `INSERT INTO tax_profiles 
          (user_id, tax_id, first_name, last_name, date_of_birth, address, filing_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, tax_id, first_name, last_name, date_of_birth, address, filing_status]
      );
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;