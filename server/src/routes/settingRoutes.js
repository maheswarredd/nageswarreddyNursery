const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', verifyToken, verifyAdmin, updateSettings);

module.exports = router;
