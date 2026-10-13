const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, "Store name is required"],
    },
    storeDescription: {
      type: String,
      default: "",
    },
    gstNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },
    bankDetails: {
      accountNo: { type: String, default: "" },
      ifsc: { type: String, default: "", uppercase: true, trim: true },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);