const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. GET TASKS (SECURED)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query; 
    
    // Safety Check: If no email is provided, block the request
    if (!email) {
        return res.status(400).json({ message: "Email is required to fetch tasks." });
    }

    // Database Filter: userEmail MUST match the request email
    const tasks = await Task.find({ userEmail: email }).sort({ createdAt: -1 }); 
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE TASK
router.post('/', async (req, res) => {
  try {
    const { userEmail, title, category, priority, status, dueDate, progress, completedAt } = req.body;

    const newTask = new Task({
      userEmail, 
      title,
      category,
      priority,
      status,
      dueDate,
      progress,
      completedAt
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE TASK 
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE SINGLE TASK
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE ALL TASKS FOR USER (NEW ADDITION)
router.delete('/', async (req, res) => {
  try {
    const { email } = req.query; 
    
    if (!email) {
      return res.status(400).json({ message: "Email is required to delete all tasks." });
    }

    // Deletes every task where userEmail matches
    await Task.deleteMany({ userEmail: email });
    
    res.json({ message: "All tasks deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;