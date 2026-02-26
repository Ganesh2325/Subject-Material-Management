import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { toggleUnitCompletion } from '../controllers/progressController.js';

const router = express.Router();

router.post('/unit', protect, authorize('student'), toggleUnitCompletion);

export default router;

