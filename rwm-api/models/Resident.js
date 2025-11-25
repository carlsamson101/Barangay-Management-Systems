const mongoose = require("mongoose");

const ResidentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  birthDate: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  street: { type: String },
  purok: { type: String, required: true },
  barangay: { type: String, required: true },
  civilStatus: { 
    type: String, 
    enum: ["Single", "Married", "Widowed", "Separated", "Other"]
  },
  contactNumber: { type: String },
  occupation: { type: String },
  monthlyIncome: { type: Number },
  beneficiaryStatus: { 
    type: String,
    enum: [
      "None",
      "4Ps",
      "Senior Citizen",
      "PWD",
      "Solo Parent",
      "Indigent",
      "Other"
    ],
    default: "None"
  },
  barangayId: { type: mongoose.Schema.Types.ObjectId, ref: "Barangay", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-compute age
ResidentSchema.pre("save", function (next) {
  if (this.birthDate) {
    const ageDiff = Date.now() - this.birthDate.getTime();
    this.age = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
  }
  next();
});

module.exports = mongoose.model("Resident", ResidentSchema);
