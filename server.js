
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware to read JSON data
app.use(express.json());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/admin", adminRoutes);

// Default page: User/Admin selection
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "login-type.html")
    );
});

// Serve other frontend files
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Node.js server is working"
    });
});

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
