require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const workerRoutes = require("./routes/workers");
const authRoutes = require("./routes/auth");
const certificateRoutes = require("./routes/certificates");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/residents", require("./routes/residents"));
app.use("/workers", workerRoutes);
app.use("/certificates", certificateRoutes);

app.get("/", (req, res) => res.send("Barangay Management API is running 🚀"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
