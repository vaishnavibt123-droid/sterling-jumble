const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: Number,
    discount: Number,
    total: Number,
    status: { type: String, default: "placed" },
    paymentStatus: {
  type: String,
  enum: ["unpaid", "paid (demo)", "failed (demo)"],
  default: "unpaid",
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);