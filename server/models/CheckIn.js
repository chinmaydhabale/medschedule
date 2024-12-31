// models/CheckIn.js

const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', CheckInSchema);