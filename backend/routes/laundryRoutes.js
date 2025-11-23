// routes/laundryRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const {
  createLaundry,
  getLaundryList,
  getLaundryById,
  updateLaundry,
  deleteLaundry,
  getPublicLaundryList,
  trackLaundryByCode,
  uploadImage,
} = require("../controllers/laundryController");

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.toLowerCase().replace(/\s+/g, "-");
    cb(null, `${timestamp}-${cleanName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// PUBLIC routes
router.get("/public", getPublicLaundryList);
router.get("/track/:code", trackLaundryByCode);
// juga bisa /track?code=LD-xxxx (ditangani di controller)

// PROTECTED routes (butuh login)
router.post("/", auth, upload.single("image"), createLaundry);
router.get("/", auth, getLaundryList);
router.get("/:id", auth, getLaundryById);
router.put("/:id", auth, upload.single("image"), updateLaundry);
router.delete("/:id", auth, deleteLaundry);

// Upload gambar (protected)
router.post("/upload", auth, upload.single("image"), uploadImage);

module.exports = router;
