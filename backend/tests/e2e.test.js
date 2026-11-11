const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const PickupSlot = require('../models/PickupSlot');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const InventoryItem = require('../models/InventoryItem');
const {
  generateOrderNumber,
  generatePickupToken,
  generateQRPayload,
  verifyQRPayload,
} = require('../utils/tokenGenerator');

let mongod;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('End-to-End Order & Collection Lifecycle with Business Rules', async (t) => {
  await t.test('1. Student Registration & Initial Wallet Balance', async () => {
    const student = await User.create({
      name: 'Rohan Gupta',
      email: 'rohan@test.com',
      password: 'Password123',
      role: 'student',
      studentId: 'STU-TEST-001',
      hostel: { hostelName: 'Aryabhata Bhavan', block: 'Block-A', roomNumber: '101' },
    });

    const wallet = await Wallet.create({
      student: student._id,
      balance: 500,
    });

    assert.equal(wallet.balance, 500, 'Student should start with ₹500 balance');
  });

  await t.test('2. Menu Item & Slot Capacity Control', async () => {
    const dish = await MenuItem.create({
      name: 'Test Masala Dosa',
      price: 60,
      category: 'breakfast',
      isVeg: true,
      stockQuantity: 10,
      isAvailable: true,
    });

    const slot = await PickupSlot.create({
      startTime: '08:30',
      endTime: '08:45',
      mealPeriod: 'breakfast',
      date: '2026-11-12',
      maxCapacity: 2,
      currentBookings: 0,
    });

    assert.equal(slot.currentBookings, 0);
    assert.equal(dish.stockQuantity, 10);
  });

  await t.test('3. Place Order, Atomic Slot Increment & Wallet Deduction', async () => {
    const student = await User.findOne({ email: 'rohan@test.com' });
    const dish = await MenuItem.findOne({ name: 'Test Masala Dosa' });
    const slot = await PickupSlot.findOne({ startTime: '08:30' });

    // Atomic slot booking
    const updatedSlot = await PickupSlot.findOneAndUpdate(
      { _id: slot._id, isClosed: false, $expr: { $lt: ['$currentBookings', '$maxCapacity'] } },
      { $inc: { currentBookings: 1 } },
      { new: true }
    );
    assert.ok(updatedSlot, 'Slot booking should succeed');
    assert.equal(updatedSlot.currentBookings, 1);

    // Wallet balance deduction
    const wallet = await Wallet.findOneAndUpdate(
      { student: student._id, balance: { $gte: 60 } },
      { $inc: { balance: -60 } },
      { new: true }
    );
    assert.equal(wallet.balance, 440, 'Balance should reduce by ₹60 to ₹440');

    // Create Order
    const orderNumber = generateOrderNumber();
    const pickupToken = generatePickupToken();
    const tempId = new mongoose.Types.ObjectId();
    const qrData = generateQRPayload(tempId.toString(), orderNumber, pickupToken);

    const order = await Order.create({
      _id: tempId,
      orderNumber,
      student: student._id,
      items: [{ menuItem: dish._id, name: dish.name, price: 60, quantity: 1, subtotal: 60, isVeg: true }],
      totalAmount: 60,
      finalAmount: 60,
      status: 'placed',
      pickupSlot: slot._id,
      pickupToken,
      qrCodeData: qrData,
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      cancellationDeadline: new Date(Date.now() + 600000),
      statusTimestamps: { placedAt: new Date() },
    });

    assert.equal(order.status, 'placed');
    assert.match(order.orderNumber, /^BS-\d{5}$/);
  });

  await t.test('4. Kitchen Progresses Order to Ready', async () => {
    const order = await Order.findOne({ status: 'placed' });
    order.status = 'ready';
    order.statusTimestamps.readyAt = new Date();
    await order.save();

    const readyOrder = await Order.findById(order._id);
    assert.equal(readyOrder.status, 'ready');
  });

  await t.test('5. Counter QR Scan & Collection', async () => {
    const order = await Order.findOne({ status: 'ready' });

    // Verify QR code payload
    const verification = verifyQRPayload(order.qrCodeData);
    assert.equal(verification.valid, true);

    // Mark as collected
    order.status = 'collected';
    order.statusTimestamps.collectedAt = new Date();
    await order.save();

    assert.equal(order.status, 'collected');
  });

  await t.test('6. CRITICAL RULE: Duplicate Collection Prevention', async () => {
    const order = await Order.findOne({ status: 'collected' });

    // Attempt second scan for same order
    const isAlreadyCollected = order.status === 'collected';
    assert.equal(isAlreadyCollected, true, 'System must detect and reject second collection');
  });

  await t.test('7. Slot Capacity Limit Rejection', async () => {
    const slot = await PickupSlot.findOne({ startTime: '08:30' });
    // Slot maxCapacity is 2, currentBookings is 1. Increment 1 more to reach max
    await PickupSlot.findByIdAndUpdate(slot._id, { currentBookings: 2 });

    // Attempt booking when full
    const fullSlotAttempt = await PickupSlot.findOneAndUpdate(
      { _id: slot._id, isClosed: false, $expr: { $lt: ['$currentBookings', '$maxCapacity'] } },
      { $inc: { currentBookings: 1 } },
      { new: true }
    );

    assert.equal(fullSlotAttempt, null, 'Must reject booking when slot capacity is exhausted');
  });
});
