import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice.js';
import { addItemToCart } from '../../redux/slices/cartSlice.js';
import { useToast } from '../Toast/ToastProvider.jsx';
import './ProductCard.css';

const Stars = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="product-card-stars" aria-label={`Rating: ${value}`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className="star star-full">★</span>;
        if (i === full && half) return <span key={i} className="star star-half">★</span>;
        return <span key={i} className="star star-empty">☆</span>;
      })}
    </span>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((s) => s.auth || {});
  const wishlistItems = useSelector((s) => s.wishlist?.items || []);
  const isWishlisted = wishlistItems.some((w) => (w._id || w) === product._id);

  const price = product.price?.toFixed ? product.price.toFixed(2) : product.price;
  const imgSrc = product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.png';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (onAddToCart) { onAddToCart(product); return; }
    try {
      await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
      addToast('Added to cart', 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Could not add to cart', 'error');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Please log in to use wishlist', 'info'); return; }
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        addToast('Removed from wishlist', 'info');
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        addToast('Added to wishlist', 'success');
      }
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Wishlist update failed', 'error');
    }
  };

  return (
    <article className="product-card card">
      <div className="product-card-image-wrapper">
        <img src={imgSrc} alt={product.name} className="product-card-image" />
        {product.stock === 0 && <span className="product-badge-out">Out of Stock</span>}
        {product.featured && product.stock > 0 && (
          <span className="product-badge-featured">Featured</span>
        )}
        <button
          className={`product-wishlist-btn${isWishlisted ? ' active' : ''}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-card-body">
        <Link to={`/products/${product._id}`} className="product-card-title">
          {product.name}
        </Link>
        <p className="product-card-brand">{product.brand}</p>
        {product.ratings > 0 && (
          <div className="product-card-rating-row">
            <Stars value={product.ratings} />
            {product.numReviews > 0 && (
              <span className="product-card-review-count">{product.numReviews} reviews</span>
            )}
          </div>
        )}
        <p className="product-card-price">₹{price}</p>
        {product.stock > 0 && product.stock <= (product.lowStock || 10) && (
          <p className="product-card-low-stock">Only {product.stock} left!</p>
        )}
        <div className="product-card-footer">
          <Link to={`/products/${product._id}`} className="product-card-details-link">
            View Details
          </Link>
          <button
            type="button"
            className="accent-btn product-card-btn"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
