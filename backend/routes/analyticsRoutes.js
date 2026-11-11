const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getSalesTrends,
  getDishPopularity,
  getDemandPrediction,
  getWasteAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getOverviewStats);
router.get('/sales-trends', getSalesTrends);
router.get('/dish-popularity', getDishPopularity);
router.get('/demand-prediction', getDemandPrediction);
router.get('/waste-reduction', getWasteAnalytics);

module.exports = router;
