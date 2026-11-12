const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
// Safety lock: only TEST keys are allowed in this demo project.
const isTestKey = keyId.startsWith("rzp_test_") && keySecret.length > 0;
const razorpay = isTestKey ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

const disabled = res =>
  res.status(503).json({ message: "Payments are disabled: a Razorpay TEST key (rzp_test_...) is required." });

router.post("/create", auth, async (req, res) => {
  try {
    if (!razorpay) return disabled(res);
    const order = await Order.findOne({ _id: req.body.orderId, user: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "paid") return res.status(400).json({ message: "Order is already paid" });

    const rp = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: "INR",
      receipt: String(order._id),
    });
    order.razorpayOrderId = rp.id;
    await order.save();
    res.json({ keyId, razorpayOrderId: rp.id, amount: rp.amount, currency: rp.currency });
  } catch (err) {
    res.status(500).json({ message: "Could not start payment" });
  }
});

router.post("/verify", auth, async (req, res) => {
  try {
    if (!razorpay) return disabled(res);
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.userId });
    if (!order || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Order mismatch" });
    }
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Could not verify payment" });
  }
});

module.exports = router;