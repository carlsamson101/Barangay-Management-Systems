const mongoose = require("mongoose");

const CertificateLogSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
  barangayId: { type: mongoose.Schema.Types.ObjectId, ref: "Barangay", required: true },
  documentType: {
    type: String,
    enum: ["Certificate of Indigency", "Letter of Summon", "Other"],
    required: true,
  },
  purpose: { type: String },
  generatedBy: { type: String }, // Officer username or name
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CertificateLog", CertificateLogSchema);
