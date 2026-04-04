import express from 'express';
const router = express.Router();

import Table from '../models/Table.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// ──────────────────────────────────────────────
// IMPORTANT: More-specific routes MUST come before /:token
// ──────────────────────────────────────────────

// GET /api/self-order/order/:orderId/status
// Poll order + kitchen status (public)
router.get('/order/:orderId/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'name price')
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    res.json({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      kitchenStatus: order.kitchenStatus,
      items: order.items,
      total: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/self-order/order/:orderId/pay
// Process payment (public)
router.post('/order/:orderId/pay', async (req, res) => {
  try {
    const { method } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.status === 'paid') {
      return res.status(400).json({ message: 'Order already paid.' });
    }

    await Payment.create({
      order: order._id,
      amount: order.total,
      method: method || 'cash',
      status: 'completed',
      cashReceived: order.total,
      changeGiven: 0
    });

    order.status = 'paid';
    order.paymentMethod = method || 'cash';
    await order.save();

    // Free table
    await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });

    const io = req.app.get('io');
    io.to(`customer-${order.table}`).emit('payment-completed', { orderId: order._id, method });

    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/self-order/:token
// Resolve token → return table info + menu data
// ──────────────────────────────────────────────
router.get('/:token', async (req, res) => {
  try {
    const table = await Table.findOne({ qrToken: req.params.token })
      .populate('floor', 'name');

    if (!table) return res.status(404).json({ message: 'Table not found or QR is invalid.' });
    if (!table.isActive) return res.status(403).json({ message: 'This table is currently inactive.' });

    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).populate('category', 'name icon').lean(),
      Category.find({ isActive: true }).lean()
    ]);

    res.json({
      table: {
        _id: table._id,
        number: table.number,
        seats: table.seats,
        floor: table.floor,
        status: table.status
      },
      products,
      categories
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/self-order/:token/order
// Place a new order (public, no auth)
// ──────────────────────────────────────────────
router.post('/:token/order', async (req, res) => {
  try {
    const table = await Table.findOne({ qrToken: req.params.token });
    if (!table) return res.status(404).json({ message: 'Invalid QR code.' });

    const { items, notes } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: 'No items in order.' });

    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return { ...item, kitchenStatus: 'to-cook' };
    });

    const order = await Order.create({
      table: table._id,
      tableName: table.number,
      items: processedItems,
      kitchenStatus: 'to-cook',
      status: 'sent-to-kitchen',
      subtotal,
      taxAmount: 0,
      total: subtotal,
      type: 'dine-in',
      source: 'self-order',
      notes: notes || ''
    });

    // Mark table occupied
    await Table.findByIdAndUpdate(table._id, {
      status: 'occupied',
      currentOrder: order._id
    });

    await order.populate('items.product', 'name price');

    // Emit to kitchen
    const io = req.app.get('io');
    io.to('kitchen').emit('new-order', order);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
