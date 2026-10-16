const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true }, // Verified unit price at checkout
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [orderItemSchema],

  deliveryAddress: {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    villageTown: { type: String, required: true },
    mandal: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    landmark: { type: String, default: '' },
    deliveryInstructions: { type: String, default: '' }
  },

  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  paymentMethod: { type: String, enum: ['COD', 'UPI'], required: true },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED'], 
    default: 'PENDING' 
  },
  
  upiDetails: {
    payerName: { type: String, default: '' },
    utr: { type: String, default: '' },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' }
  },

  orderStatus: {
    type: String,
    enum: [
      'PENDING',
      'PAYMENT_SUBMITTED',
      'ACCEPTED',
      'PROCESSING',
      'READY_FOR_DELIVERY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ],
    default: 'PENDING'
  },

  statusHistory: [{
    status: { type: String, required: true },
    comment: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now }
  }],

  cancellation: {
    requestedBy: { type: String, enum: ['customer', 'admin'] },
    reason: { type: String, default: '' },
    details: { type: String, default: '' },
    cancelledAt: { type: Date }
  },

  delayInfo: {
    isDelayed: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    expectedDeliveryDate: { type: Date },
    message: { type: String, default: '' },
    updatedAt: { type: Date }
  },

  deliveredAt: { type: Date },
  invoiceNumber: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
