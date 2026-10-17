const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nageswarreddy_necessary_plants_jwt_secret_secure_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'User account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const isAdminEmail = req.user.email?.toLowerCase() === adminEmail;
const hasAdminRole = req.user.role === 'admin';

if (!isAdminEmail || !hasAdminRole) {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }

  next();
};

module.exports = { verifyToken, verifyAdmin };
