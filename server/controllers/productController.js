const Product = require("../models/product");
const Seller = require("../models/Seller");

// @route   GET /api/products
// @desc    show all product (public, anyone can see)
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (search) {
      // Escape special regex characters so searches like "c++" or "(" do not crash
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: safeSearch, $options: "i" };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).populate("seller", "storeName");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/products/:id
// @desc    Show me detail of a specific product 
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "storeName");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/seller/products
// @desc    Seller, Add a new product 
const createProduct = async (req, res) => {
  try {
    // check user is actually a approvred seller
    const seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }
    if (!seller.isApproved) {
      return res.status(403).json({ message: "Your seller account is not approved yet" });
    }

    const { name, description, price, category, brand, stock, images } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      seller: seller._id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/seller/products
// @desc    Seller see his own product
const getMyProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    const products = await Product.find({ seller: seller._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/seller/products/:id
// @desc    Update product by seller.
const updateProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // IMPORTANT: check is this product of this seller
    if (product.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own products" });
    }

    // Allow only these fields to be updated, so the seller field cannot be changed
    const allowed = ["name", "description", "price", "category", "brand", "stock", "images"];
    allowed.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
    });
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/seller/products/:id
const deleteProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
};