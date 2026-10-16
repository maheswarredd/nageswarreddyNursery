const express = require('express');
const router = express.Router();
const {
  addReview,
  getPlantReviews,
  getAllReviews,
  deleteReview
} = require('../controllers/reviewController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public
router.get('/plant/:plantId', getPlantReviews);

// Customer (Must be delivered order)
router.post('/', verifyToken, addReview);

// Admin
router.get('/admin/all', verifyToken, verifyAdmin, getAllReviews);
router.delete('/admin/:id', verifyToken, verifyAdmin, deleteReview);

module.exports = router;
