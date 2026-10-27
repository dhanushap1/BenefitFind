
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function createAdmin() {
  try {
    if (
      !process.env.MONGODB_URI ||
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD
    ) {
      throw new Error(
        "Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env"
      );
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error("Configure a strong JWT_SECRET in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (password.length < 12) {
      throw new Error(
        "Admin password must be at least 12 characters."
      );
    }

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = "admin";
      await admin.save();
      console.log("Existing account promoted to admin.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);

      admin = await User.create({
        name: "BenefitFind Admin",
        email,
        password: hashedPassword,
        role: "admin"
      });

      console.log("Admin account created successfully.");
    }

    console.log("Admin email:", admin.email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
