const express = require("express");
const Product = require("../models/product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, maxPrice, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: safe, $options: "i" };
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid product id" });
  }
});

module.exports = router;