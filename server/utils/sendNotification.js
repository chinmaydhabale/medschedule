const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendNotification = async (user, notification) => {
  try {
    if (notification.type === 'email') {
      const msg = {
        to: user.email,
        from: 'chinmaydhabale26@gmail.com',
        subject: 'Appointment Notification',
        text: notification.message,
        html: `<p>${notification.message}</p>`,
      };

      await sgMail.send(msg);
      console.log(`Email sent to ${user.email}`);
    }
    // Implement SMS sending if needed
  } catch (err) {
    console.error('Error sending notification:', err.message);
  }
};

module.exports = sendNotification;