const OrderLine = require("../models/order_line");
const ProductImage = require("../models/productImage");
const ProductVariation = require("../models/productVariation");
const ProductItem = require("../models/product_item");
const Product = require("../models/products");
const ProductCategory = require("../models/productSchema");
const { getOrderLines } = require("../utils/database");
const { AppError } = require("../utils/errors");

class DashboardService {
  static async getHomeData() {
    const orderLines = await getOrderLines();
    const populatedOrderLines = await ProductImage.populate(orderLines, {
      path: "Product_item_id",
      populate: { path: "Product_variation_id", model: ProductVariation, populate: { path: "Product_item_id", model: ProductItem, populate: { path: "Product_id", model: Product, populate: { path: "product_category_id", model: ProductCategory } } } },
    });

    const categoryStats = populatedOrderLines.reduce((acc, current) => {
      const categoryName = current.Product_item_id?.Product_variation_id?.Product_item_id?.Product_id?.product_category_id?.category_name;
      if (categoryName) {
        acc[categoryName] = acc[categoryName] || { totalQty: 0, totalPrice: 0 };
        acc[categoryName].totalQty += current.totalQty;
        acc[categoryName].totalPrice += current.totalPrice;
      }
      return acc;
    }, {});

    const sortedCategoryStats = Object.entries(categoryStats).map(([categoryName, stats]) => ({ categoryName, ...stats })).sort((a, b) => b.totalQty - a.totalQty);
    const totalQty = orderLines.reduce((acc, current) => acc + current.totalQty, 0);
    const totalPrice = orderLines.reduce((acc, current) => acc + current.totalPrice, 0);

    return { bestProducts: populatedOrderLines, sortedCategoryStats, totalQty, totalPrice };
  }

  static async getChartData(query) {
    const orderLines = await OrderLine.aggregate([
      { $lookup: { from: "shop_orders", localField: "Order_id", foreignField: "_id", as: "orderDetails" } },
      { $unwind: "$orderDetails" },
      { $lookup: { from: "order_statuses", localField: "orderDetails.Order_status", foreignField: "_id", as: "orderStatusDetails" } },
      { $unwind: "$orderStatusDetails" },
      { $addFields: { combined: { $zip: { inputs: ["$Qty", "$Price", "$Offer_percentage", "$Coupon_percentage", "$Status"] } } } },
      { $unwind: "$combined" },
      { $match: { "combined.4": "Delivered" } },
      {
        $addFields: {
          finalPrice: {
            $subtract: [
              { $subtract: [{ $arrayElemAt: ["$combined", 1] }, { $divide: [{ $multiply: [{ $arrayElemAt: ["$combined", 1] }, { $arrayElemAt: ["$combined", 2] }] }, 100] }] },
              { $divide: [{ $multiply: [{ $subtract: [{ $arrayElemAt: ["$combined", 1] }, { $divide: [{ $multiply: [{ $arrayElemAt: ["$combined", 1] }, { $arrayElemAt: ["$combined", 2] }] }, 100] }] }, { $arrayElemAt: ["$combined", 3] }] }, 100] },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderStatusDetails.createdAt" } },
          total_orders: { $sum: 1 },
          total_sales: { $sum: { $multiply: ["$finalPrice", { $arrayElemAt: ["$combined", 0] }] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", total_orders: 1, total_sales: 1 } },
    ]);

    let dates = [], totalOrders = [], totalSales = [];
    const padZero = num => (num < 10 ? "0" + num : num);

    if (query === "daily") {
      const today = new Date();
      for (let i = 0; i < 10; i++) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        dates.unshift(`${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`);
      }
      dates.forEach(date => {
        const found = orderLines.find(entry => entry.date === date);
        totalOrders.push(found ? parseInt(found.total_orders) : 0);
        totalSales.push(found ? parseFloat(found.total_sales.toFixed(2)) : 0);
      });
    } else if (query === "weekly") {
      const today = new Date();
      for (let i = 0; i < 10; i++) {
        const startDate = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        dates.unshift(`Week ${10 - i}: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        const found = orderLines.filter(entry => new Date(entry.date) >= startDate && new Date(entry.date) <= endDate);
        totalOrders.push(found.length ? parseInt(found.reduce((acc, curr) => acc + curr.total_orders, 0)) : 0);
        totalSales.push(found.length ? parseFloat(found.reduce((acc, curr) => acc + curr.total_sales, 0).toFixed(2)) : 0);
      }
    }

    return { dates, totalOrders, totalSales };
  }

  static async getSalesReport() {
    const productDetails = await OrderLine.aggregate([
      { $lookup: { from: "shop_orders", localField: "Order_id", foreignField: "_id", as: "Shop_Orders" } },
      { $unwind: "$Shop_Orders" },
      { $lookup: { from: "users", localField: "Shop_Orders.User_id", foreignField: "_id", as: "User" } },
      { $unwind: "$User" },
      { $lookup: { from: "payment_types", localField: "Shop_Orders.Payment_method_id", foreignField: "_id", as: "Payment_type" } },
      { $unwind: "$Payment_type" },
      { $lookup: { from: "order_statuses", localField: "Shop_Orders.Order_status", foreignField: "_id", as: "status" } },
      { $unwind: "$status" },
    ]).exec();

    const filteredDetails = productDetails.map(order => {
      const deliveredIndexes = order.Status.map((status, idx) => status === "Delivered" ? idx : -1).filter(idx => idx !== -1);
      return {
        ...order,
        Product_item_id: order.Product_item_id.filter((_, idx) => deliveredIndexes.includes(idx)),
        Product_name: order.Product_name.filter((_, idx) => deliveredIndexes.includes(idx)),
        Price: order.Price.filter((_, idx) => deliveredIndexes.includes(idx)),
        Offer_percentage: order.Offer_percentage.filter((_, idx) => deliveredIndexes.includes(idx)),
        Qty: order.Qty.filter((_, idx) => deliveredIndexes.includes(idx)),
        Status: order.Status.filter((_, idx) => deliveredIndexes.includes(idx)),
        Coupon_percentage: order.Coupon_percentage.filter((_, idx) => deliveredIndexes.includes(idx)),
      };
    }).filter(order => order.Status.length > 0);

    let totalRevenue = 0, totalDiscount = 0, couponDiscount = 0;
    filteredDetails.forEach(order => {
      totalRevenue += order.Shop_Orders.Order_total;
      totalDiscount += order.Shop_Orders.Sales_discount;
      couponDiscount += order.Shop_Orders.Coupon_discount;
    });

    const totalOrders = filteredDetails.length;
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    return { productDetails: filteredDetails, totalRevenue, totalDiscount, couponDiscount, averageOrderValue };
  }
}

module.exports = DashboardService;