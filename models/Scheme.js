
const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Education",
                "Employment",
                "Housing",
                "Healthcare",
                "Agriculture"
            ]
        },

        benefit: {
            type: String,
            required: true,
            trim: true
        },

        deadline: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "Government benefit scheme for eligible citizens."
        },

        url: {
            type: String,
            default: "https://www.india.gov.in"
        },

        eligibility: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Scheme", schemeSchema);
