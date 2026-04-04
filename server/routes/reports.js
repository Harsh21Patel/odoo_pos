import express from 'express';
const router = express.Router();

import { getDashboard, getSalesReport } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/auth.js';

router.get('/dashboard', protect, getDashboard);
router.get('/sales', protect, adminOnly, getSalesReport);

export default router;