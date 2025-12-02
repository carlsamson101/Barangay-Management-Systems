require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const residentRoutes = require("./routes/residents");
const workerRoutes = require("./routes/workers");
const certificateRoutes = require("./routes/certificates");
const summonRoutes = require("./routes/summons");
const concernRoutes = require("./routes/concernRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes - NO /api prefix
app.use("/auth", authRoutes);
app.use("/residents", residentRoutes);
app.use("/workers", workerRoutes);
app.use("/certificates", certificateRoutes);
app.use("/summons", summonRoutes);
app.use("/concerns", concernRoutes);
app.get("/", (req, res) => res.send("Barangay Management API is running 🚀"));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Routes: /auth, /residents, /workers, /certificates, /summons`);
});