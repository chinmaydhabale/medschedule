const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Schedule = require('../models/Schedule');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User'); 
const sendNotification = require('../utils/sendNotification');

exports.createAppointment = async (req, res) => {
  // Only patients can book appointments
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { doctorId, appointmentTime, appointmentEndTime } = req.body;
  const patientId = req.user.id;

  try {
    // Ensure doctor exists
    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the patient already has an active appointment
    const existingAppointment = await Appointment.findOne({
      patientId: patientId,
      status: { $in: ['scheduled'] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'You already have an active appointment and cannot create another one.',
      });
    }

    // Check if slot is available
    const slotFilter = {
      doctorId,
      date: new Date(appointmentTime).toISOString().split('T')[0],
      'slots.startTime': new Date(appointmentTime),
      'slots.isBooked': false,
    };

    const schedule = await Schedule.findOne(slotFilter);

    if (!schedule) {
      return res.status(400).json({ message: 'Slot is not available' });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      appointmentTime,
      appointmentEndTime,
      status: 'scheduled',
    });

    // Update schedule slot as booked
    const slotIndex = schedule.slots.findIndex(
      (slot) => slot.startTime.toISOString() === new Date(appointmentTime).toISOString()
    );

    if (slotIndex !== -1) {
      schedule.slots[slotIndex].isBooked = true;
      schedule.slots[slotIndex].appointmentId = appointment._id;
      await schedule.save();
    } else {
      return res.status(400).json({ message: 'Slot not found in schedule' });
    }

    // Save appointment
    await appointment.save();

       // Fetch user and patient details
       const user = await User.findById(req.user.id);

    // Create a notification for the doctor
    const notification = new Notification({
      userId: doctorId,
      appointmentId: appointment._id,
      type: 'email',
      message: `A new appointment has been booked by ${user.name} for ${appointmentTime}.`,
    });

    await notification.save();

    // Create a notification for the patient
    const patientNotification = new Notification({
      userId: req.user.id,
      appointmentId: appointment._id,
      type: 'email',
      message: `You have a new appointment with Dr. ${doctor.name} for ${appointmentTime}.`,
    });

    await patientNotification.save();

 

    // Send notifications
    await sendNotification(doctor, notification);
    await sendNotification(user, patientNotification);

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// In appointments controller
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ appointment });
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getAppointmentStats = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const doctorId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointmentsCount = await Appointment.countDocuments({
      doctorId,
      appointmentTime: { $gte: today, $lt: tomorrow },
    });

    // Missed appointments
    const missedAppointmentsCount = await Appointment.countDocuments({
      doctorId,
      appointmentTime: { $lt: tomorrow },
      status: 'no-show',
    });

    // Completed today
    const completedTodayCount = await Appointment.countDocuments({
      doctorId,
      appointmentTime: { $gte: today, $lt: tomorrow },
      status: 'checked-in',
    });

    // Total patients
    const totalPatients = await Appointment.distinct('patientId', {
      doctorId,
    }).then((patients) => patients.length);

    res.json({
      todayAppointments: todayAppointmentsCount,
      missedAppointments: missedAppointmentsCount,
      completedToday: completedTodayCount,
      totalPatients: totalPatients,
    });
  } catch (err) {
    console.error('Error fetching appointment stats:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Get User's Appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ patientId: req.user.id }, { doctorId: req.user.id }],
    })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ appointmentTime: -1 }); // Sort by createdAt in descending order

    res.json({ appointments });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Check-In Appointment
exports.checkInAppointment = async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Only patient or doctor associated with the appointment can check-in
    if (
      (userRole === 'patient' && appointment.patientId.toString() !== userId) ||
      (userRole === 'doctor' && appointment.doctorId.toString() !== userId)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update appointment status
    appointment.status = 'checked-in';
    appointment.checkInTime = new Date();
    await appointment.save();

    res.json({ message: 'Checked in successfully', appointment });
  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};



