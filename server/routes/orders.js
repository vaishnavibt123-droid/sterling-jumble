const express = require("express");
const Product = require("../models/product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0)
      return res.status(400).json({ message: "Bag is empty" });
    if (productIds.length > 50)
      return res.status(400).json({ message: "Too many items" });

    const counts = {};
    productIds.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    const products = await Product.find({ _id: { $in: Object.keys(counts) } });
    const byId = new Map(products.map(p => [String(p._id), p]));

    const items = [];
    for (const [id, qty] of Object.entries(counts)) {
      const p = byId.get(id);
      if (!p) return res.status(400).json({ message: "Some products are no longer available" });
      items.push({ product: p._id, name: p.name, price: p.price, qty });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discount = productIds.length >= 3 ? Math.round(subtotal * 0.1) : 0;

    const order = await Order.create({
      user: req.userId,
      items,
      subtotal,
      discount,
      total: subtotal - discount,
    });
    res.status(201).json(order);
  } catch (err) {
    const status = err.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: "Could not place order" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId,
      status: { $ne: "pending" },
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/:id/demo-pay", auth, async (req, res) => {
  try {
    const { outcome } = req.body;
    if (!["success", "failure"].includes(outcome)) {
      return res.status(400).json({ message: "Invalid outcome" });
    }
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "paid (demo)") {
      return res.status(400).json({ message: "Order is already paid" });
    }
    order.paymentStatus = outcome === "success" ? "paid (demo)" : "failed (demo)";
    await order.save();
    res.json(order);
  } catch (err) {
    const status = err.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: "Could not update payment" });
  }
});
module.exports = router;