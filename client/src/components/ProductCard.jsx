import { useBag } from "../context/BagContext";

export default function ProductCard({ product }) {
  const { addToBag } = useBag();
  return (
    <article className="card">
      {product.image ? (
  <img className="photo" src={product.image} alt={product.name} loading="lazy" />
) : (
  <div className="photo placeholder">{product.name[0]}</div>
)}
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={() => addToBag(product)}>Add to bag</button>
    </article>
  );
}