// Reschedule Appointment with Transaction
exports.rescheduleAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const { newAppointmentTime } = req.body;

  if (!newAppointmentTime) {
    return res.status(400).json({ message: 'New appointment time is required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(appointmentId).session(session);

    if (!appointment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if the new slot is available and mark it as booked
    const newSlotFilter = {
      doctorId: appointment.doctorId,
      date: new Date(newAppointmentTime).toISOString().split('T')[0],
      'slots.startTime': new Date(newAppointmentTime),
      'slots.isBooked': false,
    };

    const schedule = await Schedule.findOne(newSlotFilter).session(session);

    if (!schedule) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'The selected slot is not available' });
    }

    const newSlotIndex = schedule.slots.findIndex(
      (slot) => slot.startTime.toISOString() === new Date(newAppointmentTime).toISOString()
    );

    if (newSlotIndex !== -1) {
      schedule.slots[newSlotIndex].isBooked = true;
      schedule.slots[newSlotIndex].appointmentId = appointment._id;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Slot not found in schedule' });
    }

    // Mark old slot as unbooked
    const oldSlotFilter = {
      doctorId: appointment.doctorId,
      date: appointment.appointmentTime.toISOString().split('T')[0],
      'slots.startTime': appointment.appointmentTime,
    };

    const oldSchedule = await Schedule.findOne(oldSlotFilter).session(session);

    if (oldSchedule) {
      const oldSlotIndex = oldSchedule.slots.findIndex(
        (slot) => slot.startTime.toISOString() === appointment.appointmentTime.toISOString()
      );

      if (oldSlotIndex !== -1) {
        oldSchedule.slots[oldSlotIndex].isBooked = false;
        oldSchedule.slots[oldSlotIndex].appointmentId = null;
      }
    }

    // Update appointment
    appointment.rescheduledFrom = appointment._id;
    appointment.appointmentTime = newAppointmentTime;
    appointment.status = 'scheduled';
    appointment.checkInTime = null;

    // Save all changes atomically
    await Promise.all([
      appointment.save({ session }),
      schedule.save({ session }),
      oldSchedule ? oldSchedule.save({ session }) : Promise.resolve(),
    ]);

    await session.commitTransaction();
    session.endSession();

    // Notify the doctor
    const notification = new Notification({
      userId: appointment.doctorId,
      appointmentId: appointment._id,
      type: 'email',
      message: `${req.user.name} has rescheduled their appointment to ${newAppointmentTime}.`,
    });

    await notification.save();

    const doctor = await User.findById(appointment.doctorId);
    await sendNotification(doctor, notification);

    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Delete Appointment
exports.deleteAppointment = async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Only the patient who booked the appointment or an admin can cancel it
    if (
      appointment.patientId.toString() !== userId &&
      userRole !== 'admin' &&
      (userRole !== 'doctor' || appointment.doctorId.toString() !== userId)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Mark the slot as unbooked
      const slotFilter = {
        doctorId: appointment.doctorId,
        date: appointment.appointmentTime.toISOString().split('T')[0],
        'slots.startTime': appointment.appointmentTime,
      };

      const schedule = await Schedule.findOne(slotFilter).session(session);

      if (schedule) {
        const slotIndex = schedule.slots.findIndex(
          (slot) =>
            slot.startTime.toISOString() ===
            appointment.appointmentTime.toISOString()
        );

        if (slotIndex !== -1) {
          schedule.slots[slotIndex].isBooked = false;
          schedule.slots[slotIndex].appointmentId = null;
          await schedule.save({ session });
        }
      }

      // Delete the appointment
      await Appointment.deleteOne({ _id: appointmentId }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Notify the doctor about the cancellation
      const notification = new Notification({
        userId: appointment.doctorId,
        appointmentId: appointment._id,
        type: 'email',
        message: `The appointment scheduled for ${appointment.appointmentTime} has been cancelled by the patient.`,
      });

      await notification.save();

      const doctor = await User.findById(appointment.doctorId);
      await sendNotification(doctor, notification);

      res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error during appointment cancellation:', err);
      res.status(500).json({ message: 'Server Error' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};