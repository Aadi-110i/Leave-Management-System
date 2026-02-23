const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    applyReimbursement,
    getReimbursements,
    getReimbursementById,
    approveReimbursement,
    rejectReimbursement,
    deleteReimbursement,
    getReimbursementStats,
} = require('../controllers/reimbursementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/stats', getReimbursementStats);

router
    .route('/')
    .get(getReimbursements)
    .post(
        authorize('employee', 'manager', 'admin'),
        [
            body('title').notEmpty().withMessage('Title is required'),
            body('category').notEmpty().withMessage('Category is required'),
            body('amount').isNumeric().withMessage('Valid amount is required'),
            body('date').isISO8601().withMessage('Valid date is required'),
            body('description').notEmpty().withMessage('Description is required'),
        ],
        applyReimbursement
    );

router.get('/:id', getReimbursementById);
router.put('/:id/approve', authorize('manager', 'admin'), approveReimbursement);
router.put('/:id/reject', authorize('manager', 'admin'), rejectReimbursement);
router.delete('/:id', deleteReimbursement);

module.exports = router;
