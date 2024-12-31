// models/Appointment.js

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentTime: {
    type: Date,
    required: true,
  },
  appointmentEndTime: {
    type: Date,
    required: true, // Set to true if you store it in the database
  },
  status: {
    type: String,
    enum: ['scheduled', 'no-show','checked-in', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
  checkInTime: {
    type: Date,
  },
  rescheduleEmailSent: {
    type: Boolean,
    default: false,
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);