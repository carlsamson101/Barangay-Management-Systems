const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Barangay = require("../models/Barangay");

const router = express.Router();

/* ========================================================
   🔐 MIDDLEWARE - Verify JWT Token
======================================================== */
const authorize = () => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

/* ========================================================
   🏘️ REGISTER a new Barangay account
======================================================== */
router.post("/register", async (req, res) => {
  const { name, city, province, username, password, email, contactNumber } = req.body;

  try {
    // Validate required fields
    if (!name || !username || !password || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if username is already taken
    const existingUsername = await Barangay.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email is already taken
    const existingEmail = await Barangay.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create new barangay record
    const barangay = await Barangay.create({
      name,
      city,
      province,
      username,
      password, // Schema pre-save hook will hash it
      email,
      contactNumber,
    });

    res.status(201).json({
      message: "Barangay registered successfully",
      barangay: {
        id: barangay._id,
        name: barangay.name,
        username: barangay.username,
        email: barangay.email,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* ========================================================
   🔐 LOGIN a Barangay account
======================================================== */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const barangay = await Barangay.findOne({ username });
    if (!barangay) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, barangay.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: barangay._id, name: barangay.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      barangayName: barangay.name,
      barangayId: barangay._id,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================================================
   👤 GET Barangay Profile
======================================================== */
router.get("/profile", authorize(), async (req, res) => {
  try {
    const barangay = await Barangay.findById(req.user.id).select("-password");
    
    if (!barangay) {
      return res.status(404).json({ message: "Barangay not found" });
    }

    res.json(barangay);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* ========================================================
   ✏️ UPDATE Barangay Profile
======================================================== */
router.put("/profile", authorize(), async (req, res) => {
  try {
    const { name, email, address, contactNumber, captain, secretary, city, province } = req.body;

    // Prevent password updates through this endpoint
    const updateData = {
      name,
      email,
      address,
      contactNumber,
      captain,
      secretary,
      city,
      province,
    };

    // Check if new email/name are unique (if being changed)
    if (name) {
      const existingName = await Barangay.findOne({ name, _id: { $ne: req.user.id } });
      if (existingName) {
        return res.status(400).json({ message: "Barangay name already exists" });
      }
    }

    if (email) {
      const existingEmail = await Barangay.findOne({ email, _id: { $ne: req.user.id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updated = await Barangay.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "✅ Profile updated successfully",
      barangay: updated,
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* ========================================================
   🔐 CHANGE PASSWORD
======================================================== */
router.put("/change-password", authorize(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const barangay = await Barangay.findById(req.user.id);
    if (!barangay) {
      return res.status(404).json({ message: "Barangay not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, barangay.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password and save
    barangay.password = newPassword; // Schema pre-save hook will hash it
    await barangay.save();

    res.json({ message: "✅ Password changed successfully" });
  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

module.exports = router;