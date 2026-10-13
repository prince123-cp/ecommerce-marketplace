const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

router.use(protect, checkRole("buyer"));

router.post("/", createOrder);
router.get("/my-orders", getMyOrders); // ye /:id se UPAR hona zaroori hai
router.get("/:id", getOrderById);

module.exports = router;