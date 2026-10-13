const Seller = require("../models/Seller");
const User = require("../models/user.js");

// @route   POST /api/seller/register
// @desc    Buyer applies to become a seller
const registerSeller = async (req, res) => {
  try {
    const { storeName, storeDescription, gstNumber, bankDetails } = req.body;

    // Check user is already a seller
    const existingSeller = await Seller.findOne({ user: req.user._id });
    if (existingSeller) {
      return res.status(400).json({ message: "You are already registered as a seller" });
    }

    // New Seller profile 
    const seller = await Seller.create({
      user: req.user._id,
      storeName,
      storeDescription,
      gstNumber,
      bankDetails,
    });

     // Set the user's role to "seller" as well (required for permissions)
    await User.findByIdAndUpdate(req.user._id, { role: "seller" });

    res.status(201).json({
      message: "Seller application submitted. Waiting for admin approval.",
      seller,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/seller/profile
const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerSeller, getSellerProfile };