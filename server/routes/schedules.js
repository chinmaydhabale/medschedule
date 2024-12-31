const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const scheduleController = require('../controllers/scheduleController');
const role = require('../middleware/role');

// Create or update schedule
router.post('/', auth, role(['doctor']), scheduleController.createOrUpdateSchedule);

// Get doctor's available slots
router.get('/doctor/:doctorId', scheduleController.getDoctorSlots);

module.exports = router;