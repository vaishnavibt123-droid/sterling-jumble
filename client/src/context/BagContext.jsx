import { createContext, useContext, useEffect, useState } from "react";

const BagContext = createContext(null);

export function BagProvider({ children }) {
  const [bag, setBag] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bag") || "[]");
    } catch {
      return [];
    }
  });
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("bag", JSON.stringify(bag));
  }, [bag]);

  const subtotal = bag.reduce((sum, p) => sum + p.price, 0);
  const discount = bag.length >= 3 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const addToBag = product => setBag(prev => [...prev, product]);
  const removeFromBag = index => setBag(prev => prev.filter((_, i) => i !== index));
  const clearBag = () => setBag([]);

  return (
    <BagContext.Provider
      value={{ bag, bagOpen, setBagOpen, subtotal, discount, total, addToBag, removeFromBag, clearBag }}
    >
      {children}
    </BagContext.Provider>
  );
}

export const useBag = () => useContext(BagContext);