const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    planType: {
      type: String,
      enum: ['weekly', 'monthly', 'credit_bundle'],
      default: 'weekly',
    },
    durationDays: {
      type: Number,
      required: true,
      default: 7,
    },
    mealCreditsCount: {
      type: Number,
      required: true,
      default: 14,
    },
    price: {
      type: Number,
      required: true,
    },
    savingsText: {
      type: String,
      default: 'Save 20%',
    },
    allowedMealTypes: [
      {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'late-night'],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);

