const mongoose = require('mongoose');

const mealCreditSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan',
      required: true,
    },
    totalCredits: {
      type: Number,
      required: true,
    },
    remainingCredits: {
      type: Number,
      required: true,
      min: 0,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    redemptionHistory: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        mealPeriod: String,
        redeemedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

mealCreditSchema.index({ student: 1, isActive: 1 });

module.exports = mongoose.model('MealCredit', mealCreditSchema);
