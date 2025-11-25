// ============================================
// FILE 1: routes/certificates.js
// ============================================
const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const jwt = require("jsonwebtoken");

// Middleware
const authorize = () => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

/* ========================================================
   📋 GET all certificates for barangay
======================================================== */
router.get("/", authorize(), async (req, res) => {
  try {
    const certificates = await Certificate.find({ barangayId: req.user.id })
      .sort({ issuedDate: -1 });  // ← REMOVED .populate() line

    res.json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    console.error("❌ Failed to fetch certificates:", err);
    res.status(500).json({ success: false, error: "Failed to fetch certificates" });
  }
});

/* ========================================================
   ➕ CREATE a new certificate
======================================================== */
router.post("/", authorize(), async (req, res) => {
  try {
    const { residentName, certificateType, purpose } = req.body;

    if (!residentName || !certificateType || !purpose) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newCertificate = new Certificate({
      barangayId: req.user.id,
      residentName,
      certificateType,
      purpose,
      issuedDate: new Date().toISOString().split("T")[0],
      issuedTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      status: "Issued",
      issuedBy: req.user.name || "Barangay Official",
    });

    await newCertificate.save();

    res.status(201).json({
      success: true,
      message: "✅ Certificate created successfully",
      data: newCertificate,
    });
  } catch (err) {
    console.error("❌ Failed to create certificate:", err);
    res.status(500).json({ success: false, error: "Failed to create certificate" });
  }
});

/* ========================================================
   🔍 SEARCH certificates
======================================================== */
router.get("/search/:query", authorize(), async (req, res) => {
  try {
    const { query } = req.params;
    const certificateType = req.query.type; // Optional filter

    let searchQuery = {
      barangayId: req.user.id,
      $or: [
        { residentName: { $regex: query, $options: "i" } },
        { certificateType: { $regex: query, $options: "i" } },
        { purpose: { $regex: query, $options: "i" } },
      ],
    };

    if (certificateType) {
      searchQuery.certificateType = certificateType;
    }

    const certificates = await Certificate.find(searchQuery).sort({
      issuedDate: -1,
    });

    res.json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    console.error("❌ Search failed:", err);
    res.status(500).json({ success: false, error: "Search failed" });
  }
});

/* ========================================================
   👁️ GET single certificate details
======================================================== */
router.get("/:id", authorize(), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (err) {
    console.error("❌ Failed to fetch certificate:", err);
    res.status(500).json({ success: false, error: "Failed to fetch certificate" });
  }
});

/* ========================================================
   ✏️ UPDATE certificate status
======================================================== */
router.put("/:id/status", authorize(), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Issued", "Pending", "Revoked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    res.json({
      success: true,
      message: "✅ Certificate status updated",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Failed to update certificate:", err);
    res.status(500).json({ success: false, error: "Failed to update certificate" });
  }
});

/* ========================================================
   🗑️ DELETE certificate
======================================================== */
router.delete("/:id", authorize(), async (req, res) => {
  try {
    const deleted = await Certificate.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({
      success: true,
      message: "✅ Certificate deleted successfully",
    });
  } catch (err) {
    console.error("❌ Failed to delete certificate:", err);
    res.status(500).json({ success: false, error: "Failed to delete certificate" });
  }
});

module.exports = router;