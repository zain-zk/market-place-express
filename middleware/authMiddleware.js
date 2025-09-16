// middleware/protect.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes middleware
const protect = async (req, res, next) => {
  let token;

  try {
    // Step 1: Check if Authorization header exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Step 2: Extract token
      token = req.headers.authorization.split(" ")[1];

      // Step 3: Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt_secret");

      // Step 4: Attach user info to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 5: Proceed to next middleware
      return next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = protect;
