import express from 'express';
const router = express.Router();

import {
  getCurrentSession,
  getSessions,
  openSession,
  closeSession
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

router.get('/current', protect, getCurrentSession);
router.get('/', protect, getSessions);
router.post('/open', protect, openSession);
router.put('/close', protect, closeSession);

export default router;