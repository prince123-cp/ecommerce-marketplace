const express = require("express");
const router = express.Router();
const { getAllSellers, approveSeller, getAllOrders } = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// Both routes: First login check (protect), Then role check (checkRole("admin"))
router.get("/sellers", protect, checkRole("admin"), getAllSellers);
router.put("/seller/:id/approve", protect, checkRole("admin"), approveSeller);
router.get("/orders", protect, checkRole("admin"), getAllOrders);

module.exports = router;