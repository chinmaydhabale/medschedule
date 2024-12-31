const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent',
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);