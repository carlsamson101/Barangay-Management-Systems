const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  street: { type: String },
  purok: { type: String },
  barangay: { type: String, required: true },
  contactNumber: { type: String },
  occupation: { type: String },
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
    required: true
  },
  barangayId: { type: mongoose.Schema.Types.ObjectId, ref: "Barangay", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Worker", WorkerSchema);
