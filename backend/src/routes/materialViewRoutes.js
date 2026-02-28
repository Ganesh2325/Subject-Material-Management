import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  recordMaterialView,
  recordMaterialDownload
} from '../controllers/materialViewController.js';

const router = express.Router();

router.post('/', protect, authorize('student'), recordMaterialView);
router.post('/download', protect, authorize('student'), recordMaterialDownload);

export default router;

