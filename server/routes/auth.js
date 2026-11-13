const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const makeToken = user =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = user => ({ id: user._id, name: user.name, email: user.email });

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Forgot password (demo OTP) ----------
const hashOtp = otp => crypto.createHash("sha256").update(String(otp)).digest("hex");

router.post("/forgot", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const otp = String(crypto.randomInt(100000, 1000000));
    user.resetToken = hashOtp(otp);
    user.resetExpires = Date.now() + 10 * 60 * 1000;
    user.resetAttempts = 0;
    await user.save();

    res.json({
      message: "OTP generated.",
      demoOtp: process.env.DEMO_MODE === "off" ? undefined : otp,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again." });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { otp, password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({ email });
    if (!user || !user.resetToken || user.resetExpires < Date.now() || user.resetAttempts >= 5)
      return res.status(400).json({ message: "OTP expired or invalid. Request a new one." });

    if (user.resetToken !== hashOtp(otp)) {
      user.resetAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Wrong OTP." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    user.resetAttempts = 0;
    await user.save();
    res.json({ message: "Password updated. You can log in now." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again." });
  }
});

module.exports = router;