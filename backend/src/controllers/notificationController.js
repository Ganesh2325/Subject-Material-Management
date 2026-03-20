import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid notification id' });
    return;
  }

  const notification = await Notification.findOne({ _id: id, user: req.user._id });

  if (!notification) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }

  notification.isRead = true;
  await notification.save();

  res.json(notification);
};

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ message: 'All notifications marked as read' });
};
