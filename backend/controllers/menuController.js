const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items with search and filters
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const { category, isVeg, isAvailable, search, minPrice, maxPrice, mealWindow } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isVeg !== undefined && isVeg !== 'all') {
      query.isVeg = isVeg === 'true' || isVeg === true;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    if (mealWindow && mealWindow !== 'all') {
      query.availableMealWindows = mealWindow;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const items = await MenuItem.find(query).sort({ isFeatured: -1, rating: -1, name: 1 });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('recipeIngredients.ingredient');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private (Admin only)
const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isVeg,
      isAvailable,
      stockQuantity,
      lowStockThreshold,
      preparationTimeMinutes,
      imageUrl,
      isFeatured,
      tags,
      availableMealWindows,
      recipeIngredients,
    } = req.body;

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      isVeg: isVeg !== undefined ? isVeg : true,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      stockQuantity: stockQuantity || 50,
      lowStockThreshold: lowStockThreshold || 10,
      preparationTimeMinutes: preparationTimeMinutes || 15,
      imageUrl: imageUrl || '',
      isFeatured: isFeatured || false,
      tags: tags || [],
      availableMealWindows: availableMealWindows || [category],
      recipeIngredients: recipeIngredients || [],
    });

    res.status(201).json({
      success: true,
      message: 'Dish added to menu successfully',
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin only)
const updateMenuItem = async (req, res, next) => {
  try {
    let item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item availability / stock status
// @route   PATCH /api/menu/:id/toggle-availability
// @access  Private (Admin or Kitchen)
const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `${item.name} is now ${item.isAvailable ? 'available' : 'marked sold-out'}`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin only)
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Menu item removed from canteen catalog',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
};
