require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); // ✅ Using Tokens
const User = require('./models/User'); // ✅ Shared User model

const app = express();

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- 2. MIDDLEWARE ---
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://flowstate-pro-beige.vercel.app" // Your Vercel Frontend
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());

// --- 3. PASSPORT CONFIGURATION ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // A. Check for existing user
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // B. Check if email exists (link accounts)
        const email = profile.emails[0].value;
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.photo = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // C. Create new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          photo: profile.photos[0].value
        });
        await newUser.save();
        done(null, newUser);

      } catch (err) {
        done(err, null);
      }
    }
  )
);

// --- 4. ROUTES ---

// A. Start Google Login
app.get('/auth/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

// B. Google Callback (THE CRITICAL PART)
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // 1. Generate Token
    // ✅ FIX: Use the variable from Render (2026), NOT the hardcoded "123"
    const token = jwt.sign(
      { id: req.user._id }, 
      process.env.JWT_SECRET 
    );
    
    // 2. Redirect to Frontend with Token
    const clientURL = process.env.CLIENT_URL || "https://flowstate-pro-beige.vercel.app";
    
    res.send(`
      <script>
        localStorage.setItem('flowstate_token', '${token}');
        localStorage.setItem('flowstate_user', '${JSON.stringify(req.user)}');
        window.location.href = '${clientURL}/dashboard';
      </script>
    `);
  }
);

// C. Import Other Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks'); 

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// --- 5. SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});