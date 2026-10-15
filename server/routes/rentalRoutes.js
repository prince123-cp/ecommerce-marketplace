const express = require("express");
const router = express.Router();
const {
  createRentalItem,
  getNearbyItems,
  getMyRentalItems,
  getRentalItemById,
  updateRentalItem,
  deleteRentalItem,
} = require("../controllers/rentalController");
const { protect } = require("../middleware/auth");

// Public: anyone can browse nearby items
router.get("/", getNearbyItems);

// This must stay above "/:id", otherwise "mine" would be treated as an id
router.get("/mine", protect, getMyRentalItems);

router.get("/:id", getRentalItemById);

// Any logged-in user can list and manage their own items
router.post("/", protect, createRentalItem);
router.put("/:id", protect, updateRentalItem);
router.delete("/:id", protect, deleteRentalItem);

module.exports = router;