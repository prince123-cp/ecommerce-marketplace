const express = require("express");
const router = express.Router();
const { registerSeller, getSellerProfile } = require("../controllers/sellerController");
const { createProduct, getMyProducts, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");
const { getSellerOrders, updateSellerOrderStatus } = require("../controllers/orderController");

router.post("/register", protect, registerSeller);
router.get("/profile", protect, getSellerProfile);

// Product management — Access only seller role 
router.post("/products", protect, checkRole("seller"), createProduct);
router.get("/products", protect, checkRole("seller"), getMyProducts);
router.put("/products/:id", protect, checkRole("seller"), updateProduct);
router.delete("/products/:id", protect, checkRole("seller"), deleteProduct);

router.get("/orders", protect, checkRole("seller"), getSellerOrders);
router.put("/orders/:id/status", protect, checkRole("seller"), updateSellerOrderStatus);
module.exports = router;