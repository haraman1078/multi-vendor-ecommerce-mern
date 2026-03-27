const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // total products
    const totalProducts = await Product.countDocuments({ vendor: vendorId });

    // vendor orders
    const orders = await Order.find({
      "orderItems.vendor": vendorId,
    });

    // total orders
    const totalOrders = orders.length;

    // total revenue
    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVendorDashboard };