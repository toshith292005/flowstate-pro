const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: "General" },
  priority: { type: String, default: "Medium" },
  status: { type: String, default: "To Do" },
  dueDate: { type: String }, // Stores "YYYY-MM-DD"
  progress: { type: Number, default: 0 },
  completedAt: { type: String, default: null }, // <--- WE ADDED THIS
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);