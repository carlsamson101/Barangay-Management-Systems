// routes/concernRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Concern = require("../models/Concern");
const Barangay = require("../models/Barangay");

const router = express.Router();

/* ========================================================
   🔐 Simple authorize() middleware (same style as barangay)
======================================================== */
const authorize = () => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
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
   🧪 TEST ROUTES - Remove these after testing
======================================================== */
router.get("/test", (req, res) => {
  res.json({ message: "Concerns routes are working!" });
});

router.delete("/test-delete/:id", (req, res) => {
  res.json({ 
    message: "Delete route is accessible",
    id: req.params.id 
  });
});

/* ========================================================
   📨 PUBLIC – Submit a concern (Resident side)
   Body: { barangayName, residentName, contactNumber, email, address,
           category, subject, message }
======================================================== */
router.post("/", async (req, res) => {
  try {
    const {
      barangayName,
      residentName,
      contactNumber,
      email,
      address,
      category,
      subject,
      message,
    } = req.body;

    if (!barangayName || !residentName || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Barangay, name, subject, and message are required" });
    }

    const barangay = await Barangay.findOne({ name: barangayName.trim() });
    if (!barangay) {
      return res
        .status(400)
        .json({ message: "Barangay not found. Please check the name." });
    }

    const concern = await Concern.create({
      barangay: barangay._id,
      barangayName: barangay.name,
      residentName,
      contactNumber,
      email,
      address,
      category,
      subject,
      message,
    });

    res.status(201).json({
      message: "Concern submitted successfully",
      concern,
    });
  } catch (err) {
    console.error("❌ Submit concern error:", err);
    res.status(500).json({ message: "Failed to submit concern" });
  }
});

/* ========================================================
   👀 BARANGAY – Get concerns for logged-in barangay
======================================================== */
router.get("/my", authorize(), async (req, res) => {
  try {
    const concerns = await Concern.find({ barangay: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(concerns);
  } catch (err) {
    console.error("❌ Fetch concerns error:", err);
    res.status(500).json({ message: "Failed to fetch concerns" });
  }
});

/* ========================================================
   ✏️ BARANGAY – Update concern status / notes
   PATCH /concerns/:id
   Body: { status?, barangayNotes? }
======================================================== */
router.patch("/:id", authorize(), async (req, res) => {
  try {
    const { status, barangayNotes } = req.body;

    const concern = await Concern.findOne({
      _id: req.params.id,
      barangay: req.user.id, // ensure it's theirs
    });

    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }

    if (status) concern.status = status;
    if (barangayNotes !== undefined) concern.barangayNotes = barangayNotes;

    await concern.save();

    res.json({
      message: "Concern updated successfully",
      concern,
    });
  } catch (err) {
    console.error("❌ Update concern error:", err);
    res.status(500).json({ message: "Failed to update concern" });
  }
});

/* ========================================================
   🗑️ BARANGAY – Delete a concern
   DELETE /concerns/:id
======================================================== */
router.delete("/:id", authorize(), async (req, res) => {
  try {
    console.log("🗑️ Delete request received");
    console.log("📋 Concern ID:", req.params.id);
    console.log("👤 User ID from token:", req.user.id);
    
    // First, find the concern
    const concern = await Concern.findById(req.params.id);
    
    if (!concern) {
      console.log("❌ Concern not found in database");
      return res.status(404).json({ message: "Concern not found" });
    }
    
    console.log("📋 Found concern:");
    console.log("   - Concern barangay:", concern.barangay);
    console.log("   - User ID:", req.user.id);
    console.log("   - Match:", concern.barangay.toString() === req.user.id.toString());
    
    // Check if it belongs to this barangay
    if (concern.barangay.toString() !== req.user.id.toString()) {
      console.log("❌ Barangay ID mismatch - not authorized");
      return res.status(403).json({ message: "Not authorized to delete this concern" });
    }

    // Delete the concern
    await Concern.deleteOne({ _id: concern._id });
    console.log("✅ Concern deleted successfully");

    res.json({ 
      message: "Concern deleted successfully",
      success: true 
    });
  } catch (err) {
    console.error("❌ Delete concern error:", err);
    res.status(500).json({ 
      message: "Failed to delete concern",
      error: err.message 
    });
  }
});

module.exports = router;