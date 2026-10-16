const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Nageswarreddy Nursery Plants' },
  tagline: { type: String, default: 'Pure Greens, Real Health, Nursery Plants For Every Home' },
  upiId: { type: String, default: 'nageswarreddyplants@okaxis' },
  upiName: { type: String, default: 'Nageswarreddy Nursery Plants' },
  supportPhone: { type: String, default: '+91 94901 23456' },
  supportEmail: { type: String, default: 'support@nageswarreddyplants.com' },
  nurseryAddress: { 
    type: String, 
    default: 'Nageswarreddy Green Farms & Nursery, Near National Highway, Andhra Pradesh, PIN 516001, India' 
  },
  deliveryCharge: { type: Number, default: 49 },
  freeDeliveryThreshold: { type: Number, default: 499 },
  lowStockThreshold: { type: Number, default: 5 },
  announcementText: { type: String, default: '🌱 Special Monsoon Offer: Free Healthy Organic Fertilizer with every plant order!' },
  isAcceptingOrders: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
