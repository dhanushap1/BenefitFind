
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    // NEW: User role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    age: {
      type: Number
    },

    gender: {
      type: String
    },

    state: {
      type: String
    },

    district: {
      type: String
    },

    occupation: {
      type: String
    },

    income: {
      type: Number
    },

    education: {
      type: String
    },

    category: {
      type: String
    },

    disability: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
