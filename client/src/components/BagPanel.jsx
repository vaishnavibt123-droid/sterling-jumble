import { useState } from "react";
import { useBag } from "../context/BagContext";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

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

  const pay = async () => {
    setMessage("");
    setBusy(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load the payment window");
      const res = await fetch(`${API}/payments/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not start payment");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Sterling Jumble (TEST MODE)",
        description: "Demo order",
        order_id: data.razorpayOrderId,
        theme: { color: "#7A1F2B" },
        prefill: {
  name: "Demo User",
  email: "demo@example.com",
  contact: "9000090000",
},
        modal: { ondismiss: () => setBusy(false) },
        handler: async response => {
          try {
            const v = await fetch(`${API}/payments/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify({ orderId: order._id, ...response }),
            });
            const updated = await v.json();
            if (!v.ok) throw new Error(updated.message || "Verification failed");
            setOrder(updated);
            setMessage("Payment successful (test mode). Thank you!");
          } catch (err) {
            setMessage(err.message);
          } finally {
            setBusy(false);
          }
        },
      });
      rzp.on("payment.failed", () => {
        setMessage("Payment failed. You can try again.");
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setMessage(err.message);
      setBusy(false);
    }
  };

  if (order) {
    const paid = order.paymentStatus === "paid";
    return (
      <section className="bag">
        <h3>Payment</h3>
        <p className="pay-note">
          TEST MODE: use only Razorpay's documented test details. Never enter a real card or UPI ID.
        </p>
        <p>Order total: ₹{order.total}</p>
        <p>Status: {order.paymentStatus}</p>
        {!paid && (
          <button className="checkout" disabled={busy} onClick={pay}>
            {busy ? "Processing..." : "Pay now (test mode)"}
          </button>
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