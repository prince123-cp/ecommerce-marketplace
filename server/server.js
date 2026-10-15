const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config(); // value of .env file load in process.env

connectDB(); // Connect database

const app = express();

// Middleware
// Allow requests only from the frontend (set CLIENT_URL in production)
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));              // Allow frontend 
app.use(express.json());     // parse incoming JSON request to body

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Auth routes 
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use("/api/seller", require("./routes/sellerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/rentals", require("./routes/rentalRoutes"));