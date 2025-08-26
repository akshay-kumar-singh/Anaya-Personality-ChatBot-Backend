const User = require("../models/User");
const { generateToken, setCookieOptions } = require("../utils/jwt");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    // Clear any existing cookies before setting new one
    res.clearCookie("authToken", {
      path: "/",
      domain: undefined, // Don't specify domain for localhost
      secure: false, // Always false for development
      sameSite: "lax",
    });

    res.cookie("authToken", token, setCookieOptions());

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.clearCookie("authToken", {
      path: "/",
      domain: undefined,
      secure: false,
      sameSite: "lax",
    });

    res.cookie("authToken", token, setCookieOptions());

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie("authToken", {
    path: "/",
    domain: undefined,
    secure: false,
    sameSite: "lax",
  });

  res.clearCookie("authToken");

  res.json({ message: "Logout successful" });
};

const getCurrentUser = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      plan: req.user.plan,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
