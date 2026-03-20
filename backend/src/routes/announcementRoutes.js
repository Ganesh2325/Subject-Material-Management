import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncements
} from '../controllers/announcementController.js';

const router = express.Router();

router.get('/', protect, getAnnouncements);

router.post('/', protect, authorize('faculty', 'admin'), createAnnouncement);

router.put('/:id', protect, authorize('faculty', 'admin'), updateAnnouncement);

router.delete('/:id', protect, authorize('faculty', 'admin'), deleteAnnouncement);

export default router;
