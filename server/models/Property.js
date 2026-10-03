const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    type: {
      type: String,
      enum: ["apartment", "villa", "plot", "commercial", "pg", "independent-house"],
      default: "apartment",
    },
    listingFor: {
      type: String,
      enum: ["sale", "rent"],
      default: "sale",
    },
    status: {
      type: String,
      enum: ["available", "sold", "rented", "pending"],
      default: "available",
    },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    specs: {
      bedrooms: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
      areaSqFt: { type: Number, default: 0 },
      furnishedStatus: {
        type: String,
        enum: ["unfurnished", "semi-furnished", "fully-furnished"],
        default: "unfurnished",
      },
    },
    features: [{ type: String }],
    images: [{ type: String }],
    seller: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    listedBy: { type: String, default: "" },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
