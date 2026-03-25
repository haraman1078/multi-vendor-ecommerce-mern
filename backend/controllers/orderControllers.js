const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// CREATE ORDER
const createOrder = async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      user: req.user._id,
      product: productId,
      quantity,
      totalPrice,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders
const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user._id })
      .populate("product", "name price");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders };