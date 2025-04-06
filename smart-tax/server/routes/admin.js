const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Middleware to check admin role
router.use(auth(['admin']));

// User management endpoints
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT id, username, email, role, is_approved, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved, admin_notes } = req.body;
    
    await db.promise().query(
      'UPDATE users SET is_approved = ?, admin_notes = ? WHERE id = ?',
      [is_approved, admin_notes, id]
    );
    
    res.json({ message: 'User approval status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tax Categories endpoints
router.post('/categories', async (req, res) => {
  try {
    const { name, description, tax_percentage, max_deduction } = req.body;
    
    const [result] = await db.promise().query(
      'INSERT INTO tax_categories (name, description, tax_percentage, max_deduction) VALUES (?, ?, ?, ?)',
      [name, description, tax_percentage, max_deduction]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.promise().query('SELECT * FROM tax_categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tax_percentage, max_deduction, is_active } = req.body;
    
    await db.promise().query(
      'UPDATE tax_categories SET name = ?, description = ?, tax_percentage = ?, max_deduction = ?, is_active = ? WHERE id = ?',
      [name, description, tax_percentage, max_deduction, is_active, id]
    );
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.promise().query('DELETE FROM tax_categories WHERE id = ?', [id]);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reports
router.get('/reports/users', async (req, res) => {
  try {
    const [users] = await db.promise().query(`
      SELECT 
        role, 
        COUNT(*) as total,
        SUM(is_approved) as approved,
        COUNT(*) - SUM(is_approved) as pending
      FROM users
      GROUP BY role
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/tax-filings', async (req, res) => {
  try {
    const [filings] = await db.promise().query(`
      SELECT 
        YEAR(created_at) as year,
        status,
        COUNT(*) as count,
        SUM(tax_owed) as total_tax_owed,
        SUM(tax_paid) as total_tax_paid
      FROM tax_returns
      GROUP BY YEAR(created_at), status
    `);
    res.json(filings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;