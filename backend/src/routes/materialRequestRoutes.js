import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createMaterialRequest,
  getMaterialRequestsForTeacher,
  getMaterialRequestsForStudent,
  updateMaterialRequestStatus
} from '../controllers/materialRequestController.js';

const router = express.Router();

router.post('/', protect, authorize('student'), createMaterialRequest);

router.get('/student', protect, authorize('student'), getMaterialRequestsForStudent);

router.get(
  '/teacher',
  protect,
  authorize('faculty', 'admin'),
  getMaterialRequestsForTeacher
);

router.patch(
  '/:id/status',
  protect,
  authorize('faculty', 'admin'),
  updateMaterialRequestStatus
);

export default router;
