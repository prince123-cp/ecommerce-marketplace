const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateLocation } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/location", protect, updateLocation);

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;