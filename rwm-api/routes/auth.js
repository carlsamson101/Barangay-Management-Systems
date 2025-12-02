const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const Barangay = require("../models/Barangay");

const router = express.Router();

/* ========================================================
   📁 MULTER CONFIG – for Barangay Logo Upload
======================================================== */
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // path is relative to where you start node (usually project root)
    cb(null, path.join(__dirname, "..", "uploads", "logos"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `barangay-logo-${req.user?.id || Date.now()}${ext}`);
  },
});

const logoFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG/PNG images are allowed"), false);
  }
  cb(null, true);
};

const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: logoFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

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
    if (!name || !username || !password || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUsername = await Barangay.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await Barangay.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const barangay = await Barangay.create({
      name,
      city,
      province,
      username,
      password, // hashed in pre-save hook
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
    const {
      name,
      email,
      address,
      contactNumber,
      captain,
      secretary,
      city,
      province,
      // you can also accept logoUrl from FE if needed, but normally upload route handles it
    } = req.body;

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

    if (name) {
      const existingName = await Barangay.findOne({
        name,
        _id: { $ne: req.user.id },
      });
      if (existingName) {
        return res.status(400).json({ message: "Barangay name already exists" });
      }
    }

    if (email) {
      const existingEmail = await Barangay.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updated = await Barangay.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

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
   🖼️ UPDATE Barangay Logo
   Endpoint used by your Manage Profile "Upload Logo" button
======================================================== */
router.put(
  "/profile/logo",
  authorize(),
  uploadLogo.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const logoUrl = `${baseUrl}/uploads/logos/${req.file.filename}`;

      const updated = await Barangay.findByIdAndUpdate(
        req.user.id,
        { logoUrl },
        { new: true }
      ).select("-password");

      res.json({
        message: "✅ Logo updated successfully",
        logoUrl,
        barangay: updated,
      });
    } catch (err) {
      console.error("❌ Upload logo error:", err);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  }
);

/* ========================================================
   🔐 CHANGE PASSWORD
======================================================== */
router.put("/change-password", authorize(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const barangay = await Barangay.findById(req.user.id);
    if (!barangay) {
      return res.status(404).json({ message: "Barangay not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, barangay.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    barangay.password = newPassword; // pre-save hook hashes
    await barangay.save();

    res.json({ message: "✅ Password changed successfully" });
  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// 🗑️ REMOVE Barangay Logo
router.delete("/profile/logo", authorize(), async (req, res) => {
  try {
    const updated = await Barangay.findByIdAndUpdate(
      req.user.id,
      { logoUrl: "" },
      { new: true }
    ).select("-password");

    res.json({
      message: "✅ Logo removed successfully",
      barangay: updated,
    });
  } catch (err) {
    console.error("❌ Remove logo error:", err);
    res.status(500).json({ message: "Failed to remove logo" });
  }
});


module.exports = router;
