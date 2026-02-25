import express from 'express';
import {
  getSubjects,
  createSubject,
  addUnit,
  addMaterial,
  deleteMaterial
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSubjects);

router.post('/', protect, authorize('admin', 'faculty'), createSubject);

router.post('/:id/unit', protect, authorize('faculty', 'admin'), addUnit);

router.post(
  '/:id/unit/:unitId/material',
  protect,
  authorize('faculty', 'admin'),
  addMaterial
);

router.delete(
  '/:id/unit/:unitId/material/:materialId',
  protect,
  authorize('faculty', 'admin'),
  deleteMaterial
);

export default router;

