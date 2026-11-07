import { useBag } from "../context/BagContext";

export default function ProductCard({ product }) {
  const { addToBag } = useBag();
  return (
    <article className="card">
      <div className="photo"></div>
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={() => addToBag(product)}>Add to bag</button>
    </article>
  );
}