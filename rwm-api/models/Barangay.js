const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BarangaySchema = new mongoose.Schema({
  // Authentication
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  email: { type: String, required: true, unique: true },

  // Barangay Information
  name: { type: String, required: true, unique: true }, // e.g. Barangay Dalipuga
  address: { type: String },
  contactNumber: { type: String },

  // Administrative
  captain: { type: String }, // Barangay Captain name
  secretary: { type: String }, // Barangay Secretary name

  // Location (optional)
  city: { type: String },
  province: { type: String },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔐 Hash password before saving
BarangaySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Update the updatedAt field before saving
BarangaySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
BarangaySchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Barangay", BarangaySchema);