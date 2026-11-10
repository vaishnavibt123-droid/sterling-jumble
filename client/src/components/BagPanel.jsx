import { useState } from "react";
import { useBag } from "../context/BagContext";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function BagPanel() {
  const { bag, bagOpen, subtotal, discount, total, removeFromBag, clearBag } = useBag();
  const { user, token } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");

  if (!bagOpen) return null;

  const checkout = async () => {
    if (!user) {
      setMessage("Please log in to place your order.");
      return;
    }
    setMessage("");
    setPlacing(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds: bag.map(p => p._id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not place order");
      clearBag();
      setMessage("Order placed! Thank you.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="bag">
      {bag.length === 0 ? (
        <>
          <p>Your bag is empty. Add a piece to start your jumble.</p>
          {message && <p className="msg-inline">{message}</p>}
        </>
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
          <button className="checkout" onClick={checkout} disabled={placing}>
            {placing ? "Placing order..." : "Place order"}
          </button>
          {message && <p className="msg-inline">{message}</p>}
        </>
      )}
    </section>
  );
}