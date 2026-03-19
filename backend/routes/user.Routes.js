const express=require("express");
const router =express.Router();
const User = require("../models/userModel")

const { registerUser,loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

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

module.exports = router;