const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// ... (Your existing Login/Register routes) ...

// ==========================================
// 1. GOOGLE AUTH ROUTES
// ==========================================

// @route   GET /api/auth/google
// @desc    Redirect to Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// @route   GET /api/auth/google/callback
// @desc    Google calls this after login
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT Token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Redirect to Frontend with Token
    // VITAL: Change this URL to your live frontend URL
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    
    // We pass the user object as a URL-encoded string for simplicity, 
    // or you can just fetch it again on the frontend using the token.
    const userString = encodeURIComponent(JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo
    }));

    res.redirect(`${frontendUrl}/auth/success?token=${token}&user=${userString}`);
  }
);


// ==========================================
// 2. FORGOT PASSWORD ROUTES
// ==========================================

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD, // App Password
  },
});

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create Link
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send Email
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request - FlowState",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    res.json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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

    // Update Password (Make sure you have a pre-save hook to hash this!)
    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;