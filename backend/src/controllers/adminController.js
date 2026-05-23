// ***** Aggregation Routes for Admin Dashboard Stats *****

import Order from "../models/order.js";
import Transaction from "../models/transaction.js";

export async function getDashboardStats(req, res) {
  try {
    const paidStatuses = ["paid", "shipped", "delivered"];

    // Calculate total revenues from successful orders only
    const revenueData = await Order.aggregate([
      { $match: { status: { $in: paidStatuses } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Calculate Total Unique Customers who have successfully completed an order
    const uniqueCustomers = await Order.distinct("email", {
      status: { $in: paidStatuses },
    });
    const totalCustomersCount = uniqueCustomers.length;

    // Chart Data Engine (Last 7 days trend)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chartAggregation = await Order.aggregate([
      {
        $match: {
          status: { $in: paidStatuses },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          // Group by year, month and day to keep dates seperate
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            dayOfWeek: { $dayOfWeek: "$createdAt" },
          },
          sales: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Map the numbers to weekday abbreviation names for your Recharts component
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const salesChartData = chartAggregation.map((item) => ({
      name: weekdayNames[item._id.dayOfWeek - 1], // Convert 1-indexed to 0-indexed array mapper
      sales: item.sales,
    }));

    // Standard fallback: If a day had zero orders, make sure the chart doesn't break
    // Fill empty days if needed, or simply pass the array up
    res.status(200).json({
      success: true,
      message: "Stats fetched successfully",
      data: {
        totalRevenue,
        totalCustomers: totalCustomersCount,
        salesChartData,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard stats",
      error: error.message,
    });
  }
}
