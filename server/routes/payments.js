import express from 'express';
const router = express.Router();

import Payment from '../models/Payment.js';
import { protect } from '../middleware/auth.js';
import { createRazorpayOrder, verifyAndProcessRazorpay, getKeyId } from '../controllers/paymentController.js';
router.get('/', protect, async (req, res) => {
  try {
    const { session, from, to } = req.query;
    const filter = {};
    if (session) filter.session = session;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const payments = await Payment.find(filter).populate('order', 'orderNumber total').sort('-createdAt');
    res.json(payments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
router.get('/razorpay/key', getKeyId);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyAndProcessRazorpay);

export default router;