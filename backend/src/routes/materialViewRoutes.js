import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { recordMaterialView } from '../controllers/materialViewController.js';

const router = express.Router();

router.post('/', protect, authorize('student'), recordMaterialView);

export default router;

