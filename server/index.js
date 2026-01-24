require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// --- 1. AUTH IMPORTS ---
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');

const app = express();

// --- 2. DATABASE CONNECTION & USER MODEL ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ CORRECT: Import the shared User model instead of defining it twice
const User = require('./models/User');

// --- 3. PASSPORT CONFIGURATION ---
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      proxy: true // Important: Allows Google to trust the HTTPS proxy on Render
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // ✅ CORRECT: Use 'name' to match your User.js model
        const newUser = await new User({
          googleId: profile.id,
          name: profile.displayName, // Changed from displayName to name
          email: profile.emails[0].value,
          photo: profile.photos[0].value
        }).save();
        
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// --- 4. MIDDLEWARE ---
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    keys: [process.env.COOKIE_KEY || 'default-secret-key']
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://flowstate-pro-beige.vercel.app"
  ],
  credentials: true // Crucial for passing the login cookie
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 5. ROUTES ---

// Google Auth Routes
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    // Redirect user back to the dashboard after login
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

app.get('/api/current_user', (req, res) => {
  res.send(req.user);
});

// Logout Route (Async Fix Applied)
app.get('/api/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect(process.env.CLIENT_URL);
  });
});

// Existing Task Routes
const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);

// Auth Routes (Login/Register)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// --- 6. SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});