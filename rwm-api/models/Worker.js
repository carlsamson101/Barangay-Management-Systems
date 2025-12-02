const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    // Address
    street: {
      type: String,
      trim: true,
      default: "",
    },
    purok: {
      type: String,
      trim: true,
      default: "",
    },
    barangay: {
      type: String,
      required: [true, "Barangay is required"],
      trim: true,
    },

    // Contact & Work
    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },
    occupation: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: [
        "Barangay Captain",
        "Kagawad",
        "Secretary",
        "Treasurer",
        "Tanod",
        "Health Worker",
        "Volunteer",
        "Other"
      ],
      required: [true, "Role is required"],
      default: "Kagawad",
    },

    // Association
    barangayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barangay",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for faster queries
workerSchema.index({ barangayId: 1, createdAt: -1 });
workerSchema.index({ firstName: 1, lastName: 1 });
workerSchema.index({ role: 1 });

// Virtual for full name
workerSchema.virtual("fullName").get(function () {
  return [this.firstName, this.middleName, this.lastName]
    .filter(Boolean)
    .join(" ");
});

// Ensure virtuals are included in JSON output
workerSchema.set("toJSON", { virtuals: true });
workerSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Worker", workerSchema);