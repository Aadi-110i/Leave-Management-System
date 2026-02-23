const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Apply for reimbursement
// @route   POST /api/reimbursements
// @access  Private
const applyReimbursement = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, category, amount, date, description, receiptUrl } = req.body;

    try {
        const reimbursement = await Reimbursement.create({
            employee: req.user._id,
            title,
            category,
            amount,
            date,
            description,
            receiptUrl: receiptUrl || '',
        });

        await reimbursement.populate('employee', 'name email department');
        res.status(201).json({ success: true, reimbursement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get reimbursements (admin/manager sees all; employee sees own)
// @route   GET /api/reimbursements
// @access  Private
const getReimbursements = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'employee') query.employee = req.user._id;
        if (req.query.status) query.status = req.query.status;
        if (req.query.category) query.category = req.query.category;

        const reimbursements = await Reimbursement.find(query)
            .populate('employee', 'name email department')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: reimbursements.length, reimbursements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single reimbursement
// @route   GET /api/reimbursements/:id
// @access  Private
const getReimbursementById = async (req, res) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id)
            .populate('employee', 'name email department')
            .populate('reviewedBy', 'name email');

        if (!reimbursement) return res.status(404).json({ success: false, message: 'Reimbursement not found' });

        if (req.user.role === 'employee' && reimbursement.employee._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.json({ success: true, reimbursement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve reimbursement
// @route   PUT /api/reimbursements/:id/approve
// @access  Manager, Admin
const approveReimbursement = async (req, res) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id);
        if (!reimbursement) return res.status(404).json({ success: false, message: 'Reimbursement not found' });

        if (reimbursement.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Already reviewed' });
        }

        reimbursement.status = 'Approved';
        reimbursement.reviewedBy = req.user._id;
        reimbursement.reviewNote = req.body.reviewNote || '';

        await reimbursement.save();
        await reimbursement.populate('employee', 'name email department');
        await reimbursement.populate('reviewedBy', 'name email');

        res.json({ success: true, message: 'Reimbursement approved', reimbursement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject reimbursement
// @route   PUT /api/reimbursements/:id/reject
// @access  Manager, Admin
const rejectReimbursement = async (req, res) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id);
        if (!reimbursement) return res.status(404).json({ success: false, message: 'Reimbursement not found' });

        if (reimbursement.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Already reviewed' });
        }

        reimbursement.status = 'Rejected';
        reimbursement.reviewedBy = req.user._id;
        reimbursement.reviewNote = req.body.reviewNote || '';

        await reimbursement.save();
        await reimbursement.populate('employee', 'name email department');
        await reimbursement.populate('reviewedBy', 'name email');

        res.json({ success: true, message: 'Reimbursement rejected', reimbursement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete reimbursement (only pending, by owner or admin)
// @route   DELETE /api/reimbursements/:id
// @access  Private
const deleteReimbursement = async (req, res) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id);
        if (!reimbursement) return res.status(404).json({ success: false, message: 'Reimbursement not found' });

        const isOwner = reimbursement.employee.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (reimbursement.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Only pending requests can be deleted' });
        }

        await reimbursement.deleteOne();
        res.json({ success: true, message: 'Reimbursement request deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get reimbursement statistics
// @route   GET /api/reimbursements/stats
const getReimbursementStats = async (req, res) => {
    try {
        let matchQuery = {};
        if (req.user.role === 'employee') matchQuery.employee = req.user._id;

        const stats = await Reimbursement.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
        ]);

        const result = {
            Pending: 0,
            Approved: 0,
            Rejected: 0,
            Total: 0,
            PendingAmount: 0,
            ApprovedAmount: 0,
            TotalAmount: 0
        };

        stats.forEach((s) => {
            result[s._id] = s.count;
            result.Total += s.count;
            if (s._id === 'Pending') result.PendingAmount = s.totalAmount;
            if (s._id === 'Approved') result.ApprovedAmount = s.totalAmount;
            result.TotalAmount += s.totalAmount;
        });

        res.json({ success: true, stats: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    applyReimbursement,
    getReimbursements,
    getReimbursementById,
    approveReimbursement,
    rejectReimbursement,
    deleteReimbursement,
    getReimbursementStats,
};
