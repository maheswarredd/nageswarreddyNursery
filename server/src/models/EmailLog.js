const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  template: { type: String, required: true },
  status: { type: String, enum: ['SENT', 'LOGGED', 'FAILED'], default: 'SENT' },
  messageId: { type: String, default: '' },
  error: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
