const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BarangaySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // e.g. Barangay Dalipuga
  city: { type: String, required: true },
  province: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },            // hashed
  email: { type: String },
  contactNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 🔐 Hash password before saving
BarangaySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Barangay", BarangaySchema);
