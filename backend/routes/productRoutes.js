const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createProduct,
  getProducts,
  getMyProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");


// ---------------- PUBLIC ----------------
router.get("/", getProducts);

// ---------------- VENDOR ----------------

// ✅ Upload route FIRST
router.post(
  "/upload",
  protect,
  authorizeRoles("vendor"),
  upload.array("images", 5), 
  (req, res) => {
    if (!req.files) {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    const filePaths = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      message: "Images uploaded",
      filePaths,
    });
  }
);

// Product CRUD
router.post("/", protect, authorizeRoles("vendor"), createProduct);
router.get("/my-products", protect, authorizeRoles("vendor"), getMyProducts);

// ❗ Dynamic routes ALWAYS at bottom
router.put("/:id", protect, authorizeRoles("vendor"), updateProduct);
router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);

module.exports = router;