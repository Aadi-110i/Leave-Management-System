const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    category: {
        type: String,
        enum: ['Travel', 'Medical', 'Food', 'Equipment', 'Other'],
        required: [true, 'Category is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be greater than 0'],
    },
    date: {
        type: Date,
        required: [true, 'Date of expense is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
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
    receiptUrl: {
        type: String,
        default: '',
    }
}, { timestamps: true });

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
