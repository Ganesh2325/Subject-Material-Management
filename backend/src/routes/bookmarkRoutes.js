import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  addBookmark,
  removeBookmark
} from '../controllers/bookmarkController.js';

const router = express.Router();

router.post('/', protect, authorize('student'), addBookmark);
router.delete('/:id', protect, authorize('student'), removeBookmark);

export default router;

