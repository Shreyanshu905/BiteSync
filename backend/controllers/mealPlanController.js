const MealPlan = require('../models/MealPlan');
const MealCredit = require('../models/MealCredit');
const MealSkip = require('../models/MealSkip');
const MealTransfer = require('../models/MealTransfer');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

// @desc    Get all active meal plans
// @route   GET /api/meal-plans
// @access  Public
const getMealPlans = async (req, res, next) => {
  try {
    let plans = await MealPlan.find({ isActive: true });

    if (plans.length === 0) {
      // Seed default plans if none exist
      plans = await MealPlan.insertMany([
        {
          name: '7-Day Weekly Mess Pass',
          description: '14 meals covering lunch and dinner for 7 days. Free cancellation up to 30 mins before slots.',
          planType: 'weekly',
          durationDays: 7,
          mealCreditsCount: 14,
          price: 1120,
          savingsText: 'Save 20% vs a la carte',
          allowedMealTypes: ['lunch', 'dinner'],
        },
        {
          name: '30-Day Monthly Full Board',
          description: '60 meals covering lunch and dinner for full month with priority counter pickup.',
          planType: 'monthly',
          durationDays: 30,
          mealCreditsCount: 60,
          price: 4500,
          savingsText: 'Save 25% + Free Weekend Chai',
          allowedMealTypes: ['lunch', 'dinner'],
        },
        {
          name: '10-Meal Flexi Credit Bundle',
          description: '10 meal credits usable anytime across breakfast, lunch, snacks or dinner with no expiration.',
          planType: 'credit_bundle',
          durationDays: 90,
          mealCreditsCount: 10,
          price: 850,
          savingsText: 'Save 15%',
          allowedMealTypes: ['breakfast', 'lunch', 'dinner', 'snacks'],
        },
      ]);
    }

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Purchase/Subscribe to a meal plan
// @route   POST /api/meal-plans/:id/subscribe
// @access  Private (Student)
const subscribeToPlan = async (req, res, next) => {
  try {
    const plan = await MealPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    const studentId = req.user.id;
    const wallet = await Wallet.findOne({ student: studentId });

    if (!wallet || wallet.balance < plan.price) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You need ₹${plan.price}, but have ₹${wallet ? wallet.balance : 0}. Please top up your wallet.`,
      });
    }

    // Deduct from wallet
    wallet.balance -= plan.price;
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      student: studentId,
      amount: plan.price,
      type: 'meal_credit_purchase',
      status: 'completed',
      referenceId: plan._id.toString(),
      description: `Purchased subscription: ${plan.name}`,
      balanceAfter: wallet.balance,
    });

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + plan.durationDays);

    const credit = await MealCredit.create({
      student: studentId,
      mealPlan: plan._id,
      totalCredits: plan.mealCreditsCount,
      remainingCredits: plan.mealCreditsCount,
      validUntil,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: `🎉 Successfully subscribed to ${plan.name}! ${plan.mealCreditsCount} meal credits added to your account.`,
      data: credit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's active meal credits
// @route   GET /api/meal-plans/my-credits
// @access  Private (Student)
const getMyCredits = async (req, res, next) => {
  try {
    const credits = await MealCredit.find({
      student: req.user.id,
      isActive: true,
      validUntil: { $gte: new Date() },
    }).populate('mealPlan');

    res.json({
      success: true,
      data: credits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip a meal (reduce food waste)
// @route   POST /api/meal-plans/skip-meal
// @access  Private (Student)
const skipMeal = async (req, res, next) => {
  try {
    const { date, mealPeriod, reason } = req.body;

    if (!date || !mealPeriod) {
      return res.status(400).json({ success: false, message: 'Please provide date and meal period to skip.' });
    }

    const existing = await MealSkip.findOne({
      student: req.user.id,
      date,
      mealPeriod,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already marked this meal as skipped.' });
    }

    const skip = await MealSkip.create({
      student: req.user.id,
      date,
      mealPeriod,
      reason: reason || 'Not at campus',
    });

    res.status(201).json({
      success: true,
      message: `Meal skip recorded for ${mealPeriod.toUpperCase()} on ${date}. Thank you for helping reduce kitchen food waste!`,
      data: skip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's skipped meals
// @route   GET /api/meal-plans/skipped-meals
// @access  Private (Student)
const getSkippedMeals = async (req, res, next) => {
  try {
    const skips = await MealSkip.find({ student: req.user.id }).sort({ date: -1 });
    res.json({ success: true, data: skips });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer meal credits to another registered student
// @route   POST /api/meal-plans/transfer-credits
// @access  Private (Student)
const transferCredits = async (req, res, next) => {
  try {
    const { recipientStudentId, quantity = 1, message } = req.body;
    const transferQty = Number(quantity);

    if (!recipientStudentId || transferQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid recipient Student ID and credit quantity.',
      });
    }

    const recipient = await User.findOne({
      studentId: recipientStudentId.trim().toUpperCase(),
      role: 'student',
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${recipientStudentId}" not found. Verify their ID.`,
      });
    }

    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer meal credits to yourself.',
      });
    }

    const senderCredit = await MealCredit.findOne({
      student: req.user.id,
      isActive: true,
      remainingCredits: { $gte: transferQty },
      validUntil: { $gte: new Date() },
    });

    if (!senderCredit) {
      return res.status(400).json({
        success: false,
        message: `Insufficient active meal credits. You do not have ${transferQty} valid credits to transfer.`,
      });
    }

    // Deduct from sender
    senderCredit.remainingCredits -= transferQty;
    await senderCredit.save();

    // Credit to recipient
    let recipientCredit = await MealCredit.findOne({
      student: recipient._id,
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (recipientCredit) {
      recipientCredit.remainingCredits += transferQty;
      await recipientCredit.save();
    } else {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      recipientCredit = await MealCredit.create({
        student: recipient._id,
        mealPlan: senderCredit.mealPlan,
        totalCredits: transferQty,
        remainingCredits: transferQty,
        validUntil,
        isActive: true,
      });
    }

    const transferRecord = await MealTransfer.create({
      sender: req.user.id,
      recipient: recipient._id,
      recipientStudentId: recipient.studentId,
      creditsCount: transferQty,
      mealCreditId: senderCredit._id,
      message: message || '',
    });

    res.json({
      success: true,
      message: `Successfully transferred ${transferQty} meal credit(s) to ${recipient.name} (${recipient.studentId})!`,
      data: transferRecord,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMealPlans,
  subscribeToPlan,
  getMyCredits,
  skipMeal,
  getSkippedMeals,
  transferCredits,
};
