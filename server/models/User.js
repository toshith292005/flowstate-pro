const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  password: { type: String },

  googleId: { type: String, unique: true, sparse: true },

  photo: { type: String, default: null },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  phoneNumber: { type: String, default: null },

  isPremium: {
    type: Boolean,
    default: false
  },

  premiumExpiry: {
    type: Date,
    default: null
  },

  razorpayCustomerId: {
    type: String,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);