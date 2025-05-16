const db = require('../config/db');
const User = require('../models/User');

class UserController {
  static async getAllUsers(req, res) {
    try {
      // Only admin can access all users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const [users] = await db.query(
        'SELECT * FROM users WHERE role != "admin"'
      );
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async approveUser(req, res) {
    try {
      const userId = req.params.id;

      // Update the user's isApproved status to 1 (approved)
      const [result] = await db.query(
        'UPDATE users SET isApproved = 1 WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User approved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async cancelUserApproval(req, res) {
    try {
      const userId = req.params.id;

      // Update the user's isApproved status to 0 (not approved)
      const [result] = await db.query(
        'UPDATE users SET isApproved = 0 WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User approval canceled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async updateUser(req, res) {
    try {
      const { name, email, contact_number, id_number, nationality } = req.body;
      const userId = req.user.id;

      // Build the update query dynamically based on provided fields
      let updateFields = [];
      let queryParams = [];

      if (name) {
        updateFields.push('name = ?');
        queryParams.push(name);
      }
      if (email) {
        updateFields.push('email = ?');
        queryParams.push(email);
      }
      if (contact_number) {
        updateFields.push('contact_number = ?');
        queryParams.push(contact_number);
      }
      if (id_number) {
        updateFields.push('id_number = ?');
        queryParams.push(id_number);
      }
      if (nationality) {
        updateFields.push('nationality = ?');
        queryParams.push(nationality);
      }

      // If no fields to update, return early
      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      // Add the userId to the query params for the WHERE clause
      queryParams.push(userId);

      // Execute the update query
      const [result] = await db.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async deactivateUser(req, res) {
    try {
      const userId = req.user.id;

      // Update the user's isApproved status to 0 (deactivated)
      const [result] = await db.query(
        'UPDATE users SET isApproved = 0 WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = UserController;