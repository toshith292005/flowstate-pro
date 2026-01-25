require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- 2. MIDDLEWARE ---
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://flowstate-pro-beige.vercel.app" 
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. PASSPORT CONFIGURATION ---
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // 🚀 FIX: Updated to /api/auth to match your other routes
      callbackURL: "/api/auth/google/callback", 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "", 
            photo: profile.photos[0].value,
            // 🚀 FIX: Critical! Save the Google ID for the database model
            googleId: profile.id 
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// --- 4. GOOGLE AUTH ROUTES ---
// We keep them here in index.js for simplicity. 
// ⚠️ IMPORTANT: Remove these routes from routes/auth.js if they exist there!

// A. Trigger Route (Matches your Frontend Button)
app.get(
  "/api/auth/google", // <--- Updated to /api
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// B. Callback Route (Matches Google Cloud Console)
app.get(
  "/api/auth/google/callback", // <--- Updated to /api
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Generate Token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Encode User Data
    const userData = encodeURIComponent(JSON.stringify(req.user));
    
    // Redirect to Frontend Success Page
    // Make sure CLIENT_URL is set (e.g., https://flowstate-pro-beige.vercel.app)
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}&user=${userData}`);
  }
);

// --- 5. OTHER ROUTES ---
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks'); 

// Mount standard auth routes (Login/Signup/Forgot Password)
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/', (req, res) => res.send("FlowState API Live"));

// --- 6. SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});