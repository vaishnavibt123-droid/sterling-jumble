import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ResetPassword({ onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(path, body) {
    const res = await fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json() };
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (step === 1) {
        const { ok, data } = await post("/auth/forgot", { email });
        if (ok) {
          setDemoOtp(data.demoOtp || "");
          setStep(2);
        } else setMsg(data.message);
      } else {
        const { ok, data } = await post("/auth/reset", { email, otp, password });
        setMsg(data.message);
        if (ok) setStep(3);
      }
    } catch {
      setMsg("Could not reach the server. Try again in a minute.");
    }
    setBusy(false);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Forgot password</h2>

        {step === 1 && (
          <>
            <input type="email" placeholder="Email" value={email}
                   onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={busy}>{busy ? "Please wait..." : "Send OTP"}</button>
          </>
        )}

        {step === 2 && (
          <>
            {demoOtp && (
              <p className="pay-note">Demo mode: no real email is sent. Your OTP is <b>{demoOtp}</b></p>
            )}
            <input inputMode="numeric" placeholder="6-digit OTP" value={otp}
                   onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
            <input type="password" placeholder="New password (min 6)" value={password}
                   onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            <button type="submit" disabled={busy}>{busy ? "Please wait..." : "Update password"}</button>
          </>
        )}

        {step === 3 && <p>Password updated. Close this and log in with the new password.</p>}

        {msg && <p className="msg-inline">{msg}</p>}
        <button type="button" onClick={onClose}>Close</button>
      </form>
    </div>
  );
}