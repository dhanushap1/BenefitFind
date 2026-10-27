
const express = require("express");
const mongoose = require("mongoose");
const Scheme = require("../models/Scheme");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// GET: Retrieve all schemes (public access)
router.get("/", async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        res.json(schemes);
    } catch (error) {
        console.error("Fetch schemes error:", error);
        res.status(500).json({
            message: "Unable to fetch schemes."
        });
    }
});

// POST: Add a new scheme (admin only)
router.post("/", adminAuth, async (req, res) => {
    try {
        const {
            name,
            category,
            benefit,
            deadline,
            description,
            url,
            eligibility
        } = req.body;

        if (
            !name?.trim() ||
            !category ||
            !benefit?.trim() ||
            !deadline?.trim()
        ) {
            return res.status(400).json({
                message: "Name, category, benefit, and deadline are required."
            });
        }

        const scheme = await Scheme.create({
            name: name.trim(),
            category,
            benefit: benefit.trim(),
            deadline: deadline.trim(),
            description,
            url,
            eligibility
        });

        res.status(201).json({
            message: "Scheme added successfully.",
            scheme
        });
    } catch (error) {
        console.error("Add scheme error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Unable to add scheme."
        });
    }
});

// PUT: Update an existing scheme (admin only)
router.put("/:id", adminAuth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid scheme ID."
            });
        }

        const {
            _id,
            id,
            __v,
            createdAt,
            updatedAt,
            ...updates
        } = req.body;

        const scheme = await Scheme.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!scheme) {
            return res.status(404).json({
                message: "Scheme not found."
            });
        }

        res.json({
            message: "Scheme updated successfully.",
            scheme
        });
    } catch (error) {
        console.error("Update scheme error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Unable to update scheme."
        });
    }
});

// DELETE: Remove a scheme (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid scheme ID."
            });
        }

        const scheme = await Scheme.findByIdAndDelete(req.params.id);

        if (!scheme) {
            return res.status(404).json({
                message: "Scheme not found."
            });
        }

        res.json({
            message: "Scheme deleted successfully."
        });
    } catch (error) {
        console.error("Delete scheme error:", error);

        res.status(500).json({
            message: "Unable to delete scheme."
        });
    }
});

module.exports = router;
