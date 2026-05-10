const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get all notifications (anyone logged in)
router.get('/', auth, notificationController.getAllNotifications);

// Get my notifications (history - notifications created by current user)
router.get('/my', auth, notificationController.getMyNotifications);

// Mark single notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', auth, notificationController.markAllAsRead);

// Create notification (manager only)
router.post('/', auth, (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, notificationController.createNotification);

// Delete notification
router.delete('/:id', auth, (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, notificationController.deleteNotification);

module.exports = router;
