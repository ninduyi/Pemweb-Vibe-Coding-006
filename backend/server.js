// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

// Middleware dasar - CORS paling atas
app.use(cors());
app.use(express.json());

// Static untuk file upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route dasar
app.get("/", (req, res) => {
  res.json({ message: "LaundryTrack API is running" });
});

// Routes utama
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/laundry", require("./routes/laundryRoutes"));

// Error handler (taruh paling akhir)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
