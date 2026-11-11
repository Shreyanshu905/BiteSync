const InventoryItem = require('../models/InventoryItem');

// @desc    Get all inventory items with optional low-stock filter
// @route   GET /api/inventory
// @access  Private (Admin or Kitchen)
const getInventory = async (req, res, next) => {
  try {
    const { category, lowStockOnly } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    let items = await InventoryItem.find(query).sort({ currentStock: 1 });

    if (lowStockOnly === 'true' || lowStockOnly === true) {
      items = items.filter((item) => item.currentStock <= item.minThreshold);
    }

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new ingredient or packaging item
// @route   POST /api/inventory
// @access  Private (Admin only)
const addInventoryItem = async (req, res, next) => {
  try {
    const { name, category, currentStock, unit, minThreshold, costPerUnit, supplier } = req.body;

    const existing = await InventoryItem.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An inventory item with this name already exists.' });
    }

    const item = await InventoryItem.create({
      name: name.trim(),
      category: category || 'grain',
      currentStock: Number(currentStock) || 0,
      unit: unit || 'kg',
      minThreshold: Number(minThreshold) || 10,
      costPerUnit: Number(costPerUnit) || 0,
      supplier: supplier || 'Campus Mega Wholesale',
      restockHistory: [
        {
          quantity: Number(currentStock) || 0,
          cost: Number(costPerUnit) || 0,
          note: 'Initial Stocking',
          restockedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Ingredient added to inventory system',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item details
// @route   PUT /api/inventory/:id
// @access  Private (Admin only)
const updateInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restock an ingredient
// @route   POST /api/inventory/:id/restock
// @access  Private (Admin or Kitchen)
const restockItem = async (req, res, next) => {
  try {
    const { quantity, cost, note } = req.body;
    const addQty = Number(quantity);

    if (!addQty || addQty <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid positive quantity to restock.' });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.currentStock += addQty;
    item.lastRestockedAt = new Date();
    item.restockHistory.push({
      quantity: addQty,
      cost: Number(cost) || item.costPerUnit,
      note: note || 'Counter restock',
      restockedAt: new Date(),
    });

    await item.save();

    res.json({
      success: true,
      message: `Restocked ${addQty} ${item.unit} of ${item.name}. New stock: ${item.currentStock} ${item.unit}.`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/low-stock-alerts
// @access  Private (Admin or Kitchen)
const getLowStockAlerts = async (req, res, next) => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ['$currentStock', '$minThreshold'] },
    });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  restockItem,
  getLowStockAlerts,
};
