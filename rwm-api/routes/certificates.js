const express = require("express");
const router = express.Router();
const CertificateLog = require("../models/CertificateLog");
const  authorize  = require("../middleware/authorize");

// ✅ Fetch all logs for a barangay
router.get("/", authorize(["admin", "barangay"]), async (req, res) => {
  try {
    const logs = await CertificateLog.find({ barangayId: req.user.id })
      .populate("residentId", "firstName lastName purok")
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error("❌ Failed to fetch certificate logs:", err);
    res.status(500).json({ error: "Failed to fetch certificate logs" });
  }
});

// ✅ Record a new log when certificate is generated
router.post("/", authorize(["admin", "barangay"]), async (req, res) => {
  try {
    const { residentId, documentType, purpose } = req.body;
    const log = new CertificateLog({
      residentId,
      barangayId: req.user.barangayId || req.user.id,
      documentType,
      purpose,
      generatedBy: req.user.name || "Barangay Official",
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    console.error("❌ Failed to save certificate log:", err);
    res.status(500).json({ error: "Failed to save certificate log" });
  }
});

module.exports = router;
