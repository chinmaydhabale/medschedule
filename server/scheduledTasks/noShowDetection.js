// scheduledTasks/noShowDetection.js

const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendRescheduleEmail = require('../utils/sendRescheduleEmail');

// Schedule the task to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running no-show detection task...');

  try {
    const now = new Date();

    // Find appointments where the appointment end time has passed, and the patient hasn't checked in
    const missedAppointments = await Appointment.find({
      appointmentEndTime: { $lte: now },
      status: 'scheduled',
      checkInTime: null,
      rescheduleEmailSent: false,
    });

    for (const appointment of missedAppointments) {
      try {
        // Get patient information
        const patient = await User.findById(appointment.patientId);

        // Send reschedule email to the patient
        await sendRescheduleEmail(patient, appointment);

        // Update appointment status to 'no-show' and set rescheduleEmailSent to true atomically
        const updatedAppointment = await Appointment.findOneAndUpdate(
          { _id: appointment._id, rescheduleEmailSent: false },
          { $set: { status: 'no-show', rescheduleEmailSent: true } },
          { new: true }
        );

        if (!updatedAppointment) {
          // The appointment may have been updated elsewhere; handle as needed
          console.log(`Appointment ${appointment._id} was updated elsewhere before we could mark it.`);
        }
      } catch (err) {
        console.error(`Error processing appointment ${appointment._id}:`, err);
      }
    }
  } catch (err) {
    console.error('Error during no-show detection:', err);
  }
});