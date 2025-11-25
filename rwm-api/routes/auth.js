const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Barangay = require("../models/Barangay"); // ✅ correct path

const router = express.Router();

/* ========================================================
   🏘️ REGISTER a new Barangay account
======================================================== */
// ✅ GOOD CODE (Schema handles hashing)
router.post("/register", async (req, res) => {
  const { name, city, province, username, password, email, contactNumber } = req.body;

  try {
    // Check if username is already taken
    const existing = await Barangay.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create new barangay record
    const barangay = await Barangay.create({
      name,
      city,
      province,
      username,
      password, // <-- 1. Just pass the plain password
      email,
      contactNumber,
    });
    // The 'pre-save' hook on your model will hash it automatically

    res.status(201).json({
      message: "Barangay registered successfully",
      barangay: {
        id: barangay._id,
        name: barangay.name,
        username: barangay.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   🔐 LOGIN a Barangay account
======================================================== */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const barangay = await Barangay.findOne({ username });
    if (!barangay) return res.status(400).json({ message: "Invalid username or password" });

    const isMatch = await bcrypt.compare(password, barangay.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: barangay._id, name: barangay.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      barangayName: barangay.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
