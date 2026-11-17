const express = require('express');
const router = express.Router();
const {
  getWallet,
  topUpWallet,
  getTransactions,
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWallet);
router.post('/topup', topUpWallet);
router.get('/transactions', getTransactions);

module.exports = router;

