const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Seller = require("../models/Seller");

// Stock return helper (works for both role back and cancellation)
const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
};

// @route   POST /api/orders   (buyer)
const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Address validate
    const required = ["fullName", "phone", "street", "city", "state", "pincode"];
    const missing = required.filter((f) => !shippingAddress || !shippingAddress[f]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing address fields: ${missing.join(", ")}` });
    }

    // 2. Take Cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    const cartItems = cart ? cart.items.filter((i) => i.product) : [];
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 3. Stock check
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `${item.product.name}: only ${item.product.stock} in stock`,
        });
      }
    }

    // 4. Group accordind to seller
    const groups = {};
    for (const item of cartItems) {
      const sellerId = item.product.seller.toString();
      if (!groups[sellerId]) groups[sellerId] = [];
      groups[sellerId].push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      });
    }

    const sellerOrders = Object.entries(groups).map(([seller, items]) => ({
      seller,
      items,
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }));
    const totalAmount = sellerOrders.reduce((sum, so) => sum + so.subtotal, 0);

    // 5. work in stock (atomic), rollback if autometically fail
    const done = [];
    for (const item of cartItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (!updated) {
        await restoreStock(done);
        return res.status(400).json({ message: `${item.product.name} just went out of stock` });
      }
      done.push({ product: item.product._id, quantity: item.quantity });
    }

    // 6. Save order, cart empty
    try {
      const order = await Order.create({
        user: req.user._id,
        sellerOrders,
        shippingAddress,
        totalAmount,
      });
      cart.items = [];
      await cart.save();
      res.status(201).json(order);
    } catch (err) {
      await restoreStock(done);
      throw err;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders/my-orders   (buyer)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
  .populate("sellerOrders.seller", "storeName")
  .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders/:id   (buyer)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your order" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/seller/orders   (seller)
const getSellerOrders = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });

    const orders = await Order.find({ "sellerOrders.seller": seller._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Send only this seller's share from every order.
    const result = orders.map((order) => ({
      _id: order._id,
      buyer: order.user,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      sellerOrder: order.sellerOrders.find(
        (so) => so.seller.toString() === seller._id.toString()
      ),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/seller/orders/:id/status   (seller)
const updateSellerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const flow = ["placed", "packed", "shipped", "delivered"];

    if (![...flow, "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const seller = await Seller.findOne({ user: req.user._id });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const sub = order.sellerOrders.find(
      (so) => so.seller.toString() === seller._id.toString()
    );
    if (!sub) {
      return res.status(403).json({ message: "This order has nothing from your store" });
    }

    if (["delivered", "cancelled"].includes(sub.status)) {
      return res.status(400).json({ message: `Order is already ${sub.status}` });
    }

    if (status === "cancelled") {
      if (!["placed", "packed"].includes(sub.status)) {
        return res.status(400).json({ message: "Can't cancel after shipping" });
      }
      await restoreStock(sub.items);
    } else if (flow.indexOf(status) !== flow.indexOf(sub.status) + 1) {
      return res.status(400).json({
        message: `Status must go step by step. Next allowed: ${flow[flow.indexOf(sub.status) + 1]}`,
      });
    }

    sub.status = status;
    await order.save();
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateSellerOrderStatus,
};