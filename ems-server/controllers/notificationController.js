const Notification = require('../models/Notification');

// Get all active notifications (excluding those created by current user)
exports.getAllNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Get start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    // Role-based filtering
    const currentUserRole = req.user.role;
    
    // Build filter for notifications current user can see
    const filter = { 
      isActive: true,
      createdBy: { $ne: currentUserId },
      createdAt: { $gte: startOfToday }
    };
    
    if (currentUserRole === 'employee') {
      filter.$or = [
        { targetType: 'all-employees' },
        { targetType: 'all-including-managers' },
        { targetType: 'specific-employee', targetEmployeeId: currentUserId }
      ];
    } else {
      // Managers see only notifications specifically for managers or created by other managers
      filter.$or = [
        { targetType: 'all-including-managers' }
      ];
    }
    
    const allNotifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name');
    
    // Filter to get unread notifications only
    const unreadNotifications = allNotifications.filter(notif => {
      const readArray = notif.readBy || [];
      return !readArray.some(id => id.toString() === currentUserId.toString());
    });
    
    // Return both all notifications and unread count
    res.json({
      notifications: allNotifications,
      unreadCount: unreadNotifications.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications created by current user (for history)
exports.getMyNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    console.log('Getting my notifications for user:', currentUserId);
    
    const notifications = await Notification.find({ 
      createdBy: currentUserId
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('createdBy', 'name')
      .populate('targetEmployeeId', 'name');
    
    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('Error getting my notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create notification (manager only)
exports.createNotification = async (req, res) => {
  try {
    const { message, type, targetType, targetEmployeeId } = req.body;
    
    // Validate required fields
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Ensure createdBy is a valid ObjectId
    const createdById = req.user?._id || req.user?.id;
    if (!createdById) {
      return res.status(401).json({ message: 'User not authenticated properly' });
    }
    
    const notificationData = {
      title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      message,
      type: type || 'general',
      targetType: targetType || 'all-employees',
      createdBy: createdById
    };
    
    if (targetType === 'specific-employee' && targetEmployeeId) {
      notificationData.targetEmployeeId = targetEmployeeId;
    }
    
    const notification = await Notification.create(notificationData);
    
    await notification.populate('createdBy', 'name');
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read by current user
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user has already read this notification
    const hasRead = notification.readBy.some(id => id.toString() === userId.toString());
    
    if (!hasRead) {
      notification.readBy.push(userId);
      await notification.save();
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read by current user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all active notifications created by others
    const notifications = await Notification.find({
      isActive: true,
      createdBy: { $ne: userId }
    });
    
    // Mark each as read if not already read
    for (const notification of notifications) {
      const hasRead = notification.readBy.some(id => id.toString() === userId.toString());
      if (!hasRead) {
        notification.readBy.push(userId);
        await notification.save();
      }
    }
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
