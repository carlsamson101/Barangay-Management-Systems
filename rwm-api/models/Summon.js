const mongoose = require("mongoose");

const SummonSchema = new mongoose.Schema({
  // Reference to barangay
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
    required: true,
  },

  // Recipient info
  recipientName: { type: String, required: true },
  reason: { type: String, required: true }, // Reason for summon

  // Summon details
  summonDate: { type: String, required: true }, // YYYY-MM-DD format
  summonTime: { type: String, required: true }, // HH:MM AM/PM format
  issuedBy: { type: String }, // Officer name

  // Status tracking
  status: {
    type: String,
    enum: ["Pending", "Served", "No Show", "Resolved"],
    default: "Pending",
  },

  // Additional notes
  notes: { type: String }, // Optional notes about the summon

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt
SummonSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Summon", SummonSchema);