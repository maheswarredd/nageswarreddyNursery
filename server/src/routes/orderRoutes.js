const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
  delayOrder,
  getInvoice
} = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Customer
router.post('/', verifyToken, createOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/cancel', verifyToken, cancelMyOrder);
router.get('/:id/invoice', verifyToken, getInvoice);

// Admin
router.get('/admin/all', verifyToken, verifyAdmin, getAllOrders);
router.put('/admin/:id/status', verifyToken, verifyAdmin, updateOrderStatus);
router.put('/admin/:id/delay', verifyToken, verifyAdmin, delayOrder);

module.exports = router;
