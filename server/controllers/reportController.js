import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

// GET dashboard summary
export const getDashboard = async (req, res) => {
  try {
    const { duration = 'today', from, to } = req.query;
    
    let startDate = new Date();
    let endDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();
    let groupByFormat = '%Y-%m-%d';
    // Define the period constraints
    if (duration === 'today') {
      startDate.setHours(0, 0, 0, 0);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevEndDate = new Date(startDate);
      groupByFormat = '%H:00';
    } else if (duration === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
      prevEndDate = new Date(startDate);
    } else if (duration === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
      prevEndDate = new Date(startDate);
    } else if (duration === '365days') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      prevStartDate = new Date(startDate);
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
      prevEndDate = new Date(startDate);
      groupByFormat = '%Y-%m';
    } else if (duration === 'custom' && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      const diff = endDate.getTime() - startDate.getTime();
      prevStartDate = new Date(startDate.getTime() - diff);
      prevEndDate = new Date(startDate);
    } else {
      // Fallback
      startDate.setHours(0, 0, 0, 0);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevEndDate = new Date(startDate);
      groupByFormat = '%H:00';
    }

    // 1. Current Period Metrics
    const currMetrics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, orderCount: { $sum: 1 } } }
    ]);
    const currRevenue = currMetrics[0]?.totalRevenue || 0;
    const currOrders = currMetrics[0]?.orderCount || 0;
    const currAvgOrder = currOrders > 0 ? currRevenue / currOrders : 0;

    // 2. Previous Period Metrics
    const prevMetrics = await Order.aggregate([
      { $match: { createdAt: { $gte: prevStartDate, $lt: prevEndDate }, status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, orderCount: { $sum: 1 } } }
    ]);
    const prevRevenue = prevMetrics[0]?.totalRevenue || 0;
    const prevOrders = prevMetrics[0]?.orderCount || 0;
    const prevAvgOrder = prevOrders > 0 ? prevRevenue / prevOrders : 0;

    // 3. Sales Chart (Time vs Revenue)
    const salesChart = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'paid' } },
      { $group: { _id: { $dateToString: { format: groupByFormat, date: '$createdAt' } }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]);

    // 4. Categories & Products Aggregation
    // To get category, we lookup products. To get category name, we lookup categories.
    const itemsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'paid' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDoc' } },
      { $unwind: '$productDoc' },
      { $lookup: { from: 'categories', localField: 'productDoc.category', foreignField: '_id', as: 'categoryDoc' } },
      { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: { 
          productName: '$items.productName', 
          categoryName: '$categoryDoc.name' 
        },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        qty: { $sum: '$items.quantity' }
      }}
    ]);

    const topProductsMap = {};
    const topCategoriesMap = {};

    itemsAgg.forEach(item => {
      const pName = item._id.productName;
      const cName = item._id.categoryName || 'Uncategorized';
      if (!topProductsMap[pName]) topProductsMap[pName] = { name: pName, qty: 0, revenue: 0 };
      topProductsMap[pName].qty += item.qty;
      topProductsMap[pName].revenue += item.revenue;

      if (!topCategoriesMap[cName]) topCategoriesMap[cName] = { name: cName, revenue: 0 };
      topCategoriesMap[cName].revenue += item.revenue;
    });

    const topProducts = Object.values(topProductsMap).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
    const topCategoriesRaw = Object.values(topCategoriesMap).sort((a,b) => b.revenue - a.revenue);
    
    // Convert topCategories into pie chart percentages
    const totalCatRev = topCategoriesRaw.reduce((sum, c) => sum + c.revenue, 0);
    const pieColors = ['#f59e0b', '#3b82f6', '#10b981', '#1f2937', '#8b5cf6', '#ef4444'];
    const categoryChart = topCategoriesRaw.map((c, i) => ({
      name: c.name,
      revenue: c.revenue,
      percent: totalCatRev > 0 ? (c.revenue / totalCatRev) * 100 : 0,
      fill: pieColors[i % pieColors.length]
    }));

    // 5. Top Orders Table
    const topOrders = await Order.find({ createdAt: { $gte: startDate, $lte: endDate }, status: 'paid' })
      .sort('-total')
      .limit(5)
      .populate('session', 'sessionNumber')
      .populate('staff', 'name')
      .populate('table', 'number')
      .lean();

    res.json({
      summary: {
        currRevenue, currOrders, currAvgOrder,
        prevRevenue, prevOrders, prevAvgOrder
      },
      salesChart: salesChart.map(s => ({ time: s._id, revenue: s.revenue })),
      categoryChart,
      topOrders: topOrders.map(o => ({
        orderNumber: o.orderNumber,
        session: o.session ? o.session.sessionNumber : '-',
        pos: o.tableName || (o.table ? o.table.number : 'Walk-in'),
        date: o.createdAt,
        employee: o.staff ? o.staff.name : 'Self-Order',
        total: o.total
      })),
      topProducts,
      topCategories: topCategoriesRaw.slice(0, 5)
    });
  } catch (error) {
    console.error('getDashboard Error:', error);
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