import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";
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
  const [bag, setBag] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bag") || "[]");
    } catch {
      return [];
    }
  });
  const [bagOpen, setBagOpen] = useState(false);

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

  useEffect(() => {
    localStorage.setItem("bag", JSON.stringify(bag));
  }, [bag]);

  const subtotal = bag.reduce((sum, p) => sum + p.price, 0);
  const discount = bag.length >= 3 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const addToBag = product => setBag([...bag, product]);
  const removeFromBag = index => setBag(bag.filter((_, i) => i !== index));

  return (
    <>
      <div className="demo-banner">Demo project for portfolio. No real products or payments.</div>
      <header>
        <div>
          <h1>Sterling Jumble <span className="hallmark">925</span></h1>
          <small>925 silver, mixed your way.</small>
        </div>
        <button className="bag-btn" onClick={() => setBagOpen(!bagOpen)}>
          Bag ({bag.length})
        </button>
      </header>

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
          <article className="card" key={p._id}>
            <div className="photo"></div>
            <h3>{p.name}</h3>
            <p>₹{p.price}</p>
            <button onClick={() => addToBag(p)}>Add to bag</button>
          </article>
        ))}
      </main>

      {bagOpen && (
        <section className="bag">
          {bag.length === 0 ? (
            <p>Your bag is empty. Add a piece to start your jumble.</p>
          ) : (
            <>
              {bag.map((p, i) => (
                <div className="bag-row" key={i}>
                  <span>{p.name} — ₹{p.price}</span>
                  <button onClick={() => removeFromBag(i)}>Remove</button>
                </div>
              ))}
              <p>
                {bag.length < 3
                  ? `Add ${3 - bag.length} more to save 10%.`
                  : "Jumble discount applied: 10% off."}
              </p>
              <p>Subtotal: ₹{subtotal}</p>
              <p>Discount: −₹{discount}</p>
              <h3>Total: ₹{total}</h3>
              <button className="checkout" disabled>Checkout (coming next)</button>
            </>
          )}
        </section>
      )}
    </>
  );
}
