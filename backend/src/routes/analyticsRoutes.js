import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getFacultyAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/faculty', protect, authorize('faculty', 'admin'), getFacultyAnalytics);
router.get('/student', protect, authorize('student'), getStudentAnalytics);

export default router;
