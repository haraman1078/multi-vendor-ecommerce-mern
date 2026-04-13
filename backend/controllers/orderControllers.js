const Order   = require("../models/orderModel");
const Product = require("../models/productModel");

// ── CREATE ORDER ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    for (let item of orderItems) {
      if (!item.product) {
        return res.status(400).json({ message: "Invalid product in order" });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalPrice,
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY ORDERS (customer) ──────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── VENDOR DASHBOARD ─────────────────────────────────────────────────────────
// Returns: stats + recent orders that contain vendor's products
const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // 1. Get all products belonging to this vendor
    const vendorProducts = await Product.find({ vendor: vendorId }).select("_id name price");
    const vendorProductIds = vendorProducts.map((p) => p._id.toString());

    if (vendorProductIds.length === 0) {
      return res.json({
        stats: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUnitsSold: 0 },
        recentOrders: [],
        topProducts: [],
      });
    }

    // 2. Find all orders containing at least one vendor product
    const orders = await Order.find({
      "orderItems.product": { $in: vendorProductIds },
    })
      .populate("orderItems.product", "name price images")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // 3. For each order, filter only the vendor's items
    const vendorOrders = orders.map((order) => {
      const vendorItems = order.orderItems.filter((item) =>
        item.product && vendorProductIds.includes(item.product._id.toString())
      );
      const orderRevenue = vendorItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.qty,
        0
      );
      return {
        _id:          order._id,
        user:         order.user,
        status:       order.status,
        createdAt:    order.createdAt,
        vendorItems,
        orderRevenue,
      };
    });

    // 4. Compute stats
    const totalRevenue   = vendorOrders.reduce((sum, o) => sum + o.orderRevenue, 0);
    const totalUnitsSold = vendorOrders.reduce(
      (sum, o) => sum + o.vendorItems.reduce((s, i) => s + i.qty, 0), 0
    );

    // 5. Top products by units sold
    const productSales = {};
    vendorOrders.forEach((order) => {
      order.vendorItems.forEach((item) => {
        if (!item.product) return;
        const pid = item.product._id.toString();
        if (!productSales[pid]) {
          productSales[pid] = { name: item.product.name, unitsSold: 0, revenue: 0 };
        }
        productSales[pid].unitsSold += item.qty;
        productSales[pid].revenue  += item.product.price * item.qty;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    res.json({
      stats: {
        totalRevenue,
        totalOrders:   vendorOrders.length,
        totalProducts: vendorProducts.length,
        totalUnitsSold,
      },
      recentOrders: vendorOrders.slice(0, 10),
      topProducts,
    });
  } catch (error) {
    console.error("VENDOR DASHBOARD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL ORDERS (admin) ────────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 });

    // Admin stats
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const statusCounts = {
      pending:   orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipped:   orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };

    res.json({ orders, totalRevenue, statusCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE ORDER STATUS (admin) ───────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.status = req.body.status;
    await order.save();

    res.json({ message: "Status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getVendorDashboard,
  getAllOrders,
  updateOrderStatus,
};