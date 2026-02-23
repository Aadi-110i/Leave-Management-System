const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { requestSwap, getSwaps, getAllSwaps, respondToSwap, managerResponse } = require('../controllers/swapController');

router.post('/', protect, requestSwap);
router.get('/', protect, getSwaps);
router.get('/all', protect, authorize('manager', 'admin'), getAllSwaps);
router.put('/:id/respond', protect, respondToSwap);
router.put('/:id/manager-response', protect, authorize('manager', 'admin'), managerResponse);

module.exports = router;
