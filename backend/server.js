require("dotenv").config(); // only needs to be here once — first line

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// routes
const userRoutes    = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes   = require("./routes/orderRoutes");
const aiRoutes      = require("./routes/aiRoutes");

// connect DB
connectDB();

// initialize app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// test route
app.get("/", (req, res) => {
  res.send("Server Working");
});

// api routes
app.use("/api/users",    userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/ai",       aiRoutes);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});