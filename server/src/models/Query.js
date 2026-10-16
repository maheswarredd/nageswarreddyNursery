const mongoose = require('mongoose');

const queryMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['customer', 'admin'], required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const querySchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  orderId: { type: String, default: '' },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Order problems',
      'Payment problems',
      'Delivery delays',
      'Plant information',
      'Damaged plants',
      'Wrong plants',
      'Cancellation',
      'Refunds',
      'Other issues'
    ]
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], 
    default: 'OPEN' 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'], 
    default: 'MEDIUM' 
  },
  messages: [queryMessageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Query', querySchema);
