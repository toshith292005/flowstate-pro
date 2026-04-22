const router = require("express").Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const User = require("../models/User");

// Twilio Verify client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// ==========================================
// 1. STANDARD AUTH ROUTES (Login/Register)
// ==========================================

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check if user is a Google-only account (no password)
    if (!user.password) {
      return res.status(400).json({ message: "Please log in with Google" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 🚀 MFA Check (Twilio SMS OTP)
    if (user.mfaEnabled) {
      if (!user.phoneNumber) {
        return res.status(400).json({ message: "MFA enabled but no phone number on file. Please add one in Settings." });
      }

      // Send OTP via Twilio Verify
      try {
        await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SID)
          .verifications.create({ to: user.phoneNumber, channel: "sms" });
      } catch (err) {
        console.error("Twilio Error:", err);
        return res.status(500).json({ message: "Failed to send OTP. Please try again." });
      }

      const tempToken = jwt.sign({ id: user._id, mfaTemp: true }, process.env.JWT_SECRET, { expiresIn: "10m" });
      return res.json({ mfaRequired: true, tempToken, message: "OTP sent to your registered mobile number" });
    }

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// 2. FORGOT PASSWORD & EMAIL TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,               // Use 587 instead of 465
  secure: false,           // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    // Save token to DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create Link
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send Email
    await transporter.sendMail({
      to: user.email,
      subject: "Reset your FlowState Password",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for FlowState.</p>
          <p>Click the button below to reset it:</p>
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p style="margin-top: 20px; color: #666;">This link expires in 1 hour.</p>
        </div>
      `,
    });

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Nodemailer Error:", err); // Improved logging
    res.status(500).json({ message: "Server error sending email" });
  }
});

// @route   POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// 3. MFA ROUTES (TWILIO SMS OTP)
// ==========================================

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Save phone number & enable MFA
router.post("/mfa/setup-phone", verifyToken, async (req, res) => {
  try {
    let { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number required" });

    // Format for Twilio (E.164)
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber;
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Send verification OTP to confirm the phone number
    await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    // Save phone number temporarily (confirm before enabling MFA)
    user.phoneNumber = phoneNumber;
    await user.save();

    res.json({ message: "OTP sent to your phone number. Please verify to enable MFA." });
  } catch (err) {
    console.error("Twilio Setup Error:", err);
    res.status(500).json({ message: "Failed to send OTP. Please ensure you include your country code (e.g. +91)." });
  }
});

// Confirm phone OTP and enable MFA
router.post("/mfa/confirm-phone", verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.phoneNumber) return res.status(400).json({ message: "No phone number on file" });

    const result = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: user.phoneNumber, code: otp });

    if (result.status === "approved") {
      user.mfaEnabled = true;
      await user.save();
      res.json({ message: "MFA enabled successfully!", mfaEnabled: true, phoneNumber: user.phoneNumber });
    } else {
      res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
  } catch (err) {
    console.error("Twilio Confirm Error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

// Toggle MFA Off
router.post("/mfa/toggle", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.mfaEnabled = !user.mfaEnabled;
    await user.save();

    res.json({ message: `MFA ${user.mfaEnabled ? 'enabled' : 'disabled'}`, mfaEnabled: user.mfaEnabled });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify SMS OTP during login
router.post("/mfa/verify-login", async (req, res) => {
  try {
    const { tempToken, mfaToken } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.mfaTemp) return res.status(400).json({ message: "Invalid temporary token" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify OTP with Twilio
    const result = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: user.phoneNumber, code: mfaToken });

    if (result.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        isPremium: user.isPremium,
        mfaEnabled: user.mfaEnabled,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (err) {
    console.error("Twilio Verify Login Error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;