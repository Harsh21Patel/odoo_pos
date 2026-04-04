import QRCode from 'qrcode';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';

// GET all orders
export const getOrders = async (req, res) => {
  try {
    const { status, session, table, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (session) filter.session = session;
    if (table) filter.table = table;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .populate('table', 'number')
      .populate('staff', 'name')
      .populate('items.product', 'name price')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table')
      .populate('staff', 'name')
      .populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create order
export const createOrder = async (req, res) => {
  try {
    const { tableId, items, type, notes, sessionId } = req.body;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      taxAmount += (itemTotal * (item.tax || 0)) / 100;
      return { ...item, kitchenStatus: 'to-cook' };
    });

    const total = subtotal + taxAmount;

    const order = await Order.create({
      table: tableId,
      tableName: req.body.tableName,
      session: sessionId,
      staff: req.user._id,
      items: processedItems,
      kitchenStatus: 'to-cook',
      subtotal,
      taxAmount,
      total,
      type: type || 'dine-in',
      notes
    });

    // Mark table as occupied
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { status: 'occupied', currentOrder: order._id });
    }

    await order.populate('items.product', 'name price');

    // Emit socket event to kitchen
    const io = req.app.get('io');
    io.to('kitchen').emit('new-order', order);

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT update order
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('items.product', 'name price');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const io = req.app.get('io');
    io.to('kitchen').emit('order-updated', order);

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT update kitchen status
export const updateKitchenStatus = async (req, res) => {
  try {
    const { status, itemId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (itemId) {
      // Update individual item status
      const item = order.items.id(itemId);
      if (item) item.kitchenStatus = status;
    } else {
      // Update whole order kitchen status
      order.kitchenStatus = status;
      if (status === 'completed') order.status = 'ready';
    }

    await order.save();

    const io = req.app.get('io');
    io.to('kitchen').emit('kitchen-status-updated', order);
    io.to(`customer-${order.table}`).emit('order-status-updated', { orderId: order._id, status });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST process payment
export const processPayment = async (req, res) => {
  try {
    const { method, cashReceived, upiTransactionId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const changeGiven = method === 'cash' ? (cashReceived || 0) - order.total : 0;

    // Create payment record
    const payment = await Payment.create({
      order: order._id,
      session: order.session,
      amount: order.total,
      method,
      status: 'completed',
      cashReceived: cashReceived || order.total,
      changeGiven: Math.max(0, changeGiven),
      upiTransactionId,
      processedBy: req.user._id
    });

    // Update order
    order.status = 'paid';
    order.paymentMethod = method;
    await order.save();

    // Free up table
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

    // Update session totals
    if (order.session) {
      await Session.findByIdAndUpdate(order.session, {
        $inc: { totalSales: order.total, totalOrders: 1 }
      });
    }

    const io = req.app.get('io');
    io.to(`customer-${order.table}`).emit('payment-completed', { orderId: order._id, method });

    res.json({ order, payment, changeGiven: Math.max(0, changeGiven) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET generate UPI QR
export const generateUPIQR = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const upiId = process.env.UPI_ID || 'merchant@upi';
    const upiName = process.env.UPI_NAME || 'Odoo POS Cafe';
    const amount = order.total.toFixed(2);

    // Standard UPI deep link format
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + order.orderNumber)}`;

    const qrDataUrl = await QRCode.toDataURL(upiString, { width: 256, margin: 1 });

    res.json({ qrCode: qrDataUrl, upiId, amount, upiString });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};