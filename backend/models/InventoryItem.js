const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['grain', 'dairy', 'vegetable', 'beverage', 'spice', 'packaging', 'other'],
      default: 'grain',
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'litres', 'packets', 'units', 'grams'],
      default: 'kg',
    },
    minThreshold: {
      type: Number,
      required: true,
      default: 15,
    },
    costPerUnit: {
      type: Number,
      default: 50,
    },
    supplier: {
      type: String,
      default: 'Campus Mega Wholesale',
    },
    lastRestockedAt: {
      type: Date,
      default: Date.now,
    },
    restockHistory: [
      {
        quantity: Number,
        cost: Number,
        note: String,
        restockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

inventoryItemSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minThreshold;
});

inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
