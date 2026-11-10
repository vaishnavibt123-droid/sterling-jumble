import { createContext, useContext, useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [checking, setChecking] = useState(!!localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // പേജ് തുറക്കുമ്പോൾ സേവ് ചെയ്ത ടോക്കൺ ഇപ്പോഴും ശരിയാണോ എന്ന് സെർവറിനോട് ചോദിക്കുന്നു
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(setUser)
      .catch(logout)
      .finally(() => setChecking(false));
  }, []);

  const authRequest = async (path, body) => {
    const res = await fetch(`${API}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = (email, password) => authRequest("login", { email, password });
  const signup = (name, email, password) => authRequest("signup", { name, email, password });

  return (
    <AuthContext.Provider value={{ user, token, checking, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);