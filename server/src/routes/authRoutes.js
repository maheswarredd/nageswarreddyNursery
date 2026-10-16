const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist
} = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Address Management
router.post('/address', verifyToken, addAddress);
router.put('/address/:addressId', verifyToken, updateAddress);
router.delete('/address/:addressId', verifyToken, deleteAddress);

// Wishlist Management
router.post('/wishlist/toggle', verifyToken, toggleWishlist);

// Admin: Customers List
router.get('/admin/customers', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, customers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
