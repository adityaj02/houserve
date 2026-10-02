const mongoose = require("mongoose");
const crypto = require("crypto");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    },
    userId: { type: String, required: false },
    serviceId: { type: String, default: "" },
    serviceName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    scheduledDate: { type: String, default: null },
    scheduledTime: { type: String, default: null },
    address: { type: String, default: null },
    userEmail: { type: String, default: "" },
    userPhone: { type: String, default: "" },
    userName: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
