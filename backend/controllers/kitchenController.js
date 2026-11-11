const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Get active orders queue for Kitchen (placed, accepted, preparing)
// @route   GET /api/kitchen/queue
// @access  Private (Kitchen or Admin)
const getKitchenQueue = async (req, res, next) => {
  try {
    const { mealPeriod } = req.query;
    const query = {
      status: { $in: ['placed', 'accepted', 'preparing'] },
    };

    if (mealPeriod && mealPeriod !== 'all') {
      query['slotDisplay.mealPeriod'] = mealPeriod;
    }

    const orders = await Order.find(query)
      .populate('student', 'name studentId phone hostel')
      .populate('pickupSlot')
      .sort({ 'slotDisplay.startTime': 1, createdAt: 1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders ready for collection at counter
// @route   GET /api/kitchen/ready
// @access  Private (Kitchen or Admin)
const getReadyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'ready' })
      .populate('student', 'name studentId phone hostel')
      .populate('pickupSlot')
      .sort({ 'statusTimestamps.readyAt': -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated item preparation summary per slot
// @route   GET /api/kitchen/summary
// @access  Private (Kitchen or Admin)
const getPreparationSummary = async (req, res, next) => {
  try {
    const { slotId } = req.query;
    const match = { status: { $in: ['placed', 'accepted', 'preparing'] } };

    if (slotId) {
      match.pickupSlot = slotId;
    }

    const orders = await Order.find(match);

    const summaryMap = {};
    const slotGroupMap = {};

    for (const order of orders) {
      const slotKey = order.slotDisplay
        ? `${order.slotDisplay.startTime}-${order.slotDisplay.endTime}`
        : 'Current Slot';

      if (!slotGroupMap[slotKey]) {
        slotGroupMap[slotKey] = {
          slotTime: slotKey,
          mealPeriod: order.slotDisplay ? order.slotDisplay.mealPeriod : '',
          totalOrders: 0,
          items: {},
        };
      }

      slotGroupMap[slotKey].totalOrders += 1;

      for (const item of order.items) {
        // Overall summary
        if (!summaryMap[item.name]) {
          summaryMap[item.name] = {
            dishName: item.name,
            totalQuantity: 0,
            isVeg: item.isVeg,
          };
        }
        summaryMap[item.name].totalQuantity += item.quantity;

        // Slot breakdown
        if (!slotGroupMap[slotKey].items[item.name]) {
          slotGroupMap[slotKey].items[item.name] = 0;
        }
        slotGroupMap[slotKey].items[item.name] += item.quantity;
      }
    }

    res.json({
      success: true,
      totalActiveOrders: orders.length,
      overallItems: Object.values(summaryMap),
      bySlot: Object.values(slotGroupMap),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Notify students of kitchen delay or exception
// @route   POST /api/kitchen/report-delay
// @access  Private (Kitchen or Admin)
const reportKitchenDelay = async (req, res, next) => {
  try {
    const { slotId, delayMinutes = 10, message } = req.body;

    const query = {
      status: { $in: ['placed', 'accepted', 'preparing'] },
    };
    if (slotId) query.pickupSlot = slotId;

    const orders = await Order.find(query);

    for (const order of orders) {
      order.estimatedWaitTimeMinutes += Number(delayMinutes);
      await order.save();

      await Notification.create({
        recipient: order.student,
        title: '⚠️ Kitchen Prep Delay Notice',
        message:
          message ||
          `Due to rush at the counter, your pickup may be delayed by approximately ${delayMinutes} minutes. We apologize for the wait!`,
        type: 'order_status',
        data: { orderId: order._id, orderNumber: order.orderNumber },
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('kitchen_delay_alert', {
        slotId,
        delayMinutes,
        message: message || `Prep delay of ${delayMinutes} mins reported for current orders.`,
      });
    }

    res.json({
      success: true,
      message: `Delay alert broadcasted to ${orders.length} active orders.`,
      affectedOrdersCount: orders.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKitchenQueue,
  getReadyOrders,
  getPreparationSummary,
  reportKitchenDelay,
};

