const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user exists by Google ID
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2. Check if user exists by Email (Link accounts)
        const email = profile.emails[0].value;
        user = await User.findOne({ email });
        
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // 3. Create new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          photo: profile.photos[0].value,
          // ⚠️ FIX: Add a dummy password to satisfy Mongoose 'required: true'
          password: "google-login-dummy-secret-" + Date.now() 
        });
        
        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);