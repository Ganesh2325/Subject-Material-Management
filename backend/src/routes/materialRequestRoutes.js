import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createMaterialRequest,
  listPendingMaterialRequestsForTeacher,
  resolveMaterialRequest
} from '../controllers/materialRequestController.js';

const router = express.Router();

router.post('/', protect, authorize('student'), createMaterialRequest);

router.get(
  '/pending',
  protect,
  authorize('faculty', 'admin'),
  listPendingMaterialRequestsForTeacher
);

router.patch(
  '/:id/resolve',
  protect,
  authorize('faculty', 'admin'),
  resolveMaterialRequest
);

export default router;

