const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// For all routes in this file: first the login check, then the user role check.
router.use(protect, checkRole("buyer"));

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);

module.exports = router;