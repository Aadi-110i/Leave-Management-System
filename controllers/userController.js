const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create user (Admin)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, department } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const user = await User.create({ name, email, password, role, department });
        res.status(201).json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
    try {
        const { name, email, role, department, isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department) user.department = department;
        if (isActive !== undefined) user.isActive = isActive;

        // If password provided, update it (pre-save hook will hash)
        if (req.body.password) user.password = req.body.password;

        await user.save();

        res.json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, isActive: user.isActive },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Prevent deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all managers (for employee use)
// @route   GET /api/users/managers
// @access  Private
const getManagers = async (req, res) => {
    try {
        const managers = await User.find({ role: 'manager' }).select('name email department');
        res.json({ success: true, managers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, getManagers };
