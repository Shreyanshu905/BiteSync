const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  verifyAndCollectOrder,
  getAllOrders,
  rateOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/all', protect, authorize('admin', 'kitchen'), getAllOrders);
router.post('/verify-pickup', protect, authorize('admin', 'kitchen'), verifyAndCollectOrder);

router.get('/:id', protect, getOrderById);
router.post('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, authorize('admin', 'kitchen'), updateOrderStatus);
router.post('/:id/rate', protect, rateOrder);

module.exports = router;
