import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getTeacherDashboard,
  getStudentDashboard
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get(
  '/teacher',
  protect,
  authorize('faculty', 'admin'),
  getTeacherDashboard
);

router.get('/student', protect, authorize('student'), getStudentDashboard);

export default router;

