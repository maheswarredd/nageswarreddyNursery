const Plant = require('../models/Plant');
const Order = require('../models/Order');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { Parser } = require('json2csv');

// Admin Dashboard KPI Stats & Charts
const getDashboardStats = async (req, res, next) => {
  try {
    const settings = (await Setting.findOne()) || { lowStockThreshold: 5 };
    const lowStockThreshold = settings.lowStockThreshold || 5;

    // Plant Metrics
    const totalPlants = await Plant.countDocuments();
    const availablePlants = await Plant.countDocuments({ isAvailable: true, stock: { $gt: 0 } });
    const soldOutPlants = await Plant.countDocuments({ $or: [{ isAvailable: false }, { stock: 0 }] });
    const lowStockPlants = await Plant.find({ stock: { $gt: 0, $lte: lowStockThreshold } }).select('name stock price images categoryName');

    // Order Metrics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'PENDING' });
    const acceptedOrders = await Order.countDocuments({ orderStatus: { $in: ['ACCEPTED', 'PROCESSING', 'READY_FOR_DELIVERY'] } });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'CANCELLED' });

    // Payment Metrics
    const pendingPayments = await Order.countDocuments({ paymentStatus: { $in: ['PENDING', 'SUBMITTED'] } });
    const completedPayments = await Order.countDocuments({ paymentStatus: 'VERIFIED' });
    const refundedPayments = await Order.countDocuments({ paymentStatus: 'REFUNDED' });

    // Sales calculations
    const deliveredOrderDocs = await Order.find({ orderStatus: 'DELIVERED' });
    const totalSales = deliveredOrderDocs.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const pendingPaymentDocs = await Order.find({ paymentStatus: { $in: ['PENDING', 'SUBMITTED'] } });
    const pendingPaymentAmount = pendingPaymentDocs.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Payment method breakdown
    const codOrdersCount = await Order.countDocuments({ paymentMethod: 'COD' });
    const upiOrdersCount = await Order.countDocuments({ paymentMethod: 'UPI' });

    // Best-Selling Plants Aggregation
    const bestSellersAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.plant',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 6 }
    ]);

    // Sales over last 7 days for charts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo },
      orderStatus: { $ne: 'CANCELLED' }
    });

    const dailyChartMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(5, 10); // MM-DD
      dailyChartMap[key] = { date: key, sales: 0, orders: 0 };
    }

    recentOrders.forEach(ord => {
      const key = ord.createdAt.toISOString().slice(5, 10);
      if (dailyChartMap[key]) {
        dailyChartMap[key].sales += ord.totalAmount;
        dailyChartMap[key].orders += 1;
      }
    });

    const salesChart = Object.values(dailyChartMap);

    res.json({
      success: true,
      metrics: {
        totalPlants,
        availablePlants,
        soldOutPlants,
        lowStockCount: lowStockPlants.length,
        totalOrders,
        pendingOrders,
        acceptedOrders,
        deliveredOrders,
        cancelledOrders,
        totalSales,
        pendingPayments,
        pendingPaymentAmount,
        completedPayments,
        refundedPayments,
        paymentMethods: {
          cod: codOrdersCount,
          upi: upiOrdersCount
        }
      },
      lowStockPlants,
      bestSellers: bestSellersAggregation,
      salesChart
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Export CSV Reports (orders, plants, payments, customers)
const exportReportCSV = async (req, res, next) => {
  try {
    const { type = 'orders' } = req.query;
    let csvData = '';
    let filename = `nageswarreddy_${type}_report_${Date.now()}.csv`;

    if (type === 'orders') {
      const orders = await Order.find().sort({ createdAt: -1 });
      const fields = [
        { label: 'Order ID', value: 'orderId' },
        { label: 'Customer Name', value: 'customerName' },
        { label: 'Customer Email', value: 'customerEmail' },
        { label: 'Customer Phone', value: 'customerPhone' },
        { label: 'Total Amount', value: 'totalAmount' },
        { label: 'Payment Method', value: 'paymentMethod' },
        { label: 'Payment Status', value: 'paymentStatus' },
        { label: 'Order Status', value: 'orderStatus' },
        { label: 'District', value: 'deliveryAddress.district' },
        { label: 'PIN Code', value: 'deliveryAddress.pinCode' },
        { label: 'Order Date', value: 'createdAt' }
      ];
      const parser = new Parser({ fields });
      csvData = parser.parse(orders);
    } else if (type === 'plants') {
      const plants = await Plant.find().sort({ stock: 1 });
      const fields = [
        { label: 'Plant Name', value: 'name' },
        { label: 'Category', value: 'categoryName' },
        { label: 'Price', value: 'price' },
        { label: 'Discount Price', value: 'discountPrice' },
        { label: 'Stock', value: 'stock' },
        { label: 'Status', value: (row) => row.stock > 0 && row.isAvailable ? 'AVAILABLE' : 'SOLD OUT' },
        { label: 'Sunlight', value: 'sunlightRequirement' },
        { label: 'Watering', value: 'wateringRequirement' }
      ];
      const parser = new Parser({ fields });
      csvData = parser.parse(plants);
    } else if (type === 'payments') {
      const payments = await Order.find({ paymentMethod: 'UPI' }).sort({ createdAt: -1 });
      const fields = [
        { label: 'Order ID', value: 'orderId' },
        { label: 'Payer Name', value: 'upiDetails.payerName' },
        { label: 'UTR', value: 'upiDetails.utr' },
        { label: 'Amount', value: 'totalAmount' },
        { label: 'Payment Status', value: 'paymentStatus' },
        { label: 'Submission Date', value: 'upiDetails.submittedAt' },
        { label: 'Customer Email', value: 'customerEmail' }
      ];
      const parser = new Parser({ fields });
      csvData = parser.parse(payments);
    } else if (type === 'customers') {
      const users = await User.find({ role: 'customer' }).select('-password');
      const fields = [
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'Registered Date', value: 'createdAt' }
      ];
      const parser = new Parser({ fields });
      csvData = parser.parse(users);
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    return res.send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  exportReportCSV
};
