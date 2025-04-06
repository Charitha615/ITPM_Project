const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth(['taxpayer', 'admin']));

// Create expense
router.post('/', async (req, res) => {
  try {
    const { category_id, amount, description, date, receipt_url } = req.body;
    const [result] = await db.promise().query(
      'INSERT INTO expenses (user_id, category_id, amount, description, date, receipt_url) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, amount, description, date, receipt_url]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get expenses with filters
router.get('/', async (req, res) => {
  try {
    const { category_id, start_date, end_date, min_amount, max_amount } = req.query;
    
    let query = `
      SELECT e.*, c.name as category_name 
      FROM expenses e
      JOIN tax_categories c ON e.category_id = c.id
      WHERE e.user_id = ?
    `;
    const params = [req.user.id];
    
    if (category_id) {
      query += ' AND e.category_id = ?';
      params.push(category_id);
    }
    if (start_date) {
      query += ' AND e.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND e.date <= ?';
      params.push(end_date);
    }
    if (min_amount) {
      query += ' AND e.amount >= ?';
      params.push(min_amount);
    }
    if (max_amount) {
      query += ' AND e.amount <= ?';
      params.push(max_amount);
    }
    
    query += ' ORDER BY e.date DESC';
    
    const [expenses] = await db.promise().query(query, params);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, amount, description, date, receipt_url } = req.body;
    
    await db.promise().query(
      'UPDATE expenses SET category_id = ?, amount = ?, description = ?, date = ?, receipt_url = ? WHERE id = ? AND user_id = ?',
      [category_id, amount, description, date, receipt_url, id, req.user.id]
    );
    
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;