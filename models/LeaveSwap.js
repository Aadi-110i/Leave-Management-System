const mongoose = require('mongoose');

const leaveSwapSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requesterDate: {
        type: Date,
        required: true,
    },
    targetDate: {
        type: Date,
        required: true,
    },
    message: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    // Target employee response
    targetResponse: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending',
    },
    // Manager approval (after target accepts)
    managerStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

const LeaveSwap = mongoose.model('LeaveSwap', leaveSwapSchema);
module.exports = LeaveSwap;
