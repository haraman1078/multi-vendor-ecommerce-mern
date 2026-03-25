const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  console.log("AUTH HEADER:", req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("TOKEN:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("DECODED:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      console.log("JWT ERROR:", error.message);
      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  }

  return res.status(401).json({
    message: "Not authorized, no token",
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role (${req.user.role}) not allowed`,
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };