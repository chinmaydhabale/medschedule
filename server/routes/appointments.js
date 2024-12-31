const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// Create an appointment
router.post(
  '/',
  auth,
  [
    check('doctorId', 'Doctor ID is required').notEmpty(),
    check('doctorId', 'Invalid Doctor ID').isMongoId(),
    check('appointmentTime', 'Appointment time is required').notEmpty(),
    check('appointmentTime', 'Invalid appointment time').isISO8601(),
  ],
  appointmentController.createAppointment
);

// Get appointment statistics for doctor
router.get('/stats', auth, appointmentController.getAppointmentStats);

// Get a specific appointment
router.get('/:id', auth, appointmentController.getAppointmentById);

// Get user's appointments
router.get('/', auth, appointmentController.getUserAppointments);

// Update appointment status (e.g., check-in)
router.put('/:id/check-in', auth, appointmentController.checkInAppointment);

// Reschedule an appointment
router.put('/:id/reschedule', auth, appointmentController.rescheduleAppointment);


// Delete an appointment
router.delete('/:id', auth, appointmentController.deleteAppointment);


module.exports = router;