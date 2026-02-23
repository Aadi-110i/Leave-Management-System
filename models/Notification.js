const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['leave_applied', 'leave_approved', 'leave_rejected', 'burnout_risk', 'swap_request', 'swap_approved', 'emergency_leave', 'pending_reminder'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    leaveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leave',
        default: null,
    },
    actionUrl: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
