const express = require("express");
const router = express.Router();

const { createOrder, getMyOrders } = require("../controllers/orderControllers");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// customer routes
router.post("/", protect, authorizeRoles("customer"), createOrder);
router.get("/my-orders", protect, authorizeRoles("customer"), getMyOrders);

module.exports = router;