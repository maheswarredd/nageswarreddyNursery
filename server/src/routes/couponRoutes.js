const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.post('/validate', validateCoupon);
router.get('/admin/all', verifyToken, verifyAdmin, getCoupons);
router.post('/admin', verifyToken, verifyAdmin, createCoupon);
router.delete('/admin/:id', verifyToken, verifyAdmin, deleteCoupon);

module.exports = router;
