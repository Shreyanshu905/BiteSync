const express = require('express');
const router = express.Router();
const {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  restockItem,
  getLowStockAlerts,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'kitchen'), getInventory);
router.get('/low-stock-alerts', authorize('admin', 'kitchen'), getLowStockAlerts);
router.post('/', authorize('admin'), addInventoryItem);
router.put('/:id', authorize('admin'), updateInventoryItem);
router.post('/:id/restock', authorize('admin', 'kitchen'), restockItem);

module.exports = router;

