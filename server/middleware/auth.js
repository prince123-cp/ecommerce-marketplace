const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

// This function will check whether a valid JWT token has been received with the request.
const protect = async (req, res, next) => {
  let token;

  // The token usually appears in the "Authorization" header in this format: "Bearer ...""
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Remove "Bearer" and just extract the token.
      token = req.headers.authorization.split(" ")[1];

      // Verify the token — decode it and check whether it was created using the correct secret.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // The user ID will be obtained from the decoded token — fetch that user from the DB (excluding the password).
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };