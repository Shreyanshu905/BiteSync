const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

// @desc    Get student wallet and transactions
// @route   GET /api/wallet
// @access  Private (Student)
const getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ student: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ student: req.user.id, balance: 500 });
    }

    const transactions = await WalletTransaction.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add funds / Top-up student wallet
// @route   POST /api/wallet/topup
// @access  Private (Student)
const topUpWallet = async (req, res, next) => {
  try {
    const { amount, paymentMethod = 'upi' } = req.body;
    const topUpAmount = Number(amount);

    if (!topUpAmount || topUpAmount < 10 || topUpAmount > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Top-up amount must be between ₹10 and ₹5,000.',
      });
    }

    let wallet = await Wallet.findOne({ student: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ student: req.user.id, balance: 0 });
    }

    const refId = `TOPUP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    wallet.balance += topUpAmount;
    await wallet.save();

    const transaction = await WalletTransaction.create({
      wallet: wallet._id,
      student: req.user.id,
      amount: topUpAmount,
      type: 'topup',
      status: 'completed',
      referenceId: refId,
      description: `Wallet recharge via ${paymentMethod.toUpperCase()}`,
      balanceAfter: wallet.balance,
    });

    res.json({
      success: true,
      message: `₹${topUpAmount} added to your wallet successfully!`,
      balance: wallet.balance,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private (Student)
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await WalletTransaction.find({ student: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallet,
  topUpWallet,
  getTransactions,
};

