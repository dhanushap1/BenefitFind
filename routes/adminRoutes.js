
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        message: "Invalid admin credentials."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid admin credentials."
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Admin login successful.",
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      message: "Unable to log in. Please try again."
    });
  }
});

module.exports = router;
