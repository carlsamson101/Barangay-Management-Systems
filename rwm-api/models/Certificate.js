const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  // Reference to barangay
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
    required: true,
  },

  // Recipient info
  residentName: { type: String, required: true },
  certificateType: {
    type: String,
    enum: [
      "Barangay Clearance",
      "Residency Certificate",
      "Good Moral Certificate",
      "Indigency Certificate",
      "Certificate of Indigency",
      "Business Clearance",
      "Travel Authorization",
    ],
    required: true,
  },
  purpose: { type: String, required: true },

  // Timestamp info
  issuedDate: { type: String, required: true }, // YYYY-MM-DD format
  issuedTime: { type: String, required: true }, // HH:MM AM/PM format
  issuedBy: { type: String }, // Officer name

  // Status tracking
  status: {
    type: String,
    enum: ["Issued", "Pending", "Revoked"],
    default: "Issued",
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt
CertificateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Certificate", CertificateSchema);