
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/* =========================================
   REGISTER NEW USER
========================================= */

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body || {};

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || !cleanEmail) {
            return res.status(400).json({
                message: "Name and email cannot be empty."
            });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long."
            });
        }

        // Check for an existing account
        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered. Please log in."
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = new User({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword
        });

        await user.save();

        // Return safe user information only
        return res.status(201).json({
            message: "Account created successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        // Handle duplicate email errors
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered. Please log in."
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});

/* =========================================
   LOGIN EXISTING USER
========================================= */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Account not found. Please create an account first."
            });
        }

        // Compare entered password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        return res.status(200).json({
            message: "Login successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});

/* =========================================
   GET USER PROFILE
========================================= */

router.get("/profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.status(200).json({ user });

    } catch (error) {
        console.error("Get profile error:", error.message);

        res.status(500).json({
            message: "Unable to load profile."
        });
    }
});


/* =========================================
   UPDATE USER PROFILE
========================================= */

router.put("/profile/:id", async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            state,
            district,
            occupation,
            income,
            education,
            category,
            disability
        } = req.body || {};

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Please enter your name."
            });
        }

        // Convert the income dropdown into a numeric range
        const incomeRanges = {
            "Below ₹2.5 lakh": 250000,
            "₹2.5 - ₹5 lakh": 500000,
            "₹5 - ₹10 lakh": 1000000,
            "Above ₹10 lakh": 1000001
        };

        const parsedAge =
            age === "" || age == null ? undefined : Number(age);

        if (
            parsedAge !== undefined &&
            (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120)
        ) {
            return res.status(400).json({
                message: "Please enter a valid age."
            });
        }

        const updateData = {
            name: name.trim(),
            age: parsedAge,
            gender,
            state,
            district,
            occupation,
            income: incomeRanges[income] ?? undefined,
            education,
            category,
            disability: disability === "Yes"
        };

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error.message);

        res.status(500).json({
            message: "Unable to update profile."
        });
    }
});


module.exports = router;
