import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  fetchProductById,
  fetchRelatedProducts,
  clearSelectedProduct,
} from '../../redux/slices/productSlice.js';
import { addItemToCart } from '../../redux/slices/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice.js';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import axiosInstance from '../../services/axiosInstance.js';
import './ProductDetails.css';

const Stars = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="pd-stars">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className="star star-full">★</span>;
        if (i === full && half) return <span key={i} className="star star-half">★</span>;
        return <span key={i} className="star star-empty">☆</span>;
      })}
      <span className="pd-rating-val">{Number(value).toFixed(1)}</span>
    </span>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { selectedProduct: product, selectedLoading: loading, selectedError: error, related } =
    useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth || {});
  const wishlistItems = useSelector((s) => s.wishlist?.items || []);
  const isWishlisted = wishlistItems.some((w) => (w._id || w) === id);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchRelatedProducts(id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => dispatch(clearSelectedProduct());
  }, [id, dispatch]);

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addItemToCart({ productId: product._id, quantity: qty })).unwrap();
      addToast(`${qty} × ${product.name} added to cart`, 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Could not add to cart', 'error');
    }
  };

  const handleWishlist = async () => {
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

  const onReviewSubmit = async (data) => {
    try {
      await axiosInstance.post(`/reviews/${product._id}`, data);
      addToast('Review submitted!', 'success');
      reset();
      dispatch(fetchProductById(id));
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to submit review', 'error');
    }
  };

  if (loading) return <div className="page-container"><Spinner /></div>;
  if (error)   return <div className="page-container pd-error">{error}</div>;
  if (!product) return null;

  const images = product.images?.length
    ? product.images
    : [{ url: '/placeholder-product.png', public_id: '' }];

  const specEntries = product.specifications instanceof Object
    ? Object.entries(product.specifications)
    : [];

  return (
    <div className="page-container pd-page">

      {/* Breadcrumb */}
      <nav className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        {product.category?.name && (
          <>
            <span>›</span>
            <Link to={`/products?category=${product.category._id}`}>{product.category.name}</Link>
          </>
        )}
        <span>›</span>
        <span>{product.name}</span>
      </nav>

      {/* Main Layout */}
      <div className="pd-layout card">

        {/* Media column */}
        <div className="pd-media">
          <div className="pd-main-image">
            <img
              src={images[activeImg]?.url || images[activeImg]}
              alt={product.name}
            />
            {product.stock === 0 && <span className="pd-badge-out">Out of Stock</span>}
          </div>
          {images.length > 1 && (
            <div className="pd-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb${activeImg === i ? ' active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img.url || img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="pd-info">
          {product.brand && <p className="pd-brand">{product.brand}</p>}
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            <Stars value={product.ratings || 0} />
            <span className="pd-review-count">{product.numReviews || 0} reviews</span>
          </div>

          <p className="pd-price">₹{product.price?.toLocaleString('en-IN')}</p>

          <p className={`pd-stock${product.stock === 0 ? ' out' : ''}`}>
            {product.stock === 0
              ? '✖ Out of Stock'
              : product.stock <= 10
              ? `⚠ Only ${product.stock} left in stock`
              : `✔ In Stock (${product.stock} available)`}
          </p>

          <p className="pd-description">{product.description}</p>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="pd-actions">
              <div className="pd-qty">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <span className="pd-qty-val">{qty}</span>
                <button
                  className="pd-qty-btn"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  +
                </button>
              </div>
              <button className="accent-btn pd-cart-btn" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
              <button
                className={`pd-wish-btn${isWishlisted ? ' active' : ''}`}
                onClick={handleWishlist}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {specEntries.length > 0 && (
        <div className="pd-section card">
          <h2 className="pd-section-title">Specifications</h2>
          <table className="pd-specs-table">
            <tbody>
              {specEntries.map(([key, val]) => (
                <tr key={key}>
                  <td className="pd-spec-key">{key}</td>
                  <td className="pd-spec-val">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Form */}
      <div className="pd-section card">
        <h2 className="pd-section-title">Write a Review</h2>
        {!user ? (
          <p className="pd-login-note">
            <Link to="/login">Log in</Link> to leave a review.
          </p>
        ) : (
          <form className="review-form" onSubmit={handleSubmit(onReviewSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="rating">Rating (1–5)</label>
              <input
                id="rating"
                type="number"
                min="1"
                max="5"
                className="input-field"
                {...register('rating', { required: 'Rating is required', min: 1, max: 5 })}
              />
              {errors.rating && <p className="error-text">{errors.rating.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                rows="3"
                className="input-field"
                {...register('comment', { required: 'Comment is required' })}
              />
              {errors.comment && <p className="error-text">{errors.comment.message}</p>}
            </div>
            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pd-related">
          <h2 className="pd-section-title">You May Also Like</h2>
          <div className="pd-related-grid">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
