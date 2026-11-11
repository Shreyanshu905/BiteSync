const mongoose = require('mongoose');

const groupMemberItemSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: String,
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    subtotal: Number,
  },
  { _id: false }
);

const groupOrderSchema = new mongoose.Schema(
  {
    groupCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Hostel Group Meal',
    },
    status: {
      type: String,
      enum: ['open', 'locked', 'placed', 'cancelled'],
      default: 'open',
    },
    pickupSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupSlot',
    },
    members: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    items: [groupMemberItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    finalOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GroupOrder', groupOrderSchema);

