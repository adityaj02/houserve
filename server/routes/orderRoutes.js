const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { authMiddleware } = require("../middleware/auth");

// GET /api/orders?phone= — get orders by user phone
router.get("/", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(200).json([]);
    }
    const filter = { userPhone: phone };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Order fetch failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/orders/count — total order count
router.get("/count", async (_req, res) => {
  try {
    const count = await Order.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Order count failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/orders — create order(s), supports bulk insert
router.post("/", async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const inserted = await Order.insertMany(rows);
    res.status(201).json(inserted);
  } catch (err) {
    console.error("Order create failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/orders/:orderId/cancel — cancel an order
router.patch("/:orderId/cancel", async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: { status: "cancelled" } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    console.error("Order cancel failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
