const Seller = require("../models/Seller");

// @route   GET /api/admin/sellers
// @desc    See all sellers sellers (pending and approved both)
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().populate("user", "name email");
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/admin/seller/:id/approve
// @desc    Approve a specific seller
const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isApproved = true;
    await seller.save();

    res.json({ message: "Seller approved successfully", seller });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Order = require("../models/order");

// @route   GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("sellerOrders.seller", "storeName")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllSellers, approveSeller, getAllOrders };