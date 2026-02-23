const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    applyLeave, getLeaves, getLeaveById,
    approveLeave, rejectLeave, deleteLeave,
    getLeaveStats, getBurnoutAlerts, getAnalytics,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/stats', getLeaveStats);
router.get('/burnout-alerts', authorize('manager', 'admin'), getBurnoutAlerts);
router.get('/analytics', authorize('manager', 'admin'), getAnalytics);

router
    .route('/')
    .get(getLeaves)
    .post(
        authorize('employee', 'manager', 'admin'),
        [
            body('leaveType').notEmpty().withMessage('Leave type is required'),
            body('fromDate').isISO8601().withMessage('Valid from date is required'),
            body('toDate').isISO8601().withMessage('Valid to date is required'),
            body('reason').notEmpty().withMessage('Reason is required'),
        ],
        applyLeave
    );

router.get('/:id', getLeaveById);
router.put('/:id/approve', authorize('manager', 'admin'), approveLeave);
router.put('/:id/reject', authorize('manager', 'admin'), rejectLeave);
router.delete('/:id', deleteLeave);

module.exports = router;
