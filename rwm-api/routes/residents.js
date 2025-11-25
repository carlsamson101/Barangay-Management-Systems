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

// 🔍 Search by NAME (must be before /:id route)
router.get('/search/:name', authorize(), async (req, res) => {
  try {
    const { name } = req.params;
    console.log("🔍 Searching by name:", name, "for barangay:", req.user.id);
    
    const residents = await Resident.find({
      barangayId: req.user.id, // ⬅️ CRITICAL: Filter by barangay
      $or: [
        { firstName: { $regex: name, $options: 'i' } },
        { middleName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ]
    }).sort({ lastName: 1, firstName: 1 });
    
    console.log("✅ Found", residents.length, "residents");
    res.json(residents);
  } catch (error) {
    console.error("❌ Name search error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔍 Search by PUROK
router.get('/search/purok/:purok', authorize(), async (req, res) => {
  try {
    const { purok } = req.params;
    console.log("🔍 Searching by purok:", purok, "for barangay:", req.user.id);
    
    const residents = await Resident.find({
      barangayId: req.user.id, // ⬅️ CRITICAL: Filter by barangay
      purok: { $regex: purok, $options: 'i' }
    }).sort({ lastName: 1, firstName: 1 });
    
    console.log("✅ Found", residents.length, "residents");
    res.json(residents);
  } catch (error) {
    console.error("❌ Purok search error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔍 Search by AGE
router.get('/search/age/:age', authorize(), async (req, res) => {
  try {
    const age = parseInt(req.params.age);
    if (isNaN(age)) {
      return res.status(400).json({ message: 'Invalid age' });
    }
    
    console.log("🔍 Searching by age:", age, "for barangay:", req.user.id);
    
    const residents = await Resident.find({ 
      barangayId: req.user.id, // ⬅️ CRITICAL: Filter by barangay
      age: age 
    }).sort({ lastName: 1, firstName: 1 });
    
    console.log("✅ Found", residents.length, "residents");
    res.json(residents);
  } catch (error) {
    console.error("❌ Age search error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔍 Search by STREET
router.get('/search/street/:street', authorize(), async (req, res) => {
  try {
    const { street } = req.params;
    console.log("🔍 Searching by street:", street, "for barangay:", req.user.id);
    
    const residents = await Resident.find({
      barangayId: req.user.id, // ⬅️ CRITICAL: Filter by barangay
      street: { $regex: street, $options: 'i' }
    }).sort({ lastName: 1, firstName: 1 });
    
    console.log("✅ Found", residents.length, "residents");
    res.json(residents);
  } catch (error) {
    console.error("❌ Street search error:", error);
    res.status(500).json({ message: error.message });
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

// ✏️ Update resident
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

// 🗑️ Delete resident
router.delete("/:id", authorize(), async (req, res) => {
  try {
    await Resident.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete resident error:", err);
    res.status(500).json({ error: "Failed to delete resident" });
  }
});

module.exports = router;