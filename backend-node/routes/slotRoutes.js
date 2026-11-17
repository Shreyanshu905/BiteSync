const express = require('express');
const router = express.Router();
const {
  getSlots,
  createSlot,
  updateSlot,
  toggleCloseSlot,
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getSlots);
router.post('/', protect, authorize('admin'), createSlot);
router.put('/:id', protect, authorize('admin'), updateSlot);
router.patch('/:id/toggle-close', protect, authorize('admin', 'kitchen'), toggleCloseSlot);

module.exports = router;

