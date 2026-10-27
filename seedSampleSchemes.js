require("dotenv").config();
const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");

const sampleSchemes = [
    {
        name: "Post-Matric Scholarship",
        category: "Education",
        benefit: "Up to ₹25,000 per year",
        deadline: "2026-08-28",
        description: "Financial assistance for eligible students pursuing higher education.",
        url: "https://scholarships.gov.in",
        eligibility: {
            maxAge: 30,
            maxIncome: 250000,
            education: ["Undergraduate", "Postgraduate"],
            categories: ["SC", "ST", "OBC"],
            occupations: ["Student"]
        },
        active: true
    },
    {
        name: "Student Financial Assistance",
        category: "Education",
        benefit: "Financial support for education",
        deadline: "2026-09-18",
        description: "Support for eligible students to continue their education.",
        url: "https://scholarships.gov.in",
        eligibility: {
            maxAge: 30,
            maxIncome: 500000,
            education: ["School", "Diploma", "Undergraduate", "Postgraduate"],
            occupations: ["Student"]
        },
        active: true
    },
    {
        name: "State Housing Assistance",
        category: "Housing",
        benefit: "Housing assistance",
        deadline: "2026-09-05",
        description: "Demonstration entry for housing assistance.",
        url: "https://www.india.gov.in",
        eligibility: {
            states: ["Kerala"],
            maxIncome: 500000
        },
        active: true
    },
    {
        name: "Employment Support Scheme",
        category: "Employment",
        benefit: "Training and financial assistance",
        deadline: "2026-09-22",
        description: "Demonstration entry for employment-oriented support.",
        url: "https://www.india.gov.in",
        eligibility: {
            occupations: ["Student", "Self-employed"],
            maxAge: 35
        },
        active: true
    },
    {
        name: "Healthcare Assistance",
        category: "Healthcare",
        benefit: "Medical assistance",
        deadline: "2026-09-30",
        description: "Demonstration entry for healthcare assistance.",
        url: "https://www.india.gov.in",
        eligibility: {
            maxIncome: 500000
        },
        active: true
    },
    {
        name: "Farmer Support Programme",
        category: "Agriculture",
        benefit: "Agricultural financial support",
        deadline: "2026-10-15",
        description: "Demonstration entry for agricultural support.",
        url: "https://www.india.gov.in",
        eligibility: {
            occupations: ["Farmer"]
        },
        active: true
    }
];

async function seedSchemes() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        for (const scheme of sampleSchemes) {
            await Scheme.updateOne(
                { name: scheme.name },
                { $setOnInsert: scheme },
                { upsert: true }
            );
        }

        console.log("Sample schemes imported successfully.");
        console.log("Existing schemes were preserved.");
    } catch (error) {
        console.error("Error importing schemes:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedSchemes();