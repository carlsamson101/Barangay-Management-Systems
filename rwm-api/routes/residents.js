const express = require("express");
const Resident = require("../models/Resident");
const authorize = require("../middleware/authorize");

const router = express.Router();

// 🧾 Get all residents (only from logged-in barangay)
router.get("/", authorize(), async (req, res) => {
  try {
    console.log("➡️ GET /residents for:", req.user);

    const residents = await Resident.find({ barangayId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(residents);
  } catch (err) {
    console.error("❌ Error fetching residents:", err);
    res.status(500).json({ error: "Failed to fetch residents" });
  }
});

// ➕ Add new resident
router.post("/", authorize(), async (req, res) => {
  try {
    const newResident = await Resident.create({
      ...req.body,
      barangayId: req.user.id,
      barangay: req.user.name, // from token
    });

    res.json(newResident);
  } catch (err) {
    console.error("❌ Create resident error:", err);
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", authorize(), async (req, res) => {
  try {
    const updated = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("❌ Update resident error:", err);
    res.status(500).json({ error: "Failed to update resident" });
  }
});

router.delete("/:id", authorize(), async (req, res) => {
  try {
    await Resident.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete resident error:", err);
    res.status(500).json({ error: "Failed to delete resident" });
  }
});

// Search by purok
router.get('/search/purok/:purok', async (req, res) => {
  try {
    const { purok } = req.params;
    const residents = await Resident.find({
      purok: { $regex: purok, $options: 'i' }
    }).sort({ lastName: 1, firstName: 1 });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search by age
router.get('/search/age/:age', async (req, res) => {
  try {
    const age = parseInt(req.params.age);
    if (isNaN(age)) {
      return res.status(400).json({ message: 'Invalid age' });
    }
    const residents = await Resident.find({ age: age })
      .sort({ lastName: 1, firstName: 1 });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search by street
router.get('/search/street/:street', async (req, res) => {
  try {
    const { street } = req.params;
    const residents = await Resident.find({
      street: { $regex: street, $options: 'i' }
    }).sort({ lastName: 1, firstName: 1 });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
