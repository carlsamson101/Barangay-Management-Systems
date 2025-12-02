// models/Concern.js
const mongoose = require("mongoose");

const concernSchema = new mongoose.Schema(
  {
    barangay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barangay",
      required: true,
    },
    barangayName: {
      type: String,
      required: true,
      trim: true,
    },

    // Resident details
    residentName: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // Concern details
    category: {
      type: String,
      enum: [
        "Noise Complaint",
        "Garbage / Cleanliness",
        "Street Lights",
        "Road / Infrastructure",
        "Peace and Order",
        "Benefits / Assistance",
        "Others",
      ],
      default: "Others",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved", "Closed"],
      default: "New",
    },

    barangayNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Concern", concernSchema);
