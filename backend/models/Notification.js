const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    roleTarget: {
      type: String,
      enum: ['all', 'student', 'kitchen', 'admin'],
      default: 'student',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order_status', 'low_stock', 'offer', 'announcement', 'reminder', 'system'],
      default: 'system',
    },
    data: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      orderNumber: String,
      link: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ roleTarget: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
