const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");



// load env
dotenv.config({ path: __dirname + "/.env" });

// connect DB
connectDB();

// initialize app FIRST
const app = express();


// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// middleware
app.use(cors());
app.use(express.json());



const orderRoutes = require("./routes/orderRoutes");
// routes imports
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

// test route
app.get("/", (req, res) => {
  res.send("Server Working");
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// test route
app.get("/create-user", async (req, res) => {
  const User = require("./models/userModel");

  const user = new User({
    name: "Test User",
    email: "test@gmail.com",
    password: "123456",
    role: "vendor",
  });

  await user.save();

  res.send("User Created Successfully");
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});