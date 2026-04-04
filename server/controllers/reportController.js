import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

// GET dashboard summary
export const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, todayRevenue, totalOrders] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow }, status: 'paid' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: 'paid' })
    ]);

    // Revenue by payment method today
    const paymentBreakdown = await Payment.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: 'completed' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: today, $lt: tomorrow } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Last 7 days revenue
    const last7Days = await Order.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalOrders,
      paymentBreakdown,
      topProducts,
      last7Days
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET sales report
export const getSalesReport = async (req, res) => {
  try {
    const { from, to, session, staff } = req.query;
    const filter = { status: 'paid' };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59); filter.createdAt.$lte = toDate; }
    }
    if (session) filter.session = session;
    if (staff) filter.staff = staff;

    const orders = await Order.find(filter)
      .populate('table', 'number')
      .populate('staff', 'name')
      .sort('-createdAt');

    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      totalTax: orders.reduce((sum, o) => sum + o.taxAmount, 0),
      byMethod: {}
    };

    orders.forEach(o => {
      if (o.paymentMethod) {
        summary.byMethod[o.paymentMethod] = (summary.byMethod[o.paymentMethod] || 0) + o.total;
      }
    });

    res.json({ orders, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};