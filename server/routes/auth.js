const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // 🚀 NEW: Import passport
const User = require('../models/User');

// --- 1. GOOGLE AUTH ROUTES ---

// @desc    Step 1: Start Google Login
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Step 2: Google Callback (Redirects to Vercel)
// @route   GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: 'https://flowstate-pro-beige.vercel.app/login' }),
  (req, res) => {
    // A. Successful login: Issue Token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // B. 🚀 REDIRECT: Go back to Vercel with the token in the URL
    // The Dashboard will "catch" this token and save it to LocalStorage
    res.redirect(`https://flowstate-pro-beige.vercel.app/dashboard?token=${token}`);
  }
);

// --- 2. REGISTER USER ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. LOGIN USER ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ 
        message: "This account uses Google Login. Please click 'Continue with Google'." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, photo: user.photo } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;