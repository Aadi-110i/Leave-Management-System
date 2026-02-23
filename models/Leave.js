const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    leaveType: {
        type: String,
        enum: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'],
        required: [true, 'Leave type is required'],
    },
    fromDate: {
        type: Date,
        required: [true, 'From date is required'],
    },
    toDate: {
        type: Date,
        required: [true, 'To date is required'],
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        trim: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    reviewNote: {
        type: String,
        default: '',
    },
    isEmergency: {
        type: Boolean,
        default: false,
    },
    emergencyNote: {
        type: String,
        default: '',
    },
}, { timestamps: true });

// Virtual to calculate number of days
leaveSchema.virtual('days').get(function () {
    const diff = this.toDate - this.fromDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
});

leaveSchema.set('toJSON', { virtuals: true });
leaveSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Leave', leaveSchema);
