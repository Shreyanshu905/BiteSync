const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const PickupSlot = require('../models/PickupSlot');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const MealCredit = require('../models/MealCredit');
const InventoryItem = require('../models/InventoryItem');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const {
  generateOrderNumber,
  generatePickupToken,
  generateQRPayload,
  verifyQRPayload,
} = require('../utils/tokenGenerator');

// @desc    Place a new pre-order
// @route   POST /api/orders
// @access  Private (Student)
const createOrder = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const {
      items, // [{ menuItemId, quantity, specialInstructions }]
      pickupSlotId,
      paymentMethod = 'wallet',
      couponCode,
      notes,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty.' });
    }

    if (!pickupSlotId) {
      return res.status(400).json({ success: false, message: 'Please select an available pickup slot.' });
    }

    // 1. Atomic pickup slot reservation (prevents overbooking race conditions)
    const slot = await PickupSlot.findOneAndUpdate(
      {
        _id: pickupSlotId,
        isClosed: false,
        $expr: { $lt: ['$currentBookings', '$maxCapacity'] },
      },
      { $inc: { currentBookings: 1 } },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({
        success: false,
        message: 'The selected pickup slot is either full or closed. Please select another slot.',
      });
    }

    // 2. Validate menu items and compute total
    const itemIds = items.map((i) => i.menuItemId || i.menuItem || i._id);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } });
    const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

    const processedItems = [];
    let subtotal = 0;
    let maxPrepTime = 10;

    for (const item of items) {
      const id = (item.menuItemId || item.menuItem || item._id).toString();
      const dish = menuItemMap.get(id);

      if (!dish) {
        // Rollback slot booking
        await PickupSlot.findByIdAndUpdate(pickupSlotId, { $inc: { currentBookings: -1 } });
        return res.status(400).json({
          success: false,
          message: `Dish not found in menu.`,
        });
      }

      if (!dish.isAvailable || dish.stockQuantity < item.quantity) {
        // Rollback slot booking
        await PickupSlot.findByIdAndUpdate(pickupSlotId, { $inc: { currentBookings: -1 } });
        return res.status(400).json({
          success: false,
          message: `"${dish.name}" is sold out or has insufficient stock. Please adjust your cart.`,
        });
      }

      const itemTotal = dish.price * item.quantity;
      subtotal += itemTotal;
      if (dish.preparationTimeMinutes > maxPrepTime) {
        maxPrepTime = dish.preparationTimeMinutes;
      }

      processedItems.push({
        menuItem: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: item.quantity,
        subtotal: itemTotal,
        isVeg: dish.isVeg,
        specialInstructions: item.specialInstructions || '',
      });
    }

    // 3. Discount calculation
    let discountAmount = 0;
    if (couponCode) {
      const codeUpper = couponCode.trim().toUpperCase();
      if (codeUpper === 'BITESYNC10' || codeUpper === 'WELCOME10') {
        discountAmount = Math.min(Math.round(subtotal * 0.1), 50);
      } else if (codeUpper === 'HOSTEL20' && subtotal >= 150) {
        discountAmount = Math.min(Math.round(subtotal * 0.2), 60);
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    // 4. Payment verification
    let paymentStatus = 'completed';
    let transactionId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ student: studentId });
      if (!wallet || wallet.balance < finalAmount) {
        // Rollback slot booking
        await PickupSlot.findByIdAndUpdate(pickupSlotId, { $inc: { currentBookings: -1 } });
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. You have ₹${wallet ? wallet.balance : 0}, but ₹${finalAmount} is required. Please top up or choose another payment method.`,
        });
      }

      // Deduct balance atomically
      const updatedWallet = await Wallet.findOneAndUpdate(
        { student: studentId, balance: { $gte: finalAmount } },
        { $inc: { balance: -finalAmount } },
        { new: true }
      );

      if (!updatedWallet) {
        await PickupSlot.findByIdAndUpdate(pickupSlotId, { $inc: { currentBookings: -1 } });
        return res.status(400).json({
          success: false,
          message: 'Wallet transaction failed. Please retry.',
        });
      }

      await WalletTransaction.create({
        wallet: updatedWallet._id,
        student: studentId,
        amount: finalAmount,
        type: 'order_payment',
        status: 'completed',
        referenceId: transactionId,
        description: `Meal Order Payment (${processedItems.map((i) => `${i.name} x${i.quantity}`).join(', ')})`,
        balanceAfter: updatedWallet.balance,
      });
    } else if (paymentMethod === 'meal_credit') {
      const credit = await MealCredit.findOne({
        student: studentId,
        isActive: true,
        remainingCredits: { $gt: 0 },
        validUntil: { $gte: new Date() },
      });

      if (!credit) {
        await PickupSlot.findByIdAndUpdate(pickupSlotId, { $inc: { currentBookings: -1 } });
        return res.status(400).json({
          success: false,
          message: 'No active meal plan credits found. Please purchase a meal subscription or pay via wallet.',
        });
      }

      credit.remainingCredits -= 1;
      await credit.save();
    }

    // 5. Deduct food stock and inventory ingredients
    for (const item of processedItems) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stockQuantity: -item.quantity },
      });

      // Auto inventory recipe deduction
      const dishDoc = menuItemMap.get(item.menuItem.toString());
      if (dishDoc && dishDoc.recipeIngredients && dishDoc.recipeIngredients.length > 0) {
        for (const recipe of dishDoc.recipeIngredients) {
          const deduction = recipe.quantity * item.quantity;
          await InventoryItem.findByIdAndUpdate(recipe.ingredient, {
            $inc: { currentStock: -deduction },
          });
        }
      }
    }

    // 6. Generate order numbers, tokens, and QR code
    const orderNumber = generateOrderNumber();
    const pickupToken = generatePickupToken();

    // Cancellation deadline: 15 minutes before the slot starts or 15 mins from now
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const slotStartTime = new Date(`${slot.date}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`);
    const cancellationDeadline = new Date(slotStartTime.getTime() - 15 * 60 * 1000);

    const tempId = new Order()._id;
    const qrPayload = generateQRPayload(tempId.toString(), orderNumber, pickupToken);

    const order = await Order.create({
      _id: tempId,
      orderNumber,
      student: studentId,
      items: processedItems,
      totalAmount: subtotal,
      discountAmount,
      finalAmount,
      status: 'placed',
      pickupSlot: slot._id,
      slotDisplay: {
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: slot.date,
        mealPeriod: slot.mealPeriod,
      },
      pickupToken,
      qrCodeData: qrPayload,
      paymentMethod,
      paymentStatus,
      paymentDetails: {
        transactionId,
        paidAt: new Date(),
      },
      hostelDetails: req.user.hostel || {
        hostelName: 'Aryabhata Bhavan',
        block: 'Block-A',
        roomNumber: '101',
      },
      cancellationDeadline: cancellationDeadline > new Date() ? cancellationDeadline : new Date(Date.now() + 10 * 60 * 1000),
      estimatedWaitTimeMinutes: maxPrepTime,
      statusTimestamps: {
        placedAt: new Date(),
      },
    });

    // Notify kitchen and admin via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to('kitchen').emit('order_placed', {
        order,
        message: `New order #${order.orderNumber} received for slot ${slot.startTime}-${slot.endTime}`,
      });
      io.to('admin').emit('order_placed', { order });
      io.emit('slot_capacity_changed', {
        slotId: slot._id,
        currentBookings: slot.currentBookings,
        maxCapacity: slot.maxCapacity,
      });
    }

    // Create persistent notification for student
    await Notification.create({
      recipient: studentId,
      title: 'Order Confirmed! 🎉',
      message: `Your meal order #${order.orderNumber} is confirmed for ${slot.startTime}-${slot.endTime}. Pickup Token: ${pickupToken}`,
      type: 'order_status',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Keep your QR code ready at the counter.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's orders
// @route   GET /api/orders/my
// @access  Private (Student)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ student: req.user.id })
      .populate('pickupSlot')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name studentId email phone hostel')
      .populate('pickupSlot');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check: only the student who ordered, or admin/kitchen staff can view
    if (req.user.role === 'student' && order.student._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order before cutoff deadline with instant refund
// @route   POST /api/orders/:id/cancel
// @access  Private (Student or Admin)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'student' && order.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order.' });
    }

    if (['collected', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already marked as ${order.status}.`,
      });
    }

    // If student is cancelling, verify cancellation deadline
    if (req.user.role === 'student') {
      const now = new Date();
      if (order.cancellationDeadline && now > new Date(order.cancellationDeadline)) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation cutoff time has passed. Kitchen is already preparing your meal.',
        });
      }
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || (req.user.role === 'admin' ? 'Cancelled by Canteen Admin' : 'Cancelled by Student');
    order.statusTimestamps.cancelledAt = new Date();

    // Release pickup slot
    if (order.pickupSlot) {
      await PickupSlot.findByIdAndUpdate(order.pickupSlot, {
        $inc: { currentBookings: -1 },
      });
    }

    // Restore dish stock
    for (const item of order.items) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    // Instant refund if paid via wallet
    if (order.paymentMethod === 'wallet' && order.finalAmount > 0) {
      const wallet = await Wallet.findOneAndUpdate(
        { student: order.student },
        { $inc: { balance: order.finalAmount } },
        { new: true }
      );

      if (wallet) {
        await WalletTransaction.create({
          wallet: wallet._id,
          student: order.student,
          amount: order.finalAmount,
          type: 'refund',
          status: 'completed',
          referenceId: order.orderNumber,
          description: `Refund for cancelled order #${order.orderNumber}`,
          balanceAfter: wallet.balance,
        });
      }
      order.paymentStatus = 'refunded';
      order.paymentDetails.refundedAt = new Date();
    } else if (order.paymentMethod === 'meal_credit') {
      // Restore meal credit
      await MealCredit.findOneAndUpdate(
        { student: order.student, isActive: true },
        { $inc: { remainingCredits: 1 } }
      );
    }

    await order.save();

    // Socket.IO notification
    const io = req.app.get('io');
    if (io) {
      io.to(`student_${order.student}`).emit('order_status_updated', {
        orderId: order._id,
        status: 'cancelled',
        message: `Order #${order.orderNumber} was cancelled. Refund processed to your wallet.`,
      });
      io.to('kitchen').emit('order_status_updated', { orderId: order._id, status: 'cancelled' });
      io.to('admin').emit('order_status_updated', { orderId: order._id, status: 'cancelled' });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully. Full refund has been credited to your wallet.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (placed -> accepted -> preparing -> ready)
// @route   PATCH /api/orders/:id/status
// @access  Private (Kitchen or Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'accepted', 'preparing', 'ready'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: "${status}". Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'collected') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been collected and closed.',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status of a cancelled order.',
      });
    }

    order.status = status;
    if (status === 'accepted') order.statusTimestamps.acceptedAt = new Date();
    if (status === 'preparing') order.statusTimestamps.preparingAt = new Date();
    if (status === 'ready') order.statusTimestamps.readyAt = new Date();

    await order.save();

    // Real-time notification to student
    const io = req.app.get('io');
    if (io) {
      const statusLabels = {
        accepted: 'Kitchen Accepted your order! 👨‍🍳',
        preparing: 'Your meal is now being prepared! 🔥',
        ready: 'Order is READY FOR PICKUP! 🍱 Please proceed to the counter.',
      };

      io.to(`student_${order.student}`).emit('order_status_updated', {
        orderId: order._id,
        status,
        message: statusLabels[status] || `Order status updated to ${status}`,
      });
      io.to('kitchen').emit('order_status_updated', { orderId: order._id, status });
      io.to('admin').emit('order_status_updated', { orderId: order._id, status });
    }

    // Persist notification for student
    if (status === 'ready') {
      await Notification.create({
        recipient: order.student,
        title: '🍱 Food is Ready for Pickup!',
        message: `Your order #${order.orderNumber} is hot and ready at the counter. Pickup Token: ${order.pickupToken}`,
        type: 'order_status',
        data: { orderId: order._id, orderNumber: order.orderNumber },
      });
    }

    res.json({
      success: true,
      message: `Order #${order.orderNumber} status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify QR Code or Pickup Token and mark order as Collected
// @route   POST /api/orders/verify-pickup
// @access  Private (Kitchen or Admin)
const verifyAndCollectOrder = async (req, res, next) => {
  try {
    const { qrData, pickupToken } = req.body;

    if (!qrData && !pickupToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a scanned QR payload or a manual pickup token.',
      });
    }

    let searchCondition = {};

    if (qrData) {
      const verification = verifyQRPayload(qrData);
      if (!verification.valid) {
        return res.status(400).json({
          success: false,
          message: `QR Verification Failed: ${verification.message}`,
        });
      }
      searchCondition = { _id: verification.payload.orderId };
    } else {
      const tokenClean = pickupToken.trim().toUpperCase();
      searchCondition = { pickupToken: tokenClean };
    }

    // Find the order
    const order = await Order.findOne(searchCondition)
      .populate('student', 'name studentId email hostel phone')
      .populate('pickupSlot');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found for this token or QR code.',
      });
    }

    // CRITICAL SECURITY RULE: Duplicate collection prevention
    if (order.status === 'collected') {
      const collectedTime = order.statusTimestamps.collectedAt
        ? new Date(order.statusTimestamps.collectedAt).toLocaleTimeString()
        : 'earlier';
      return res.status(400).json({
        success: false,
        isDuplicate: true,
        message: `⚠️ ALREADY COLLECTED! Order #${order.orderNumber} was already collected at ${collectedTime}. Cannot be handed over again!`,
        data: order,
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `⛔ ORDER CANCELLED! Order #${order.orderNumber} was cancelled and cannot be fulfilled.`,
        data: order,
      });
    }

    // Atomically mark as collected
    order.status = 'collected';
    order.statusTimestamps.collectedAt = new Date();
    order.collectedByStaff = req.user.id;
    await order.save();

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`student_${order.student._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: 'collected',
        message: `Order #${order.orderNumber} marked as collected. Enjoy your meal! ✨`,
      });
      io.to('kitchen').emit('order_collected', { orderId: order._id, order });
      io.to('admin').emit('order_collected', { orderId: order._id, order });
    }

    res.json({
      success: true,
      message: `✅ Order #${order.orderNumber} verified and marked COLLECTED successfully!`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for Kitchen or Admin with filters
// @route   GET /api/orders/all
// @access  Private (Kitchen or Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, mealPeriod, date, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (mealPeriod && mealPeriod !== 'all') {
      query['slotDisplay.mealPeriod'] = mealPeriod;
    }

    if (date) {
      query['slotDisplay.date'] = date;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { pickupToken: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('student', 'name studentId email phone hostel')
      .populate('pickupSlot')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate and submit feedback for an order
// @route   POST /api/orders/:id/rate
// @access  Private (Student)
const rateOrder = async (req, res, next) => {
  try {
    const { rating, feedback, foodQualityRating, hygieneRating } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this order' });
    }

    order.rating = Number(rating);
    order.feedback = feedback || '';
    await order.save();

    // Create review entries for each dish
    for (const item of order.items) {
      await Review.create({
        student: req.user.id,
        order: order._id,
        menuItem: item.menuItem,
        dishName: item.name,
        rating: Number(rating),
        foodQualityRating: foodQualityRating || rating,
        hygieneRating: hygieneRating || rating,
        comment: feedback || '',
      });

      // Update dish average rating
      const reviews = await Review.find({ menuItem: item.menuItem });
      if (reviews.length > 0) {
        const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await MenuItem.findByIdAndUpdate(item.menuItem, {
          rating: Number(avg.toFixed(1)),
          ratingCount: reviews.length,
        });
      }
    }

    res.json({
      success: true,
      message: 'Thank you for your rating and feedback!',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  verifyAndCollectOrder,
  getAllOrders,
  rateOrder,
};

