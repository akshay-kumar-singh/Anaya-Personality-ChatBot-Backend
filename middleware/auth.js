const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

const authenticate = async (req, res, next) => {
  try {
    let token =
      req.cookies.authToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    token = token.trim();

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenError) {
      console.log("Token verification failed:", tokenError.message);
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(401).json({ error: "Authentication failed." });
  }
};

module.exports = { authenticate };
