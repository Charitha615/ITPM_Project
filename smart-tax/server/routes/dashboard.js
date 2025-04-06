const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth(['taxpayer', 'admin']));

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const [expenses] = await db.promise().query(
      `SELECT 
        COUNT(*) as expense_count,
        SUM(amount) as total_expenses,
        MAX(date) as last_expense_date
       FROM expenses 
       WHERE user_id = ?`,
      [req.user.id]
    );
    
    const [categories] = await db.promise().query(
      `SELECT 
        c.name,
        COUNT(e.id) as count
       FROM tax_categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = ?
       GROUP BY c.id
       ORDER BY count DESC
       LIMIT 1`,
      [req.user.id]
    );
    
    const [deductions] = await db.promise().query(
      `SELECT 
        SUM(e.amount * (c.tax_percentage / 100)) as total_deductions
       FROM expenses e
       JOIN tax_categories c ON e.category_id = c.id
       WHERE e.user_id = ?`,
      [req.user.id]
    );
    
    const [recentExpenses] = await db.promise().query(
      `SELECT 
        e.id, e.amount, e.date, e.description,
        c.name as category_name
       FROM expenses e
       JOIN tax_categories c ON e.category_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.date DESC
       LIMIT 5`,
      [req.user.id]
    );
    
    res.json({
      total_expenses: expenses[0].total_expenses || 0,
      expense_count: expenses[0].expense_count || 0,
      last_expense_date: expenses[0].last_expense_date || null,
      top_category: categories[0]?.name || null,
      total_deductions: deductions[0].total_deductions || 0,
      recent_expenses: recentExpenses
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;