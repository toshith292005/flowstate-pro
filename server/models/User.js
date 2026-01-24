const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // "name" works for both (Google gives us a name, Signup form gives us a name)
  name: { type: String, required: true },
  
  email: { type: String, required: true, unique: true },
  
  // PASSWORD IS NOW OPTIONAL
  // Google users won't have one, so we remove "required: true"
  password: { type: String }, 
  
  // NEW FIELD: To store the Google ID
  googleId: { type: String },
  
  photo: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);