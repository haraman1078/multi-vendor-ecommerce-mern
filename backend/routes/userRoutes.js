const express=require("express");
const router =express.Router();
const User = require("../models/userModel")

const { registerUser,loginUser } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.send("Welcome Admin");
});

router.get("/vendor", protect, authorizeRoles("vendor"), (req, res) => {
  res.send("Welcome Vendor");
});

router.get("/customer", protect, authorizeRoles("customer"), (req, res) => {
  res.send("Welcome Customer");
});

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});
router.post("/register", registerUser);
router.post("/login", loginUser);


router.post("/test-user", async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, role } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.get(
  "/all-users",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const User = require("../models/userModel");
      const users = await User.find().select("-password").sort({ createdAt: -1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
)

module.exports = router;