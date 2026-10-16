const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const { broadcastPush, notifyUser } = require('../services/pushService');

// Get Notifications for Current User (or Admin)
const getMyNotifications = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin
      ? { $or: [{ user: req.user._id }, { isAdminNotification: true }, { user: null }] }
      : { $or: [{ user: req.user._id }, { user: null, isAdminNotification: false }] };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// Mark Single Notification as Read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    next(error);
  }
};

// Mark All Notifications as Read
const markAllAsRead = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin
      ? { $or: [{ user: req.user._id }, { isAdminNotification: true }, { user: null }] }
      : { user: req.user._id };

    await Notification.updateMany(query, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// Subscribe to Web Push Notifications
const subscribePush = async (req, res, next) => {
  try {
    const { endpoint, expirationTime, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ success: false, message: 'Invalid subscription payload.' });
    }

    const userId = req.user ? req.user._id : null;
    const role = req.user ? req.user.role : 'guest';

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        user: userId,
        endpoint,
        expirationTime,
        keys,
        role
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: 'Subscribed to Web Push Notifications successfully.' });
  } catch (error) {
    next(error);
  }
};

// Admin: Broadcast notification
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    await notifyUser({
      title,
      message,
      type: 'OFFER',
      link: link || '/shop'
    });

    res.json({ success: true, message: 'Notification broadcasted to all users and push subscribers.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  subscribePush,
  broadcastNotification
};
