const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  subscribePush,
  broadcastNotification
} = require('../controllers/notificationController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/my', verifyToken, getMyNotifications);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/mark-all-read', verifyToken, markAllAsRead);

// Web Push subscription (accessible to authenticated users & guests)
router.post('/subscribe', (req, res, next) => {
  // If authorization header exists, verify token, otherwise proceed as guest
  if (req.headers.authorization) {
    return verifyToken(req, res, next);
  }
  next();
}, subscribePush);

// Admin broadcast
router.post('/broadcast', verifyToken, verifyAdmin, broadcastNotification);

module.exports = router;
