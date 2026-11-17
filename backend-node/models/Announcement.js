const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['announcement', 'offer', 'closure', 'notice'],
      default: 'announcement',
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    maxDiscountAmount: {
      type: Number,
      default: 100,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    hostelSpecific: [
      {
        type: String, // e.g. ["Aryabhata Bhavan", "Ramanujan Bhavan"]
      },
    ],
    badgeText: {
      type: String,
      default: 'Special',
    },
    validUntil: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bannerColor: {
      type: String,
      default: 'orange', // 'orange', 'emerald', 'blue', 'purple'
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ isActive: 1, type: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);

