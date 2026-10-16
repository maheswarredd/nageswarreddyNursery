const express = require('express');
const router = express.Router();
const { getEmailLogs } = require('../controllers/emailLogController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/admin/all', verifyToken, verifyAdmin, getEmailLogs);

module.exports = router;
