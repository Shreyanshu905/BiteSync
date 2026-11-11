const express = require('express');
const router = express.Router();
const {
  getMealPlans,
  subscribeToPlan,
  getMyCredits,
  skipMeal,
  getSkippedMeals,
  transferCredits,
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/auth');

router.get('/', getMealPlans);
router.post('/:id/subscribe', protect, subscribeToPlan);
router.get('/my-credits', protect, getMyCredits);
router.post('/skip-meal', protect, skipMeal);
router.get('/skipped-meals', protect, getSkippedMeals);
router.post('/transfer-credits', protect, transferCredits);

module.exports = router;
