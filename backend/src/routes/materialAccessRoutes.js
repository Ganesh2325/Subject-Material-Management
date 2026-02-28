import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMaterialById } from '../controllers/materialAccessController.js';

const router = express.Router();

router.get('/:materialId', protect, getMaterialById);

export default router;

