const mongoose = require("mongoose");
const RentalItem = require("../models/RentalItem");
const User = require("../models/user.js");

const isValidCoordinates = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

// Escape special characters so a search like "c++" cannot break the regex
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Fields an owner is allowed to set or change
const editableFields = ["title", "description", "category", "images", "pricePerHour", "securityDeposit", "minHours", "city", "address"];

// @route   POST /api/rentals   (any logged-in user)
const createRentalItem = async (req, res) => {
  try {
    const lat = Number(req.body.latitude);
    const lng = Number(req.body.longitude);
    if (!isValidCoordinates(lat, lng)) {
      return res.status(400).json({ message: "Valid latitude and longitude are required" });
    }

    const data = {};
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });

    const item = await RentalItem.create({
      ...data,
      owner: req.user._id,
      location: { type: "Point", coordinates: [lng, lat] }, // longitude first
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   GET /api/rentals?lat=..&lng=..&radiusKm=..   (public)
const getNearbyItems = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!isValidCoordinates(lat, lng)) {
      return res.status(400).json({ message: "Valid lat and lng query parameters are required" });
    }

    // Defaults and upper limits keep one request from loading too much data
    const radiusKm = Math.min(Number(req.query.radiusKm) || 10, 50);
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const query = { isAvailable: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) query.title = { $regex: escapeRegex(req.query.search), $options: "i" };
    if (Number.isFinite(Number(req.query.maxPrice)) && req.query.maxPrice) {
      query.pricePerHour = { $lte: Number(req.query.maxPrice) };
    }

    const items = await RentalItem.aggregate([
      {
        // $geoNear must be the first stage. It sorts by distance, nearest first
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance: radiusKm * 1000,
          spherical: true,
          query,
        },
      },
      { $limit: limit },
      // Never send the private address or the exact coordinates to the public
      { $project: { address: 0, location: 0 } },
    ]);

    await User.populate(items, { path: "owner", select: "name" });

    // Distance is rounded to 0.5 km steps, so the exact home location cannot be worked out
    const result = items.map(({ distanceMeters, ...rest }) => ({
      ...rest,
      distanceKm: Math.max(0.5, Math.round(distanceMeters / 500) / 2),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/rentals/mine   (owner)
const getMyRentalItems = async (req, res) => {
  try {
    // The owner may see their own address and location
    const items = await RentalItem.find({ owner: req.user._id }).select("+address").sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/rentals/:id   (public)
const getRentalItemById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Item not found" });
    }
    const item = await RentalItem.findById(req.params.id).select("-location").populate("owner", "name");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Loads an item and makes sure the logged-in user owns it
const findOwnedItem = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Item not found" });
    return null;
  }
  const item = await RentalItem.findById(req.params.id);
  if (!item) {
    res.status(404).json({ message: "Item not found" });
    return null;
  }
  if (item.owner.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: "You can only change your own items" });
    return null;
  }
  return item;
};

// @route   PUT /api/rentals/:id   (owner)
const updateRentalItem = async (req, res) => {
  try {
    const item = await findOwnedItem(req, res);
    if (!item) return;

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });
    if (req.body.isAvailable !== undefined) item.isAvailable = Boolean(req.body.isAvailable);

    // Location changes only when both coordinates are sent
    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      const lat = Number(req.body.latitude);
      const lng = Number(req.body.longitude);
      if (!isValidCoordinates(lat, lng)) {
        return res.status(400).json({ message: "Valid latitude and longitude are required" });
      }
      item.location = { type: "Point", coordinates: [lng, lat] };
    }

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   DELETE /api/rentals/:id   (owner)
const deleteRentalItem = async (req, res) => {
  try {
    const item = await findOwnedItem(req, res);
    if (!item) return;
    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRentalItem,
  getNearbyItems,
  getMyRentalItems,
  getRentalItemById,
  updateRentalItem,
  deleteRentalItem,
};