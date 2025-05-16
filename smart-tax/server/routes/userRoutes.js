const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Update user profile
router.put(
  '/update-profile',
  authMiddleware.protect,
  userController.updateUser
);
router.put('/deactivate',   authMiddleware.protect, userController.deactivateUser);
// Get all users (admin only)
router.get(
  '/',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  userController.getAllUsers
);

// Approve user (admin only)
router.patch(
  '/approve/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  userController.approveUser
);

// Cancel user approval (admin only)
router.patch(
  '/cancel-approval/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  userController.cancelUserApproval
);

module.exports = router;