import Announcement from '../models/Announcement.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createAnnouncement = async (req, res) => {
  const { title, description, subject, priority } = req.body;

  if (!title || !description) {
    res.status(400).json({ message: 'Title and description are required' });
    return;
  }

  if (subject && !isValidObjectId(subject)) {
    res.status(400).json({ message: 'Invalid subject id' });
    return;
  }

  const announcement = await Announcement.create({
    title,
    description,
    subject: subject || null,
    priority: priority || 'normal',
    createdBy: req.user._id
  });

  res.status(201).json(announcement);
};

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, description, subject, priority } = req.body;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid announcement id' });
    return;
  }

  const announcement = await Announcement.findById(id);

  if (!announcement) {
    res.status(404).json({ message: 'Announcement not found' });
    return;
  }

  if (
    announcement.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403).json({ message: 'Not authorized to update this announcement' });
    return;
  }

  if (title) announcement.title = title;
  if (description) announcement.description = description;
  if (subject !== undefined) announcement.subject = subject || null;
  if (priority) announcement.priority = priority;

  await announcement.save();
  res.json(announcement);
};

export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid announcement id' });
    return;
  }

  const announcement = await Announcement.findById(id);

  if (!announcement) {
    res.status(404).json({ message: 'Announcement not found' });
    return;
  }

  if (
    announcement.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403).json({ message: 'Not authorized to delete this announcement' });
    return;
  }

  await announcement.deleteOne();
  res.json({ message: 'Announcement deleted' });
};

export const getAnnouncements = async (req, res) => {
  const { subject, sort } = req.query;

  let filter = {};
  if (subject && isValidObjectId(subject)) {
    filter.subject = subject;
  }

  let sortOption = { createdAt: -1 };

  const announcements = await Announcement.find(filter)
    .sort(sortOption)
    .populate('createdBy', 'name email')
    .populate('subject', 'name code')
    .lean();
    
  res.json(announcements);
};
