const express = require('express');
const router = express.Router();
const { getDashboardStats, exportReportCSV } = require('../controllers/reportController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/dashboard', verifyToken, verifyAdmin, getDashboardStats);
router.get('/export-csv', verifyToken, verifyAdmin, exportReportCSV);

module.exports = router;
