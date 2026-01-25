const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // 1. Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // 2. Auth Fields
  // Password is optional because Google users won't have one
  password: { type: String }, 
  
  // Google ID: 
  // 'sparse: true' ensures we can have multiple users with NO googleId (standard users)
  googleId: { type: String, unique: true, sparse: true },
  
  // 3. Profile
  photo: { type: String, default: null },

  // 4. Password Reset Fields (⚠️ ADDED THESE)
  // These are required for the Forgot Password feature to work
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

}, { timestamps: true }); 

module.exports = mongoose.model('User', UserSchema);