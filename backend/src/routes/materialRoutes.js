import express from 'express';
import {
  addMaterial,
  deleteMaterial
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Thin wrapper routes focused purely on materials.
// They delegate to the subjectController implementations so
// materials remain embedded within subjects/units.

const router = express.Router();

// Add a material to a unit within a subject
router.post(
  '/:subjectId/unit/:unitId',
  protect,
  authorize('faculty', 'admin'),
  (req, res, next) => {
    // Normalise param names to match subjectController
    req.params.id = req.params.subjectId;
    next();
  },
  addMaterial
);

// Delete a material from a unit within a subject
router.delete(
  '/:subjectId/unit/:unitId/:materialId',
  protect,
  authorize('faculty', 'admin'),
  (req, res, next) => {
    req.params.id = req.params.subjectId;
    next();
  },
  deleteMaterial
);

export default router;

