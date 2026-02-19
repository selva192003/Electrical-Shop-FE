import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const price = product.price?.toFixed ? product.price.toFixed(2) : product.price;

  return (
    <article className="product-card card">
      <div className="product-card-image-wrapper">
        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
        <img src={product.images?.[0] || '/placeholder-product.png'} alt={product.name} className="product-card-image" />
        {product.stock === 0 && <span className="product-badge-out">Out of stock</span>}
        {product.featured && <span className="product-badge-featured">Featured</span>}
      </div>
      <div className="product-card-body">
        <Link to={`/products/${product._id}`} className="product-card-title">
          {product.name}
        </Link>
        <p className="product-card-meta">{product.brand}</p>
        <p className="product-card-price">₹{price}</p>
        <div className="product-card-footer">
          <button
            type="button"
            className="accent-btn product-card-btn"
            disabled={product.stock === 0}
            onClick={() => onAddToCart?.(product)}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
