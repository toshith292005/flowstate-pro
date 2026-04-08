const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const User = require('../models/User');


// 1. GET TASKS (SECURED)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required to fetch tasks."
      });
    }

    const tasks = await Task.find({
      userEmail: email
    }).sort({ createdAt: -1 });

    res.json(tasks);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// 2. CREATE TASK WITH PREMIUM LIMIT CHECK
router.post('/', async (req, res) => {
  try {
    const {
      userEmail,
      title,
      category,
      priority,
      status,
      dueDate,
      progress,
      completedAt
    } = req.body;

    // Find User
    const user = await User.findOne({
      email: userEmail
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Count Existing Tasks
    const taskCount = await Task.countDocuments({
      userEmail
    });

    // Restrict Free Users
    if (!user.isPremium && taskCount >= 10) {
      return res.status(403).json({
        message: "Free users can only create up to 10 tasks. Upgrade to Premium."
      });
    }

    // Create Task
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
    res.status(500).json({
      error: err.message
    });
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
    res.status(500).json({
      error: err.message
    });
  }
});


// 4. DELETE SINGLE TASK
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// 5. DELETE ALL TASKS FOR USER
router.delete('/', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required to delete all tasks."
      });
    }

    await Task.deleteMany({
      userEmail: email
    });

    res.json({
      message: "All tasks deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


module.exports = router;