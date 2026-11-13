export default function ProductModal({ product, onClose, onAdd, onBuy }) {
  if (!product) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal product-modal" onClick={e => e.stopPropagation()}>
        {product.image && (
          <img className="product-modal-img" src={product.image} alt={product.name} />
        )}
        <h2>{product.name}</h2>
        <p className="product-modal-price">₹{product.price}</p>
        <p>{product.description}</p>
        <div className="product-modal-actions">
          <button className="primary" onClick={() => { onAdd(product); onClose(); }}>
            Add to bag
          </button>
          <button onClick={() => { onBuy(product); onClose(); }}>
            Buy now
          </button>
          <button className="link" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}