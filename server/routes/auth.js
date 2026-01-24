const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SECRET KEY (In production, this goes in .env, but for now we hardcode it)
const JWT_SECRET = "flowstate_secret_key_123";

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // A. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // B. Hash the password (Encrypt it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // C. Create User
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // D. Issue Token (Digital ID Card)
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET);

    res.status(201).json({ 
      token, 
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // --- 🛡️ SAFETY CHECK FOR GOOGLE USERS ---
    // If user exists but has NO password, they signed up with Google.
    // We must stop here to prevent a crash.
    if (!user.password) {
      return res.status(400).json({ 
        message: "This account uses Google Login. Please click 'Continue with Google'." 
      });
    }
    // ----------------------------------------

    // B. Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // C. Issue Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, photo: user.photo } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE USER PROFILE
router.put('/profile', async (req, res) => {
  try {
    const { id, name, email, photo } = req.body;

    // Find user by ID and update their info
    // { new: true } means "give me the UPDATED user, not the old one"
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, photo }, 
      { new: true } 
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // Send the fresh user data back to the frontend
    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;