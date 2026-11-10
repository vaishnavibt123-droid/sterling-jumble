import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function OrdersModal({ onClose }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error("Could not load orders");
        return res.json();
      })
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal orders" onClick={e => e.stopPropagation()}>
        <h2>My orders</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && orders.length === 0 && <p>No orders yet.</p>}
        {orders.map(o => (
          <div className="order-row" key={o._id}>
            <strong>{new Date(o.createdAt).toLocaleDateString()}</strong>
            {o.items.map(i => (
              <div key={i.product}>
                {i.name} × {i.qty} — ₹{i.price * i.qty}
              </div>
            ))}
            {o.discount > 0 && <div>Discount: −₹{o.discount}</div>}
            <div><strong>Total: ₹{o.total}</strong></div>
            <div>Payment: {o.paymentStatus || "unpaid"}</div>
          </div>
        ))}
        <button className="link" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}