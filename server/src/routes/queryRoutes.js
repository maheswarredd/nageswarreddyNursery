const express = require('express');
const router = express.Router();
const {
  createQuery,
  getMyQueries,
  getQueryById,
  addMessageToQuery,
  getAllQueries,
  updateQueryStatus
} = require('../controllers/queryController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Customer
router.post('/', verifyToken, createQuery);
router.get('/my', verifyToken, getMyQueries);
router.get('/:id', verifyToken, getQueryById);
router.post('/:id/reply', verifyToken, addMessageToQuery);

// Admin
router.get('/admin/all', verifyToken, verifyAdmin, getAllQueries);
router.put('/admin/:id/status', verifyToken, verifyAdmin, updateQueryStatus);

module.exports = router;
