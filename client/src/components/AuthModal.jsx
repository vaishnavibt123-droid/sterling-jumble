import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ onClose }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name, email, password);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>
        <button
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
        </button>
      </div>
    </div>
  );
}