const Notification = require('../models/Notification');

// @desc  Get notifications for current user
// @route GET /api/notifications
// @access Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = notifications.filter((n) => !n.isRead).length;

        res.json({ success: true, notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Mark single notification read
// @route PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc  Mark ALL notifications read for current user
// @route PUT /api/notifications/mark-all-read
// @access Private
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Helper used by other controllers to create notifications
const createNotification = async ({ recipient, type, title, message, leaveRef }) => {
    try {
        await Notification.create({ recipient, type, title, message, leaveRef: leaveRef || null });
    } catch (_) { }
};

module.exports = { getNotifications, markAsRead, markAllRead, createNotification };
