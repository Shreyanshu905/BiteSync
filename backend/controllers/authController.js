const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bitesync-secret-jwt-key-2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, studentId, hostel, phone, dietaryPreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    if (studentId) {
      const existingId = await User.findOne({ studentId: studentId.toUpperCase() });
      if (existingId) {
        return res.status(400).json({ success: false, message: 'Student ID already registered' });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      studentId: studentId ? studentId.toUpperCase() : `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      hostel: hostel || {
        hostelName: 'Aryabhata Bhavan',
        block: 'Block-A',
        roomNumber: '101',
      },
      phone: phone || '',
      dietaryPreference: dietaryPreference || 'all',
    });

    // Automatically create student wallet with initial ₹500 welcome credit
    const wallet = await Wallet.create({
      student: user._id,
      balance: 500,
    });

    await WalletTransaction.create({
      wallet: wallet._id,
      student: user._id,
      amount: 500,
      type: 'topup',
      status: 'completed',
      referenceId: 'WELCOME-500',
      description: 'Welcome Sign-up Bonus',
      balanceAfter: 500,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        hostel: user.hostel,
        dietaryPreference: user.dietaryPreference,
        walletBalance: wallet.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Student, Admin, Kitchen)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact canteen administrator.' });
    }

    let walletBalance = 0;
    if (user.role === 'student') {
      let wallet = await Wallet.findOne({ student: user._id });
      if (!wallet) {
        wallet = await Wallet.create({ student: user._id, balance: 500 });
      }
      walletBalance = wallet.balance;
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        hostel: user.hostel,
        phone: user.phone,
        dietaryPreference: user.dietaryPreference,
        walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let walletBalance = 0;
    if (user.role === 'student') {
      const wallet = await Wallet.findOne({ student: user._id });
      if (wallet) walletBalance = wallet.balance;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        hostel: user.hostel,
        phone: user.phone,
        dietaryPreference: user.dietaryPreference,
        walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, hostel, dietaryPreference } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (hostel) {
      user.hostel = {
        ...user.hostel,
        ...hostel,
      };
    }
    if (dietaryPreference) user.dietaryPreference = dietaryPreference;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        hostel: user.hostel,
        phone: user.phone,
        dietaryPreference: user.dietaryPreference,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  login,
  getMe,
  updateProfile,
};
