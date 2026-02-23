const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getManagers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require auth
router.use(protect);

// Managers endpoint (accessible by all authenticated users)
router.get('/managers', getManagers);

// Admin-only routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.post(
    '/',
    authorize('admin'),
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
        body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
    ],
    createUser
);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
