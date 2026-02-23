const LeaveSwap = require('../models/LeaveSwap');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc  Request a leave swap
// @route POST /api/swaps
// @access Private (Employee)
const requestSwap = async (req, res) => {
    try {
        const { targetEmployeeId, requesterDate, targetDate, message } = req.body;

        if (!targetEmployeeId || !requesterDate || !targetDate) {
            return res.status(400).json({ success: false, message: 'Target employee, your date, and target date are required' });
        }

        const target = await User.findById(targetEmployeeId);
        if (!target) return res.status(404).json({ success: false, message: 'Target employee not found' });

        const swap = await LeaveSwap.create({
            requester: req.user._id,
            targetEmployee: targetEmployeeId,
            requesterDate,
            targetDate,
            message: message || '',
        });

        // Notify target employee
        await createNotification({
            recipient: targetEmployeeId,
            type: 'swap_request',
            title: 'Leave Swap Request',
            message: `${req.user.name} wants to swap their ${new Date(requesterDate).toDateString()} for your ${new Date(targetDate).toDateString()}`,
            leaveRef: null,
        });

        res.status(201).json({ success: true, swap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get swap requests for current user (sent & received)
// @route GET /api/swaps
// @access Private
const getSwaps = async (req, res) => {
    try {
        const swaps = await LeaveSwap.find({
            $or: [{ requester: req.user._id }, { targetEmployee: req.user._id }],
        })
            .populate('requester', 'name email department')
            .populate('targetEmployee', 'name email department')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, swaps });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Get ALL swaps (manager/admin)
// @route GET /api/swaps/all
// @access Private (Manager, Admin)
const getAllSwaps = async (req, res) => {
    try {
        const swaps = await LeaveSwap.find({})
            .populate('requester', 'name email department')
            .populate('targetEmployee', 'name email department')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, swaps });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Target employee responds to swap
// @route PUT /api/swaps/:id/respond
// @access Private (Employee)
const respondToSwap = async (req, res) => {
    try {
        const { response } = req.body; // 'Accepted' or 'Declined'
        const swap = await LeaveSwap.findById(req.params.id);
        if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });
        if (swap.targetEmployee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        swap.targetResponse = response;
        swap.status = response === 'Accepted' ? 'Accepted' : 'Declined';
        await swap.save();

        await createNotification({
            recipient: swap.requester,
            type: 'swap_request',
            title: `Swap ${response}`,
            message: `${req.user.name} has ${response.toLowerCase()} your swap request. ${response === 'Accepted' ? 'Awaiting manager approval.' : ''}`,
        });

        res.json({ success: true, swap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Manager approves/rejects a swap
// @route PUT /api/swaps/:id/manager-response
// @access Private (Manager, Admin)
const managerResponse = async (req, res) => {
    try {
        const { decision } = req.body; // 'Approved' or 'Rejected'
        const swap = await LeaveSwap.findById(req.params.id)
            .populate('requester', 'name')
            .populate('targetEmployee', 'name');
        if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });

        swap.managerStatus = decision;
        swap.status = decision;
        swap.reviewedBy = req.user._id;
        await swap.save();

        // Notify both employees
        for (const recipient of [swap.requester._id, swap.targetEmployee._id]) {
            await createNotification({
                recipient,
                type: 'swap_approved',
                title: `Swap ${decision} by Manager`,
                message: `The swap between ${swap.requester.name} and ${swap.targetEmployee.name} has been ${decision.toLowerCase()}.`,
            });
        }
        res.json({ success: true, swap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { requestSwap, getSwaps, getAllSwaps, respondToSwap, managerResponse };
