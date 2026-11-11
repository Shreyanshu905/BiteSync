const mongoose = require('mongoose');

const mealSkipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    mealPeriod: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
      required: true,
    },
    reason: {
      type: String,
      default: 'Not at hostel',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

mealSkipSchema.index({ student: 1, date: 1, mealPeriod: 1 }, { unique: true });

module.exports = mongoose.model('MealSkip', mealSkipSchema);
