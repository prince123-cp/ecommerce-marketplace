const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

// JWT token generate karne ka helper function
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check user is not exit already
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user (the password will be automatically hashed by the user model's pre-save hook).
    const user = await User.create({
      name,
      email,
      password,
      role: "buyer",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateLocation = async (req, res) => {
  try{
    const {latitude, longitude, city, pincode } = req.body
    const lat = Number(latitude);
    const lng = Number(longitude);

    // Reject value that are not real coordinates.
    if(!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({message: "valid latitude and longitude are required"});
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { location: {latitude: lat, longitude: lng, city: city || "", pincode: pincode || ""}},
      {new: true }
    ).select("-password");

    res.json(user);
  }catch (error) {
    res.status(500).json({message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateLocation };