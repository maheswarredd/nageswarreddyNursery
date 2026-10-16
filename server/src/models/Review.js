const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  images: [{ type: String }],
  isApproved: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
