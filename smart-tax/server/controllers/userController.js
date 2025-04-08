const User = require('../models/User');

class UserController {
  static async getAllUsers(req, res) {
    try {
      // Only admin can access all users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const [users] = await db.query('SELECT id, name, email, role FROM users');
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = UserController;