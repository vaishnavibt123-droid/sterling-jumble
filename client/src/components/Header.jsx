import { useBag } from "../context/BagContext";

export default function Header() {
  const { bag, bagOpen, setBagOpen } = useBag();
  return (
    <header>
      <div>
        <h1>Sterling Jumble <span className="hallmark">925</span></h1>
        <small>925 silver, mixed your way.</small>
      </div>
      <button className="bag-btn" onClick={() => setBagOpen(!bagOpen)}>
        Bag ({bag.length})
      </button>
    </header>
  );
}