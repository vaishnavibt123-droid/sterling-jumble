require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  { name: "Twin Hoop Earrings", category: "Earrings", price: 449, description: "Lightweight 925 silver hoops." , image: "/images/hoops.jpg"},
  { name: "Moon Pendant Chain", category: "Necklaces", price: 699, description: "Crescent pendant on a fine chain.", image: "/images/chain.jpg" },
  { name: "Stackable Ring", category: "Rings", price: 349, description: "Slim band, made to stack.", image: "/images/ring.jpg" },
  { name: "Anklet with Bells", category: "Anklets", price: 599, description: "Adjustable anklet with tiny bells.", image: "/images/anklet.jpg" },
  { name: "Charm Bracelet", category: "Bracelets", price: 799, description: "Chain bracelet with three charms.", image: "/images/bracelet.jpg" },
  { name: "Tiny Stud Set", category: "Earrings", price: 299, description: "Set of three everyday studs." , image: "/images/studs.jpg"},
  { name: "Twisted Band Ring", category: "Rings", price: 399, description: "Twisted wire band." , image: "/images/ring-2.jpg"},
  { name: "Layered Chain Necklace", category: "Necklaces", price: 999, description: "Two chains, one clasp." , image: "/images/layered-chain.jpg" },
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