const mongoose = require('mongoose');

const pickupSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g. 08:00)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g. 08:15)'],
      trim: true,
    },
    mealPeriod: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner', 'late-night'],
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 20,
      min: 1,
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    closureReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

pickupSlotSchema.index({ date: 1, mealPeriod: 1, startTime: 1 }, { unique: true });

pickupSlotSchema.methods.hasAvailableCapacity = function () {
  return !this.isClosed && this.currentBookings < this.maxCapacity;
};

pickupSlotSchema.virtual('remainingCapacity').get(function () {
  return Math.max(0, this.maxCapacity - this.currentBookings);
});

pickupSlotSchema.set('toJSON', { virtuals: true });
pickupSlotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PickupSlot', pickupSlotSchema);
