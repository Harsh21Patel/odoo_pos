import express from 'express';
const router = express.Router();

import { getAuthParams } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

router.get('/auth', protect, getAuthParams);

router.post('/', (req, res) => {
  res.json({ message: 'Upload endpoint working' });
});

export default router;