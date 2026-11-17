const mongoose = require('mongoose');

const mealTransferSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientStudentId: {
      type: String,
      required: true,
    },
    creditsCount: {
      type: Number,
      required: true,
      min: 1,
    },
    mealCreditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealCredit',
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'rejected'],
      default: 'completed',
    },
    message: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MealTransfer', mealTransferSchema);

