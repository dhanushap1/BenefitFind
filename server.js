
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Angular production build directory
const angularDist = path.join(
    __dirname,
    "frontend",
    "dist",
    "frontend",
    "browser"
);

// Middleware to read JSON data
app.use(express.json());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "BenefitFind API is working"
    });
});

// Serve Angular's compiled files
app.use(express.static(angularDist));

// Return Angular's index.html for frontend routes
app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            message: "API endpoint not found"
        });
    }

    res.sendFile(
        path.join(angularDist, "index.html"),
        (error) => {
            if (error) next(error);
        }
    );
});

// Connect to MongoDB and start the server
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from the environment");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`BenefitFind running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start BenefitFind:", error.message);
        process.exit(1);
    }
}

startServer();
