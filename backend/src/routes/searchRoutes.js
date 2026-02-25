import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { searchContent } from '../services/searchService.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const { q } = req.query;

  const results = await searchContent(q || '');

  res.json(results);
});

export default router;

