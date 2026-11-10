import { useEffect, useState } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import BagPanel from "./components/BagPanel";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const budgets = [
  { label: "All", max: null },
  { label: "Under ₹499", max: 499 },
  { label: "Under ₹999", max: 999 },
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (budgets[budget].max) params.set("maxPrice", budgets[budget].max);
    setLoading(true);
    fetch(`${API}/products?${params}`)
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setError("");
      })
      .catch(() => setError("Could not load products. Is the server running?"))
      .finally(() => setLoading(false));
  }, [query, budget]);

  return (
    <>
      <div className="demo-banner">Demo project for portfolio. No real products or payments.</div>
      <Header />
      <input
        className="search"
        placeholder="Search silver pieces"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="filters">
        {budgets.map((b, i) => (
          <button
            key={b.label}
            className={"chip" + (i === budget ? " active" : "")}
            onClick={() => setBudget(i)}
          >
            {b.label}
          </button>
        ))}
      </div>

      {loading && <p className="msg">Loading...</p>}
      {error && <p className="msg">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="msg">No pieces match your search.</p>
      )}

      <main className="grid">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </main>

      <BagPanel />
    </>
  );
}