import express from 'express';
const router = express.Router();

import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateKitchenStatus,
  processPayment,
  generateUPIQR
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.put('/:id', protect, updateOrder);
router.put('/:id/kitchen', protect, updateKitchenStatus);
router.post('/:id/payment', protect, processPayment);
router.get('/:id/upi-qr', protect, generateUPIQR);

export default router;