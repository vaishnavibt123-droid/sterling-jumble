require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  { name: "Twin Hoop Earrings", category: "Earrings", price: 449, description: "Lightweight 925 silver hoops." },
  { name: "Moon Pendant Chain", category: "Necklaces", price: 699, description: "Crescent pendant on a fine chain." },
  { name: "Stackable Ring", category: "Rings", price: 349, description: "Slim band, made to stack." },
  { name: "Anklet with Bells", category: "Anklets", price: 599, description: "Adjustable anklet with tiny bells." },
  { name: "Charm Bracelet", category: "Bracelets", price: 799, description: "Chain bracelet with three charms." },
  { name: "Tiny Stud Set", category: "Earrings", price: 299, description: "Set of three everyday studs." },
  { name: "Twisted Band Ring", category: "Rings", price: 399, description: "Twisted wire band." },
  { name: "Layered Chain Necklace", category: "Necklaces", price: 999, description: "Two chains, one clasp." },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("Seeded " + products.length + " products");
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit();
  }
})();