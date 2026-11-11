const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

router.post('/', protect, authorize('admin'), createMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);
router.patch('/:id/toggle-availability', protect, authorize('admin', 'kitchen'), toggleAvailability);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);

module.exports = router;
