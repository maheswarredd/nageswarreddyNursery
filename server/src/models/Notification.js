const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null means broadcast to all users/admins
  isAdminNotification: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: [
      'ORDER_PLACED',
      'PAYMENT_SUBMITTED',
      'PAYMENT_VERIFIED',
      'PAYMENT_REJECTED',
      'ORDER_ACCEPTED',
      'ORDER_PROCESSING',
      'READY_FOR_DELIVERY',
      'OUT_FOR_DELIVERY',
      'ORDER_DELIVERED',
      'ORDER_CANCELLED',
      'ORDER_DELAYED',
      'REFUND_UPDATE',
      'SUPPORT_REPLY',
      'NEW_PLANT',
      'BACK_IN_STOCK',
      'OFFER',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
