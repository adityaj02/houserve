const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const { authMiddleware, optionalAuth } = require("../middleware/auth");

// GET /api/properties — list with optional filters
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { type, city, status, minPrice, maxPrice, limit, page } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (city) filter["location.city"] = new RegExp(city, "i");
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(50, parseInt(limit) || 20);

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      properties,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Property fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/properties/:slug — single property
router.get("/:slug", async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.status(200).json(property);
  } catch (err) {
    console.error("Property fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/properties — create listing
router.post("/", optionalAuth, async (req, res) => {
  try {
    const data = {
      ...req.body,
      listedBy: req.user ? req.user.userId : "guest_user",
    };

    // Auto-generate slug from title if not provided
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now().toString(36);
    }

    const property = await Property.create(data);
    res.status(201).json(property);
  } catch (err) {
    console.error("Property create failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/properties/:slug — update listing
router.put("/:slug", authMiddleware, async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: req.body },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.status(200).json(property);
  } catch (err) {
    console.error("Property update failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/properties/my-listings — list properties by seller email and phone
router.get("/my-listings", async (req, res) => {
  try {
    const { email, phone } = req.query;
    if (!email || !phone) {
      return res.status(400).json({ error: "Seller email and phone query parameters are required." });
    }

    const properties = await Property.find({
      "seller.email": new RegExp(`^${email.trim()}$`, "i"),
      "seller.phone": new RegExp(`^\\+?${phone.trim().replace(/[^0-9]/g, '')}$`, "i") // Basic sanitization for matching
    }).sort({ createdAt: -1 });
    
    // If we couldn't match strict phone regex, try exact match as fallback
    if (properties.length === 0) {
      const fallbackProperties = await Property.find({
         "seller.email": new RegExp(`^${email.trim()}$`, "i"),
         "seller.phone": phone.trim()
      }).sort({ createdAt: -1 });
      
      if (fallbackProperties.length > 0) {
         return res.status(200).json(fallbackProperties);
      }
    }

    if (properties.length === 0) {
      return res.status(404).json({ error: "No active listings found for these credentials." });
    }

    res.status(200).json(properties);
  } catch (err) {
    console.error("Fetch my listings failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/properties/by-id/:id — delete property listing by ID (verifying seller email & phone)
router.delete("/by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ownerEmail = req.body.ownerEmail || req.query.ownerEmail;
    const ownerPhone = req.body.ownerPhone || req.query.ownerPhone;

    if (!ownerEmail || !ownerPhone) {
      return res.status(400).json({ error: "Owner email and phone are required for deletion." });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: "Property listing not found." });
    }

    // Verify email and phone
    const emailMatches = property.seller?.email?.toLowerCase().trim() === ownerEmail.toLowerCase().trim();
    
    // Loose phone matching (allow with/without spaces/pluses)
    const storedPhone = (property.seller?.phone || "").replace(/[^0-9]/g, '');
    const providedPhone = ownerPhone.replace(/[^0-9]/g, '');
    const phoneMatches = storedPhone === providedPhone || property.seller?.phone === ownerPhone.trim();

    if (!emailMatches || !phoneMatches) {
      return res.status(403).json({ error: "Unauthorized: Email or phone does not match the property seller." });
    }

    await Property.findByIdAndDelete(id);
    res.status(200).json({ message: "Property listing deleted successfully." });
  } catch (err) {
    console.error("Delete property failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/properties/:slug — remove listing
router.delete("/:slug", authMiddleware, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ slug: req.params.slug });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.status(200).json({ message: "Property deleted" });
  } catch (err) {
    console.error("Property delete failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
