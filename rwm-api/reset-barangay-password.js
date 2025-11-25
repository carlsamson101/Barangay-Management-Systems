require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Barangay = require("./models/Barangay");

async function resetPassword() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // 2. Set your new password here
    const newPassword = "dalipuga123"; // 🔑 change this to whatever you want
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update by username OR ID
    const result = await Barangay.updateOne(
      { username: "dalipuga" },   // <-- match your barangay username
      { $set: { password: hashedPassword } }
    );

    console.log("Password updated:", result);
    console.log("\n✅ New password:", newPassword);
    console.log("⚠️ Save this password somewhere safe!");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

resetPassword();
