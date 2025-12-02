const express = require("express");
const Worker = require("../models/Worker");
const authorize = require("../middleware/authorize");

const router = express.Router();

// 🧾 Get all workers (only from logged-in barangay)
router.get("/", authorize(), async (req, res) => {
  try {
    console.log("➡️ GET /workers for:", req.user);

    const workers = await Worker.find({ barangayId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(workers);
  } catch (err) {
    console.error("❌ Error fetching workers:", err);
    res.status(500).json({ error: "Failed to fetch workers" });
  }
});

// ➕ Add new worker
router.post("/", authorize(), async (req, res) => {
  try {
    const newWorker = await Worker.create({
      ...req.body,
      barangayId: req.user.id,
      barangay: req.user.name, // from token
    });

    res.json(newWorker);
  } catch (err) {
    console.error("❌ Create worker error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✏️ Update worker
router.put("/:id", authorize(), async (req, res) => {
  try {
    const updated = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("❌ Update worker error:", err);
    res.status(500).json({ error: "Failed to update worker" });
  }
});

// 🗑️ Delete worker
router.delete("/:id", authorize(), async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete worker error:", err);
    res.status(500).json({ error: "Failed to delete worker" });
  }
});

module.exports = router;