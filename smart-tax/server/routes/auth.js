const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const [existing] = await db.promise().query(
      'SELECT id FROM users WHERE email = ? OR username = ?', 
      [email, username]
    );
    
    if (existing.length > 0) {
      throw new Error('Username or email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user (default role is taxpayer)
    const [result] = await db.promise().query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'taxpayer']
    );
    
    res.status(201).json({ message: 'User registered. Waiting for admin approval.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {

  console.log("hello");
  try {
    const { email, password } = req.body;
    
    // Find user
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
      
    // Check if approved (except for admin)
    if (!user.is_approved && user.role !== 'admin') {
      throw new Error('Account pending admin approval');  
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Create admin user if not exists
router.post('/init-admin', async (req, res) => {
  try {
    const [admins] = await db.promise().query(
      "SELECT id FROM users WHERE role = 'admin'"
    );
    
    if (admins.length > 0) {
      return res.status(400).json({ error: 'Admin already exists' });
    }
    
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    await db.promise().query(
      'INSERT INTO users (username, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@gmail.com', hashedPassword, 'admin', true]  
    );
    
    res.json({ message: 'Admin user created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In your auth routes
router.post('/init-admin', async (req, res) => {
    try {
      const [admins] = await db.promise().query(
        "SELECT id FROM users WHERE role = 'admin'"
      );
      
      if (admins.length > 0) {
        return res.status(400).json({ error: 'Admin already exists' });
      }
      
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      await db.promise().query(
        'INSERT INTO users (username, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@gmail.com', hashedPassword, 'admin', true]
      );
      
      res.json({ message: 'Admin user created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;