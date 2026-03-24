import './CartItem.css';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const price = item.product?.price || item.price || 0;
  const name = item.product?.name || item.name;
  const rawImage = item.product?.images?.[0] || item.image;
  const image = rawImage?.url || rawImage || '/placeholder-product.png';

  return (
    <div className="cart-item">
      <div className="cart-item-main">
        <img src={image} alt={name} className="cart-item-image" />
        <div>
          <div className="cart-item-title">{name}</div>
          <div className="cart-item-meta">₹{price}</div>
        </div>
      </div>
      <div className="cart-item-actions">
        <div className="cart-item-qty">
          <button
            type="button"
            onClick={() => {
              if (item.quantity <= 1) {
                onRemove(item);
              } else {
                onQuantityChange(item, item.quantity - 1);
              }
            }}
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => onQuantityChange(item, item.quantity + 1)}>
            +
          </button>
        </div>
        <button type="button" className="cart-item-remove" onClick={() => onRemove(item)} title="Remove item">
          <span className="material-icons">delete</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
