// ============================================
// FILE 1: routes/summons.js
// ============================================
const express = require("express");
const router = express.Router();
const Summon = require("../models/Summon");
const jwt = require("jsonwebtoken");

// Middleware
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
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

/* ========================================================
   📋 GET all summons for barangay
======================================================== */
router.get("/", authorize(), async (req, res) => {
  try {
    const summons = await Summon.find({ barangayId: req.user.id })
      .sort({ issuedDate: -1 });

    res.json({
      success: true,
      data: summons,
    });
  } catch (err) {
    console.error("❌ Failed to fetch summons:", err);
    res.status(500).json({ success: false, error: "Failed to fetch summons" });
  }
});

/* ========================================================
   ➕ CREATE a new summon
======================================================== */
router.post("/", authorize(), async (req, res) => {
  try {
    const { recipientName, reason, summonDate, summonTime } = req.body;

    if (!recipientName || !reason || !summonDate || !summonTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newSummon = new Summon({
      barangayId: req.user.id,
      recipientName,
      reason,
      summonDate,
      summonTime,
      status: "Pending",
      issuedBy: req.user.name || "Barangay Official",
    });

    await newSummon.save();

    res.status(201).json({
      success: true,
      message: "✅ Summon created successfully",
      data: newSummon,
    });
  } catch (err) {
    console.error("❌ Failed to create summon:", err);
    res.status(500).json({ success: false, error: "Failed to create summon" });
  }
});

/* ========================================================
   🔍 SEARCH summons
======================================================== */
router.get("/search/:query", authorize(), async (req, res) => {
  try {
    const { query } = req.params;
    const status = req.query.status; // Optional filter

    let searchQuery = {
      barangayId: req.user.id,
      $or: [
        { recipientName: { $regex: query, $options: "i" } },
        { reason: { $regex: query, $options: "i" } },
      ],
    };

    if (status) {
      searchQuery.status = status;
    }

    const summons = await Summon.find(searchQuery).sort({
      issuedDate: -1,
    });

    res.json({
      success: true,
      data: summons,
    });
  } catch (err) {
    console.error("❌ Search failed:", err);
    res.status(500).json({ success: false, error: "Search failed" });
  }
});

/* ========================================================
   👁️ GET single summon details
======================================================== */
router.get("/:id", authorize(), async (req, res) => {
  try {
    const summon = await Summon.findById(req.params.id);

    if (!summon) {
      return res.status(404).json({ message: "Summon not found" });
    }

    res.json({
      success: true,
      data: summon,
    });
  } catch (err) {
    console.error("❌ Failed to fetch summon:", err);
    res.status(500).json({ success: false, error: "Failed to fetch summon" });
  }
});

/* ========================================================
   ✏️ UPDATE summon status
======================================================== */
router.put("/:id/status", authorize(), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Served", "No Show", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Summon.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    res.json({
      success: true,
      message: "✅ Summon status updated",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Failed to update summon:", err);
    res.status(500).json({ success: false, error: "Failed to update summon" });
  }
});

/* ========================================================
   ✏️ UPDATE summon (full update)
======================================================== */
router.put("/:id", authorize(), async (req, res) => {
  try {
    const { recipientName, reason, summonDate, summonTime, status } = req.body;

    const updated = await Summon.findByIdAndUpdate(
      req.params.id,
      {
        recipientName,
        reason,
        summonDate,
        summonTime,
        status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "✅ Summon updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Failed to update summon:", err);
    res.status(500).json({ success: false, error: "Failed to update summon" });
  }
});

/* ========================================================
   🗑️ DELETE summon
======================================================== */
router.delete("/:id", authorize(), async (req, res) => {
  try {
    const deleted = await Summon.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Summon not found" });
    }

    res.json({
      success: true,
      message: "✅ Summon deleted successfully",
    });
  } catch (err) {
    console.error("❌ Failed to delete summon:", err);
    res.status(500).json({ success: false, error: "Failed to delete summon" });
  }
});

module.exports = router;