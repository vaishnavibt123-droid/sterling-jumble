import { useBag } from "../context/BagContext";

export default function BagPanel() {
  const { bag, bagOpen, subtotal, discount, total, removeFromBag } = useBag();
  if (!bagOpen) return null;

  return (
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
  );
}