const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel"); // ✅ was missing — caused crash on status update

const {
  createOrder,
  getMyOrders,
  getVendorDashboard,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderControllers");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ── Customer ─────────────────────────────────────────────────────────────────
router.post("/",         protect, authorizeRoles("customer"), createOrder);
router.get("/my-orders", protect, authorizeRoles("customer"), getMyOrders);

// ── Vendor ───────────────────────────────────────────────────────────────────
router.get("/vendor-dashboard", protect, authorizeRoles("vendor"), getVendorDashboard);

// ── Admin ────────────────────────────────────────────────────────────────────
router.get("/all-orders",      protect, authorizeRoles("admin"), getAllOrders);
router.put("/:id/status",      protect, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;