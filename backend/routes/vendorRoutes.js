const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // 1. Get vendor products
    const products = await Product.find({ vendor: vendorId });

    const productIds = products.map(p => p._id);

    // 2. Total products
    const totalProducts = products.length;

    // 3. Get orders of those products
    const orders = await Order.find({
      product: { $in: productIds },
    });

    // 4. Total orders
    const totalOrders = orders.length;

    // 5. Total revenue
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