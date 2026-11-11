const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// @desc    Get all students
// @route   GET /api/users/students
router.get('/students', async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all canteen staff & kitchen members
// @route   GET /api/users/staff
router.get('/staff', async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['kitchen', 'admin'] } }).select('-password');
    res.json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new staff account
// @route   POST /api/users/staff
router.post('/staff', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists' });
    }

    const staffMember = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'kitchen',
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        id: staffMember._id,
        name: staffMember.name,
        email: staffMember.email,
        role: staffMember.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Toggle staff active status
// @route   PATCH /api/users/staff/:id/toggle-active
router.patch('/staff/:id/toggle-active', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Account status updated to ${user.isActive ? 'Active' : 'Deactivated'}`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

