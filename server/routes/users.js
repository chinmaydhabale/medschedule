const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');

// Register a new user
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be doctor or patient').isIn(['doctor', 'patient']),
  ],
  userController.registerUser
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  userController.loginUser
);

// Get user profile
router.get('/profile', require('../middleware/auth'), userController.getUserProfile);


router.get('/doctors', userController.getDoctorList);

module.exports = router;