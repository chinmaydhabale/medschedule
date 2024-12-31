// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true,
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);