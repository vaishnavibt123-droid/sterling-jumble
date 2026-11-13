import { useBag } from "../context/BagContext";

export default function ProductCard({ product, onOpen }) {
  const { addToBag } = useBag();
  return (
    <article className="card product-card-clickable" onClick={() => onOpen(product)}>
      {product.image ? (
        <img className="photo" src={product.image} alt={product.name} loading="lazy" />
      ) : (
        <div className="photo placeholder">{product.name[0]}</div>
      )}
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button
        onClick={e => {
          e.stopPropagation();
          addToBag(product);
        }}
      >
        Add to bag
      </button>
    </article>
  );
}