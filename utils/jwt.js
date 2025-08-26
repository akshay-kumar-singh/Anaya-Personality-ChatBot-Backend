const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
};

const setCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
  domain: undefined,
});

module.exports = {
  generateToken,
  verifyToken,
  setCookieOptions,
};
