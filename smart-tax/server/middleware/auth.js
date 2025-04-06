const jwt = require('jsonwebtoken');
const db = require('../db');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [user] = await db.promise().query(
        'SELECT * FROM users WHERE id = ? AND is_approved = TRUE',
        [decoded.id]
      );

      if (!user[0]) {
        throw new Error('User not found or not approved');
      }

      if (roles.length > 0 && !roles.includes(user[0].role)) {
        throw new Error('Insufficient permissions');
      }

      req.user = user[0];
      req.token = token;
      next();
    } catch (error) {
      res.status(401).send({ error: error.message });
    }
  };
};

module.exports = auth;