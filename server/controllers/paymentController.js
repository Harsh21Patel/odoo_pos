import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
  });
};

export const getKeyId = (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(order.total * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `rcpt_${order.orderNumber}`
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json(razorpayOrder);
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyAndProcessRazorpay = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, method } = req.body;
    
    // verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Process payment
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'paid') return res.json({ success: true, message: 'Already paid', order });

    const processedMethod = method || 'digital';

    const payment = await Payment.create({
      order: order._id,
      session: order.session,
      amount: order.total,
      method: processedMethod,
      status: 'completed',
      cashReceived: order.total,
      changeGiven: 0,
      upiTransactionId: razorpay_payment_id,
      processedBy: req.user ? req.user._id : undefined
    });

    order.status = 'paid';
    order.paymentMethod = processedMethod;
    await order.save();

    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

    if (order.session) {
      await Session.findByIdAndUpdate(order.session, {
        $inc: { totalSales: order.total, totalOrders: 1 }
      });
    }

    const io = req.app.get('io');
    if (io) io.to(`customer-${order.table}`).emit('payment-completed', { orderId: order._id, method: processedMethod });

    res.json({ success: true, order, payment });
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ message: error.message });
  }
};
