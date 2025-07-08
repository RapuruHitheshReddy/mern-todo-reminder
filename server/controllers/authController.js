const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ✅ Login using Passport local strategy
exports.login = (req, res) => {
  // If login reaches here, passport.authenticate was successful
  res.status(200).json({ message: "Login successful", user: req.user });
};

exports.logout = (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout error" });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

// Optional: session check for frontend
exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    // Only return non-sensitive info
    const { _id, name, email } = req.user;
    res.json({ user: { _id, name, email } });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

