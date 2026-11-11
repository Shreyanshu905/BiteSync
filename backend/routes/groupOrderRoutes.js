const express = require('express');
const router = express.Router();
const {
  createGroupOrder,
  getGroupByCode,
  joinGroupOrder,
  addItemToGroup,
} = require('../controllers/groupOrderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createGroupOrder);
router.get('/:code', getGroupByCode);
router.post('/:code/join', joinGroupOrder);
router.post('/:code/items', addItemToGroup);

module.exports = router;

