import { useState } from "react";
import { useBag } from "../context/BagContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import OrdersModal from "./OrdersModal";

export default function Header({ onForgot }) {
  const { bag, bagOpen, setBagOpen } = useBag();
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  return (
    <header>
      <div>
        <h1>Sterling Jumble <span className="hallmark">925</span></h1>
        <small>925 silver, mixed your way.</small>
      </div>
      <div className="header-actions">
        {user ? (
          <>
            <span className="hello">Hi, {user.name}</span>
            <button className="bag-btn" onClick={() => setShowOrders(true)}>Orders</button>
            <button className="bag-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="bag-btn" onClick={() => setShowAuth(true)}>Login</button>
        )}
        <button className="bag-btn" onClick={() => setBagOpen(!bagOpen)}>
          Bag ({bag.length})
        </button>
      </div>
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onForgot={() => {
            setShowAuth(false);
            onForgot();
          }}
        />
      )}
      {showOrders && <OrdersModal onClose={() => setShowOrders(false)} />}
    </header>
  );
}