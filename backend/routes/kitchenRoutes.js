const express = require('express');
const router = express.Router();
const {
  getKitchenQueue,
  getReadyOrders,
  getPreparationSummary,
  reportKitchenDelay,
} = require('../controllers/kitchenController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('kitchen', 'admin'));

router.get('/queue', getKitchenQueue);
router.get('/ready', getReadyOrders);
router.get('/summary', getPreparationSummary);
router.post('/report-delay', reportKitchenDelay);

module.exports = router;

