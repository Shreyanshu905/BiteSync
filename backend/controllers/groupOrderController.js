const GroupOrder = require('../models/GroupOrder');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const PickupSlot = require('../models/PickupSlot');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const {
  generateOrderNumber,
  generatePickupToken,
  generateQRPayload,
} = require('../utils/tokenGenerator');

// @desc    Create new group order session
// @route   POST /api/group-orders
// @access  Private (Student)
const createGroupOrder = async (req, res, next) => {
  try {
    const { title } = req.body;
    const randomCode = `GRP-${Math.floor(1000 + Math.random() * 9000)}`;

    const group = await GroupOrder.create({
      groupCode: randomCode,
      creator: req.user.id,
      title: title || `${req.user.name}'s Hostel Feast`,
      members: [{ student: req.user.id }],
    });

    res.status(201).json({
      success: true,
      message: 'Group order room created! Share your code with hostel friends.',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group order by code
// @route   GET /api/group-orders/:code
// @access  Private (Student)
const getGroupByCode = async (req, res, next) => {
  try {
    const group = await GroupOrder.findOne({ groupCode: req.params.code.toUpperCase() })
      .populate('creator', 'name studentId hostel')
      .populate('members.student', 'name studentId hostel')
      .populate('pickupSlot');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group order not found. Check code.' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// @desc    Join group order
// @route   POST /api/group-orders/:code/join
// @access  Private (Student)
const joinGroupOrder = async (req, res, next) => {
  try {
    const group = await GroupOrder.findOne({ groupCode: req.params.code.toUpperCase() });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group order not found' });
    }

    if (group.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This group order is no longer accepting new members.' });
    }

    const alreadyMember = group.members.some((m) => m.student.toString() === req.user.id);
    if (!alreadyMember) {
      group.members.push({ student: req.user.id });
      await group.save();
    }

    res.json({
      success: true,
      message: `Joined ${group.title} successfully!`,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add dish item to group order
// @route   POST /api/group-orders/:code/items
// @access  Private (Student)
const addItemToGroup = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;
    const group = await GroupOrder.findOne({ groupCode: req.params.code.toUpperCase() });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group order not found' });
    }

    if (group.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Group cart is locked.' });
    }

    const dish = await MenuItem.findById(menuItemId);
    if (!dish || !dish.isAvailable) {
      return res.status(400).json({ success: false, message: 'Item is currently unavailable.' });
    }

    const subtotal = dish.price * Number(quantity);

    group.items.push({
      student: req.user.id,
      studentName: req.user.name,
      menuItem: dish._id,
      name: dish.name,
      price: dish.price,
      quantity: Number(quantity),
      subtotal,
    });

    group.totalAmount += subtotal;
    await group.save();

    res.json({
      success: true,
      message: `Added ${dish.name} to group order!`,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroupOrder,
  getGroupByCode,
  joinGroupOrder,
  addItemToGroup,
};
