// src/controllers/analyticsController.js
const Order = require("../models/Order");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildDateMatch = (period) => {
  if (!period) return {};
  const now = new Date();
  if (period === "today") {
    return { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
  }
  if (period === "this_week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return { createdAt: { $gte: start } };
  }
  if (period === "this_month") {
    return { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
  }
  return {};
};

const PAID_STATUSES   = ["paid", "preparing", "ready", "collected"];
const ACTIVE_STATUSES = ["pending", "received", "preparing"];

// ─── US5: Admin Analytics ─────────────────────────────────────────────────────

const getAdminAnalytics = async (req, res) => {
  try {
    const [salesOverTime, salesPerVendor, peakHours, topItems] = await Promise.all([

      // Total sales grouped by date
      Order.aggregate([
        { $match: { status: { $in: PAID_STATUSES } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Sales totals grouped by vendor
      Order.aggregate([
        { $match: { status: { $in: PAID_STATUSES } } },
        {
          $group: {
            _id: "$vendor",
            total: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Order counts grouped by hour of day
      Order.aggregate([
        {
          $group: {
            _id: { $hour: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top 10 most ordered menu items
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.menuItem",
            name: { $first: "$items.name" },
            totalOrdered: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({ salesOverTime, salesPerVendor, peakHours, topItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── US6: Vendor Overview Dashboard ──────────────────────────────────────────

const getVendorOverview = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const dateFilter = buildDateMatch(req.query.period);

    const paidMatch   = { vendor: vendorId,  status: { $in: PAID_STATUSES },   ...dateFilter };
    const activeMatch = { vendor: vendorId,  status: { $in: ACTIVE_STATUSES }, ...dateFilter };

    const [revenueResult, topSellers, activeOrdersResult] = await Promise.all([

      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        { $match: paidMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.menuItem",
            name: { $first: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
            revenue:   { $sum: "$items.subtotal" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),

      Order.aggregate([
        { $match: activeMatch },
        { $count: "count" },
      ]),
    ]);

    res.json({
      revenue:      revenueResult[0]?.total ?? 0,
      totalOrders:  revenueResult[0]?.count ?? 0,
      activeOrders: activeOrdersResult[0]?.count ?? 0,
      topSellers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── US7: Student Overview Dashboard ─────────────────────────────────────────

const getStudentOverview = async (req, res) => {
  try {
    const { studentId } = req.params;
    const dateFilter = buildDateMatch(req.query.period);

    const paidMatch   = { student: studentId, status: { $in: PAID_STATUSES },   ...dateFilter };
    const activeMatch = { student: studentId, status: { $in: ACTIVE_STATUSES }, ...dateFilter };

    const [spendResult, mostOrderedItems, favouriteVendorResult, activeOrdersResult] =
      await Promise.all([

        Order.aggregate([
          { $match: paidMatch },
          {
            $group: {
              _id: null,
              totalSpent:  { $sum: "$totalAmount" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),

        Order.aggregate([
          { $match: paidMatch },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.menuItem",
              name:         { $first: "$items.name" },
              timesOrdered: { $sum: "$items.quantity" },
            },
          },
          { $sort: { timesOrdered: -1 } },
          { $limit: 5 },
        ]),

        Order.aggregate([
          { $match: paidMatch },
          { $group: { _id: "$vendor", orderCount: { $sum: 1 } } },
          { $sort: { orderCount: -1 } },
          { $limit: 1 },
        ]),

        Order.aggregate([
          { $match: activeMatch },
          { $count: "count" },
        ]),
      ]);

    const totalSpent  = spendResult[0]?.totalSpent  ?? 0;
    const totalOrders = spendResult[0]?.totalOrders ?? 0;

    res.json({
      totalOrders,
      totalSpent,
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      activeOrders:      activeOrdersResult[0]?.count ?? 0,
      mostOrderedItems,
      favouriteVendor:   favouriteVendorResult[0] ?? {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminAnalytics, getVendorOverview, getStudentOverview };