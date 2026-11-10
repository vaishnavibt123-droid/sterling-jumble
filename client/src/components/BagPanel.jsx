import { useState } from "react";
import { useBag } from "../context/BagContext";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function BagPanel() {
  const { bag, bagOpen, subtotal, discount, total, removeFromBag, clearBag } = useBag();
  const { user, token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);

  if (!bagOpen) return null;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const placeOrder = async () => {
    if (!user) {
      setMessage("Please log in to place your order.");
      return;
    }
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({ productIds: bag.map(p => p._id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not place order");
      setOrder(data);
      clearBag();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const payDemo = async outcome => {
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/orders/${order._id}/demo-pay`, {
        method: "POST",
        headers,
        body: JSON.stringify({ outcome }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment update failed");
      setOrder(data);
      setMessage(
        data.paymentStatus === "paid (demo)"
          ? "Demo payment successful. Thank you!"
          : "Demo payment failed. You can try again."
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (order) {
    const paid = order.paymentStatus === "paid (demo)";
    return (
      <section className="bag">
        <h3>Demo payment</h3>
        <p className="pay-note">
          DEMO ONLY: no real payment is taken and no card details are collected.
        </p>
        <p>Order total: ₹{order.total}</p>
        <p>Status: {order.paymentStatus}</p>
        {!paid && (
          <div className="pay-actions">
            <button className="checkout" disabled={busy} onClick={() => payDemo("success")}>
              Simulate success
            </button>
            <button className="pay-fail" disabled={busy} onClick={() => payDemo("failure")}>
              Simulate failure
            </button>
          </div>
        )}
        {paid && (
          <button className="checkout" onClick={() => { setOrder(null); setMessage(""); }}>
            Done
          </button>
        )}
        {message && <p className="msg-inline">{message}</p>}
      </section>
    );
  }

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
          <button className="checkout" onClick={placeOrder} disabled={busy}>
            {busy ? "Placing order..." : "Place order"}
          </button>
          {message && <p className="msg-inline">{message}</p>}
        </>
      )}
    </section>
  );
}