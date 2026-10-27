
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please log in as an admin."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" || !decoded.userId) {
      return res.status(403).json({
        message: "Admin access required."
      });
    }

    const admin = await User.findById(decoded.userId).select("role");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        message: "Admin access denied."
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token. Please log in again."
      });
    }

    console.error("Admin authentication error:", error);

    return res.status(500).json({
      message: "Unable to verify admin access."
    });
  }
}

module.exports = adminAuth;
