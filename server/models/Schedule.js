const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Store date as 'YYYY-MM-DD'
    required: true,
  },
  slots: [
    {
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);