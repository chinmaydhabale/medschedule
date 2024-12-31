const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendRescheduleEmail = async (patient, appointment) => {
  try {
    const rescheduleLink = `${process.env.FRONT_URI}/reschedule/${appointment._id}`;

    const msg = {
      to: patient.email,
      from: 'chinmaydhabale26@gmail.com',
      subject: 'Missed Appointment - Reschedule Now',
      text: `Dear ${patient.name},\n\nWe noticed that you missed your appointment scheduled for ${appointment.appointmentTime.toLocaleString()}. Please click the link below to reschedule at your convenience:\n\n${rescheduleLink}\n\nThank you,\nYour Clinic Name`,
      html: `
        <p>Dear ${patient.name},</p>
        <p>We noticed that you missed your appointment scheduled for ${appointment.appointmentTime.toLocaleString()}.</p>
        <p>Please click the link below to reschedule at your convenience:</p>
        <p><a href="${rescheduleLink}">Reschedule Appointment</a></p>
        <p>Thank you,<br>Your Clinic Name</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`Reschedule email sent to ${patient.email}`);
  } catch (err) {
    console.error('Error sending reschedule email:', err);
  }
};

module.exports = sendRescheduleEmail;