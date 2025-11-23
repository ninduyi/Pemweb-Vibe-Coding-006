// controllers/laundryController.js
const LaundryItem = require("../models/LaundryItem");

// CREATE (admin)
exports.createLaundry = async (req, res, next) => {
  try {
    // Log untuk debugging
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { tenantName, packageType, quantity, notes, image } = req.body;

    if (!tenantName || !quantity) {
      return res.status(400).json({
        success: false,
        message: "tenantName and quantity are required",
        receivedData: { body: req.body, hasFile: !!req.file }
      });
    }

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a positive number",
      });
    }

    const code = await LaundryItem.generateCode();

    // Gunakan file dari req.file jika ada, jika tidak gunakan image dari body
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (image || "");

    const laundry = await LaundryItem.create({
      code,
      tenantName,
      packageType: packageType || "kiloan",
      quantity: qty,
      notes: notes || "",
      image: imageUrl,
      user: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Laundry created",
      data: laundry,
    });
  } catch (err) {
    next(err);
  }
};

// LIST admin: pagination + search + filter + sorting
exports.getLaundryList = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { tenantName: regex },
        { packageType: regex },
        { notes: regex },
        { code: regex },
      ];
    }

    if (status) {
      query.status = status;
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOption = { [sortBy]: sortOrder };

    const totalItems = await LaundryItem.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const data = await LaundryItem.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data,
      currentPage: page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    next(err);
  }
};

// GET single (admin)
exports.getLaundryById = async (req, res, next) => {
  try {
    const laundry = await LaundryItem.findById(req.params.id);
    if (!laundry) {
      return res
        .status(404)
        .json({ success: false, message: "Laundry not found" });
    }
    res.json({ success: true, data: laundry });
  } catch (err) {
    next(err);
  }
};

// UPDATE (admin)
exports.updateLaundry = async (req, res, next) => {
  try {
    const { tenantName, packageType, quantity, notes, status, image } =
      req.body;

    const updateData = {};

    if (tenantName) updateData.tenantName = tenantName;
    if (packageType) updateData.packageType = packageType;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    
    // Gunakan file dari req.file jika ada, jika tidak gunakan image dari body
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      updateData.image = image;
    }

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (Number.isNaN(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "quantity must be a positive number",
        });
      }
      updateData.quantity = qty;
    }

    const laundry = await LaundryItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!laundry) {
      return res
        .status(404)
        .json({ success: false, message: "Laundry not found" });
    }

    res.json({
      success: true,
      message: "Laundry updated",
      data: laundry,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE (admin)
exports.deleteLaundry = async (req, res, next) => {
  try {
    const laundry = await LaundryItem.findByIdAndDelete(req.params.id);
    if (!laundry) {
      return res
        .status(404)
        .json({ success: false, message: "Laundry not found" });
    }
    res.json({ success: true, message: "Laundry deleted" });
  } catch (err) {
    next(err);
  }
};

// PUBLIC: list (misalnya untuk list singkat, jika mau)
exports.getPublicLaundryList = async (req, res, next) => {
  try {
    const { tenantName, code } = req.query;
    const query = {};

    if (tenantName) {
      query.tenantName = new RegExp(tenantName, "i");
    }
    if (code) {
      query.code = code;
    }

    const data = await LaundryItem.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUBLIC: track by code
exports.trackLaundryByCode = async (req, res, next) => {
  try {
    const code = req.params.code || req.query.code;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Laundry code is required",
      });
    }

    const laundry = await LaundryItem.findOne({ code });
    if (!laundry) {
      return res.status(404).json({
        success: false,
        message: "Laundry not found",
      });
    }

    res.json({
      success: true,
      data: {
        code: laundry.code,
        tenantName: laundry.tenantName,
        status: laundry.status,
        image: laundry.image,
        packageType: laundry.packageType,
        quantity: laundry.quantity,
        notes: laundry.notes,
        createdAt: laundry.createdAt,
        updatedAt: laundry.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Upload image (dipanggil setelah multer)
exports.uploadImage = (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: "Image uploaded",
      imageUrl,
    });
  } catch (err) {
    next(err);
  }
};
