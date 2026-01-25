require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

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
// 🚀 This line loads your Google Strategy from the new file
require('./config/passport'); 

// --- 4. ROUTES ---
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks'); 

// All auth routes (including Google) will now start with /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Healthy Check
app.get('/', (req, res) => res.send("FlowState API Live"));

// --- 5. SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});