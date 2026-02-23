const Leave = require('../models/Leave');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Employee, Manager
const applyLeave = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { leaveType, fromDate, toDate, reason, isEmergency, emergencyNote } = req.body;

    try {
        if (new Date(toDate) < new Date(fromDate)) {
            return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
        }

        const leave = await Leave.create({
            employee: req.user._id,
            leaveType,
            fromDate,
            toDate,
            reason,
            isEmergency: !!isEmergency,
            emergencyNote: emergencyNote || '',
        });

        await leave.populate('employee', 'name email department');
        res.status(201).json({ success: true, leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leaves (admin/manager sees all; employee sees own)
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'employee') query.employee = req.user._id;
        if (req.query.status) query.status = req.query.status;
        if (req.query.emergency === 'true') query.isEmergency = true;

        const leaves = await Leave.find(query)
            .populate('employee', 'name email department')
            .populate('reviewedBy', 'name email')
            .sort({ isEmergency: -1, createdAt: -1 });

        res.json({ success: true, count: leaves.length, leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate('employee', 'name email department')
            .populate('reviewedBy', 'name email');

        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
        if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.json({ success: true, leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve leave
// @route   PUT /api/leaves/:id/approve
// @access  Manager, Admin
const approveLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
        if (leave.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Already reviewed' });
        }
        leave.status = 'Approved';
        leave.reviewedBy = req.user._id;
        leave.reviewNote = req.body.reviewNote || '';
        await leave.save();
        await leave.populate('employee', 'name email department');
        await leave.populate('reviewedBy', 'name email');
        res.json({ success: true, message: 'Leave approved', leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject leave
// @route   PUT /api/leaves/:id/reject
// @access  Manager, Admin
const rejectLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
        if (leave.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Already reviewed' });
        }
        leave.status = 'Rejected';
        leave.reviewedBy = req.user._id;
        leave.reviewNote = req.body.reviewNote || '';
        await leave.save();
        await leave.populate('employee', 'name email department');
        await leave.populate('reviewedBy', 'name email');
        res.json({ success: true, message: 'Leave rejected', leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete leave (only pending, by owner or admin)
// @route   DELETE /api/leaves/:id
const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
        const isOwner = leave.employee.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (leave.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Only pending leaves can be deleted' });
        }
        await leave.deleteOne();
        res.json({ success: true, message: 'Leave deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
const getLeaveStats = async (req, res) => {
    try {
        let matchQuery = {};
        if (req.user.role === 'employee') matchQuery.employee = req.user._id;

        const stats = await Leave.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const result = { Pending: 0, Approved: 0, Rejected: 0, Total: 0 };
        stats.forEach((s) => { result[s._id] = s.count; result.Total += s.count; });

        const approvedLeaves = await Leave.find({
            ...(req.user.role === 'employee' ? { employee: req.user._id } : {}),
            status: 'Approved',
        });

        let totalApprovedDays = 0;
        approvedLeaves.forEach((l) => {
            totalApprovedDays += Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
        });
        result.ApprovedDays = totalApprovedDays;

        res.json({ success: true, stats: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Burnout risk — employees with no approved leave in 90 days
// @route   GET /api/leaves/burnout-alerts
// @access  Manager, Admin
const getBurnoutAlerts = async (req, res) => {
    try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);

        const employees = await User.find({ role: 'employee' }).select('name email department');
        const recentIds = await Leave.find({ status: 'Approved', fromDate: { $gte: cutoff } }).distinct('employee');
        const recentSet = new Set(recentIds.map((id) => id.toString()));

        const atRisk = await Promise.all(
            employees
                .filter((emp) => !recentSet.has(emp._id.toString()))
                .map(async (emp) => {
                    const lastLeave = await Leave.findOne({ employee: emp._id, status: 'Approved' }).sort({ fromDate: -1 });
                    const days = lastLeave
                        ? Math.floor((Date.now() - new Date(lastLeave.fromDate)) / 86400000)
                        : null;
                    return {
                        employee: emp,
                        daysSinceLeave: days,
                        lastLeaveDate: lastLeave?.fromDate || null,
                        risk: !lastLeave || days > 120 ? 'High' : 'Medium',
                    };
                })
        );

        res.json({ success: true, atRisk });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Advanced analytics
// @route   GET /api/leaves/analytics
// @access  Admin, Manager
const getAnalytics = async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);

        const monthlyTrend = await Leave.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    total: { $sum: 1 },
                    approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const leaveTypeBreakdown = await Leave.aggregate([
            { $group: { _id: '$leaveType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const deptBreakdown = await Leave.aggregate([
            { $match: { status: 'Approved' } },
            { $lookup: { from: 'users', localField: 'employee', foreignField: '_id', as: 'emp' } },
            { $unwind: '$emp' },
            {
                $group: {
                    _id: '$emp.department',
                    totalLeaves: { $sum: 1 },
                    totalDays: {
                        $sum: { $add: [{ $divide: [{ $subtract: ['$toDate', '$fromDate'] }, 86400000] }, 1] },
                    },
                },
            },
            { $sort: { totalLeaves: -1 } },
        ]);

        const [summary] = await Leave.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
                    emergency: { $sum: { $cond: ['$isEmergency', 1, 0] } },
                },
            },
        ]);

        res.json({
            success: true,
            monthlyTrend,
            leaveTypeBreakdown,
            deptBreakdown,
            summary: summary || { total: 0, approved: 0, rejected: 0, pending: 0, emergency: 0 },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    applyLeave, getLeaves, getLeaveById,
    approveLeave, rejectLeave, deleteLeave,
    getLeaveStats, getBurnoutAlerts, getAnalytics,
};
