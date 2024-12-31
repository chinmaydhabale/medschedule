const Schedule = require('../models/Schedule');
const { validationResult } = require('express-validator');

// Create or Update Schedule
exports.createOrUpdateSchedule = async (req, res) => {
  const doctorId = req.user.id;
  const { date, slots } = req.body;

  if (!date || !slots || slots.length === 0) {
    return res.status(400).json({ message: 'Date and slots are required' });
  }

  try {
    // Check if a schedule already exists for this date
    let schedule = await Schedule.findOne({ doctorId, date });

    if (schedule) {
      // Update existing schedule
      schedule.slots = slots;
    } else {
      // Create new schedule
      schedule = new Schedule({ doctorId, date, slots });
    }

    await schedule.save();
    res.json({ message: 'Schedule saved successfully', schedule });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Doctor's Available Slots
exports.getDoctorSlots = async (req, res) => {
  const doctorId = req.params.doctorId;
  const date = req.query.date; // Optional

  try {
    const filter = { doctorId };
    if (date) {
      filter.date = date;
    }

    const schedules = await Schedule.find(filter);

    // Extract only unbooked slots
    const availableSlots = schedules
      .map((schedule) => {
        const unbookedSlots = schedule.slots.filter((slot) => !slot.isBooked);
        return {
          date: schedule.date,
          slots: unbookedSlots,
        };
      })
      .filter((schedule) => schedule.slots.length > 0);

    res.json({ doctorId, availableSlots });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};