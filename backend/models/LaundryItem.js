// models/LaundryItem.js
const mongoose = require("mongoose");

const LaundryItemSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tenantName: {
      type: String,
      required: true,
      trim: true,
    },
    packageType: {
      type: String,
      enum: ["kiloan", "satuan", "express", "dry-cleaning", "cuci-lipat", "cuci-setrika"],
      default: "kiloan",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    image: {
      type: String, // URL/path file
      default: "",
    },
    status: {
      type: String,
      enum: ["received", "washing", "drying", "ready", "picked-up"],
      default: "received",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin yang input
    },
  },
  { timestamps: true }
);

// Generate kode laundry otomatis: LD-YYYYMMDD-XXX
LaundryItemSchema.statics.generateCode = async function () {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const countToday = await this.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  const numberPart = String(countToday + 1).padStart(3, "0");
  return `LD-${datePart}-${numberPart}`;
};

module.exports = mongoose.model("LaundryItem", LaundryItemSchema);
