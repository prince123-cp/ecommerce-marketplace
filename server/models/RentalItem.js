const mongoose = require("mongoose");

const rentalItemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    category: { type: String, required: [true, "Category is required"], trim: true },
    images: { type: [String], default: [] },
    pricePerHour: { type: Number, required: [true, "Price per hour is required"], min: 1 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    minHours: { type: Number, default: 1, min: 1 },
    isAvailable: { type: Boolean, default: true },

    // Public label shown to renters, for example "Dehradun"
    city: { type: String, default: "", trim: true },

    // Exact address is private: it is never returned unless a query asks for it
    address: { type: String, default: "", select: false },

    // GeoJSON point. Coordinates are stored as [longitude, latitude], in this order
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        validate: {
          validator: (v) =>
            Array.isArray(v) && v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
          message: "Coordinates must be [longitude, latitude] with valid values",
        },
      },
    },
  },
  { timestamps: true }
);

// Needed for "find nearest" queries
rentalItemSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("RentalItem", rentalItemSchema);