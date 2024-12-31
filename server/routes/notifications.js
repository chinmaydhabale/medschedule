const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get notifications for a user
router.get('/', auth, notificationController.getNotifications);

// Mark a notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', auth, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', auth, notificationController.deleteNotification);

// Delete all notifications
router.delete('/', auth, notificationController.deleteAllNotifications);

module.exports = router;