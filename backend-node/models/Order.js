const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    specialInstructions: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['placed', 'accepted', 'preparing', 'ready', 'collected', 'cancelled'],
      default: 'placed',
    },
    pickupSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupSlot',
      required: true,
    },
    slotDisplay: {
      startTime: String,
      endTime: String,
      date: String,
      mealPeriod: String,
    },
    pickupToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'upi', 'demo_gateway', 'meal_credit'],
      default: 'wallet',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed'],
      default: 'completed',
    },
    paymentDetails: {
      transactionId: String,
      upiReference: String,
      paidAt: Date,
      refundedAt: Date,
    },
    orderType: {
      type: String,
      enum: ['regular', 'group', 'scheduled'],
      default: 'regular',
    },
    groupOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupOrder',
    },
    scheduledFor: {
      type: Date,
    },
    hostelDetails: {
      hostelName: String,
      block: String,
      roomNumber: String,
    },
    cancellationDeadline: {
      type: Date,
      required: true,
    },
    cancellationReason: {
      type: String,
    },
    estimatedWaitTimeMinutes: {
      type: Number,
      default: 15,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
    },
    statusTimestamps: {
      placedAt: { type: Date, default: Date.now },
      acceptedAt: Date,
      preparingAt: Date,
      readyAt: Date,
      collectedAt: Date,
      cancelledAt: Date,
    },
    collectedByStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isNoShow: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ student: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ pickupSlot: 1 });

module.exports = mongoose.model('Order', orderSchema);

