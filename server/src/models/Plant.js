const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  categoryName: { type: String, required: true },
  images: [{ type: String, required: true }],
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0, default: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  isAvailable: { type: Boolean, default: true },
  
  // Specific required plant metrics
  plantAge: { type: String, default: '6-12 Months' },
  height: { type: String, default: '1 - 1.5 Feet' },
  potSize: { type: String, default: '6 inch Nursery Pot' },
  sunlightRequirement: { type: String, default: 'Bright Indirect Sunlight' },
  wateringRequirement: { type: String, default: 'When top inch of soil is dry' },
  soilRequirement: { type: String, default: 'Well-draining rich potting mix' },
  growingInformation: { type: String, default: '' },
  benefits: [{ type: String }],
  plantingSeason: { type: String, default: 'All Year Round' },
  deliveryInformation: { 
    type: String, 
    default: 'Safely packed in multi-layered ventilated protective boxes with moisture gel.' 
  },

  // Visibility / curation tags
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  
  // Review aggregations
  ratingsAverage: { type: Number, default: 5.0, min: 1, max: 5 },
  ratingsQuantity: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Auto-sync availability based on stock
plantSchema.pre('save', function (next) {
  if (this.stock <= 0) {
    this.isAvailable = false;
  } else if (this.isModified('stock') && this.stock > 0 && this.isAvailable === false) {
    // If stock is added and plant was not manually forced unavailable
    this.isAvailable = true;
  }
  next();
});

module.exports = mongoose.model('Plant', plantSchema);
