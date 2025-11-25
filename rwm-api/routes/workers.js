const express = require("express");
const Worker = require("../models/Worker");
const  authorize  = require("../middleware/authorize");

const router = express.Router();

// Get all workers of the logged-in barangay
router.get("/", authorize, async (req, res) => {
  const workers = await Worker.find({ barangayId: req.barangay.id }).sort({ createdAt: -1 });
  res.json(workers);
});

// Add new worker (auto barangay)
router.post("/", authorize, async (req, res) => {
  try {
    const newWorker = await Worker.create({
      ...req.body,
      barangayId: req.barangay.id,
      barangay: req.barangay.name, // auto-fill
    });
    res.json(newWorker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", authorize, async (req, res) => {
  const updated = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/:id", authorize, async (req, res) => {
  await Worker.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
