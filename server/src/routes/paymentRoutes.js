const express = require('express');
const router = express.Router();
const {
  getUpiDetails,
  submitUpiPayment,
  verifyUpiPayment,
  rejectUpiPayment,
  getAllPayments
} = require('../controllers/paymentController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public / Customer UPI info
router.get('/upi-info/:orderId?', getUpiDetails);

// Customer: Submit UTR
router.post('/submit-upi', verifyToken, submitUpiPayment);

// Admin: Payments management
router.get('/admin/all', verifyToken, verifyAdmin, getAllPayments);
router.put('/admin/verify/:orderId', verifyToken, verifyAdmin, verifyUpiPayment);
router.put('/admin/reject/:orderId', verifyToken, verifyAdmin, rejectUpiPayment);

module.exports = router;
