const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 500, // Seed with ₹500 for demo convenience
      min: [0, 'Wallet balance cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Wallet', walletSchema);

