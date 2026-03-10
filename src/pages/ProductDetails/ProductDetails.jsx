import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductById,
  fetchRelatedProducts,
  clearSelectedProduct,
  patchProductRating,
  setSelectedProductRating,
} from '../../redux/slices/productSlice.js';
import { addItemToCart } from '../../redux/slices/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice.js';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import { submitReview, getMyReview, getProductReviews, checkReviewEligibility } from '../../services/reviewService.js';
import RestockButton from '../../components/RestockButton/RestockButton.jsx';
import BulkPricing from '../../components/BulkPricing/BulkPricing.jsx';
import { trackProductView } from '../../services/recommendationService.js';
import './ProductDetails.css';

/* ── Static star display ── */
const Stars = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="pd-stars">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className="material-icons star star-full">star</span>;
        if (i === full && half) return <span key={i} className="material-icons star star-half">star_half</span>;
        return <span key={i} className="material-icons star star-empty">star_border</span>;
      })}
      <span className="pd-rating-val">{Number(value).toFixed(1)}</span>
    </span>
  );
};

/* ── Interactive star picker ── */
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const labels = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];
  return (
    <div className="pd-star-picker">
      <div className="pd-star-picker__row">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`material-icons pd-star-pick${active >= s ? ' pd-star-pick--on' : ''}`}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            role="button"
            aria-label={`${s} star`}
          >
            {active >= s ? 'star' : 'star_border'}
          </span>
        ))}
        {active > 0 && (
          <span className="pd-star-pick__label">{labels[active - 1]}</span>
        )}
      </div>
    </div>
  );
};

/* ── Format relative date ── */
const relativeDate = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
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

  /* ── Review state ── */
  const [rvStars,      setRvStars]      = useState(0);
  const [rvComment,    setRvComment]    = useState('');
  const [rvSubmitting, setRvSub]        = useState(false);
  const [rvError,      setRvError]      = useState('');
  const [rvSuccess,    setRvSuccess]    = useState(false);
  const [myReview,     setMyReview]     = useState(null);   // user's existing review
  const [allReviews,   setAllReviews]   = useState([]);
  const [rvLoading,    setRvLoading]    = useState(true);
  const [isEditing,    setIsEditing]    = useState(false);  // editing existing review
  const [canReview,    setCanReview]    = useState(false);  // true only if user has a Delivered order for this product

  /* ── Load reviews on product change ── */
  const loadReviews = useCallback(async (productId) => {
    setRvLoading(true);
    try {
      const [listRes, myRes, eligRes] = await Promise.allSettled([
        getProductReviews(productId),
        user ? getMyReview(productId) : Promise.reject(),
        user ? checkReviewEligibility(productId) : Promise.reject(),
      ]);
      if (listRes.status === 'fulfilled') setAllReviews(listRes.value.data);
      if (myRes.status === 'fulfilled') {
        const rv = myRes.value.data;
        setMyReview(rv);
        setRvStars(rv.rating);
        setRvComment(rv.comment || '');
        setRvSuccess(true);
      } else {
        setMyReview(null);
        setRvStars(0);
        setRvComment('');
        setRvSuccess(false);
      }
      setCanReview(eligRes.status === 'fulfilled' ? !!eligRes.value.data?.eligible : false);
    } finally {
      setRvLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchRelatedProducts(id));
    loadReviews(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Track product view for recommendations
    if (user) trackProductView(id).catch(() => {});
    return () => dispatch(clearSelectedProduct());
  }, [id, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    setIsEditing(false);
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rvStars) { setRvError('Please select a star rating.'); return; }
    setRvSub(true);
    setRvError('');
    try {
      const res = await submitReview(product._id, {
        rating:  rvStars,
        comment: rvComment.trim(),
      });
      const { review, updatedRatings } = res.data;
      const wasNew = !myReview;

      // 1. Patch all cached product lists immediately (no page refresh)
      if (updatedRatings) {
        dispatch(patchProductRating(updatedRatings));
        // Also directly update the currently-viewed product to guarantee the
        // header rating row reflects the new average without relying on ID matching
        dispatch(setSelectedProductRating(updatedRatings));
      }

      // 2. Update local review state
      setMyReview(review);
      setRvSuccess(true);
      setIsEditing(false);

      // 3. Reload full review list so every card shows the real populated user data
      //    and the rating distribution bars are recalculated from server truth.
      try {
        const listRes = await getProductReviews(product._id);
        setAllReviews(listRes.data);
      } catch (_) {
        // fallback: splice the new review into the existing list
        setAllReviews((prev) => {
          const filtered = prev.filter(
            (r) => String(r.user?._id || r.user) !== String(user._id)
          );
          return [review, ...filtered];
        });
      }

      addToast(wasNew ? 'Review submitted!' : 'Review updated!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not submit review. Please try again.';
      setRvError(msg);
    } finally {
      setRvSub(false);
    }
  };

  const handleEditClick = () => {
    setRvStars(myReview?.rating || 0);
    setRvComment(myReview?.comment || '');
    setRvSuccess(false);
    setIsEditing(true);
    setRvError('');
  };

  const handleCancelEdit = () => {
    setRvStars(myReview?.rating || 0);
    setRvComment(myReview?.comment || '');
    setRvSuccess(true);
    setIsEditing(false);
    setRvError('');
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

  /* ── Rating distribution helper ── */
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = allReviews.length;

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
            <img src={images[activeImg]?.url || images[activeImg]} alt={product.name} />
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
              ? <><span className="material-icons" style={{fontSize:'1em',verticalAlign:'middle'}}>block</span> Out of Stock</>
              : product.stock <= 10
              ? <><span className="material-icons" style={{fontSize:'1em',verticalAlign:'middle'}}>warning</span> Only {product.stock} left in stock</>
              : <><span className="material-icons" style={{fontSize:'1em',verticalAlign:'middle'}}>check_circle</span> In Stock ({product.stock} available)</>}
          </p>

          <p className="pd-description">{product.description}</p>

          {product.stock > 0 && (
            <div className="pd-actions">
              <div className="pd-qty">
                <button className="pd-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <span className="pd-qty-val">{qty}</span>
                <button className="pd-qty-btn" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
              </div>
              <button className="accent-btn pd-cart-btn" onClick={handleAddToCart}>
                <span className="material-icons" style={{fontSize:'1.1em',verticalAlign:'middle',marginRight:'5px'}}>shopping_cart</span> Add to Cart
              </button>
              <button
                className={`pd-wish-btn${isWishlisted ? ' active' : ''}`}
                onClick={handleWishlist}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <span className="material-icons">{isWishlisted ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>
          )}

          {/* Restock notification button when out of stock */}
          {product.stock === 0 && (
            <RestockButton productId={product._id} />
          )}

          {/* Bulk pricing */}
          {product.bulkPricing?.length > 0 && (
            <BulkPricing tiers={product.bulkPricing} />
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
                <tr key={key}><td className="pd-spec-key">{key}</td><td className="pd-spec-val">{val}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════ RATINGS & REVIEWS SECTION ══════════════════════ */}
      <div className="pd-section pd-reviews-section card">
        <h2 className="pd-section-title">Ratings &amp; Reviews</h2>

        {rvLoading ? (
          <div style={{ padding: '2rem 0' }}><Spinner /></div>
        ) : (
          <>
            {/* ── Summary Bar ── */}
            {total > 0 && (
              <div className="pd-rv-summary">
                <div className="pd-rv-summary__big">
                  <span className="pd-rv-summary__num">{Number(product.ratings || 0).toFixed(1)}</span>
                  <Stars value={product.ratings || 0} />
                  <span className="pd-rv-summary__total">{total} review{total !== 1 ? 's' : ''}</span>
                </div>
                <div className="pd-rv-bars">
                  {ratingDist.map(({ star, count }) => (
                    <div key={star} className="pd-rv-bar-row">
                      <span className="pd-rv-bar-label">
                        {star} <span className="material-icons" style={{fontSize:'12px',verticalAlign:'middle',color:'#f59e0b'}}>star</span>
                      </span>
                      <div className="pd-rv-bar-track">
                        <div
                          className="pd-rv-bar-fill"
                          style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="pd-rv-bar-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Write / Edit Review Form ── */}
            {!user ? (
              <p className="pd-login-note">
                <span className="material-icons" style={{fontSize:'1em',verticalAlign:'middle',marginRight:'4px'}}>lock</span>
                <Link to="/login">Log in</Link> to leave a review.
              </p>
            ) : !canReview && !myReview ? (
              <p className="pd-login-note">
                <span className="material-icons" style={{fontSize:'1em',verticalAlign:'middle',marginRight:'4px'}}>shopping_bag</span>
                Only customers who have received this product can leave a review.
              </p>
            ) : rvSuccess && !isEditing ? (
              /* Show the user's submitted review in read-only mode */
              <div className="pd-my-review">
                <div className="pd-my-review__header">
                  <span className="material-icons pd-my-review__icon">verified_user</span>
                  <div>
                    <p className="pd-my-review__title">Your Review</p>
                    <Stars value={myReview?.rating || rvStars} />
                  </div>
                  <button className="pd-my-review__edit-btn" onClick={handleEditClick}>
                    <span className="material-icons">edit</span>
                    Edit
                  </button>
                </div>
                {myReview?.comment && (
                  <p className="pd-my-review__comment">"{myReview.comment}"</p>
                )}
              </div>
            ) : (
              /* Review form (new or edit) */
              <form className="pd-rv-form" onSubmit={handleReviewSubmit}>
                <p className="pd-rv-form__title">
                  <span className="material-icons">rate_review</span>
                  {isEditing ? 'Edit your review' : 'Write a Review'}
                </p>

                <div className="pd-rv-form__field">
                  <label className="pd-rv-form__label">Your Rating <span style={{color:'#ef4444'}}>*</span></label>
                  <StarPicker value={rvStars} onChange={setRvStars} />
                </div>

                <div className="pd-rv-form__field">
                  <label className="pd-rv-form__label">
                    Comment <span className="pd-rv-form__optional">(optional)</span>
                  </label>
                  <textarea
                    className="pd-rv-form__textarea"
                    placeholder="Share your experience with this product…"
                    rows={3}
                    maxLength={500}
                    value={rvComment}
                    onChange={(e) => setRvComment(e.target.value)}
                  />
                  <span className="pd-rv-form__char">{rvComment.length}/500</span>
                </div>

                {rvError && (
                  <p className="pd-rv-form__error">
                    <span className="material-icons">error</span>
                    {rvError}
                  </p>
                )}

                <div className="pd-rv-form__actions">
                  {isEditing && (
                    <button type="button" className="pd-rv-form__cancel" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="pd-rv-form__submit" disabled={!rvStars || rvSubmitting}>
                    {rvSubmitting
                      ? <><span className="material-icons spin-icon">sync</span> Submitting…</>
                      : <><span className="material-icons">send</span> {isEditing ? 'Update Review' : 'Submit Review'}</>
                    }
                  </button>
                </div>
              </form>
            )}

            {/* ── All Reviews List ── */}
            {total > 0 && (
              <div className="pd-rv-list">
                <h3 className="pd-rv-list__heading">
                  <span className="material-icons">forum</span>
                  All Reviews ({total})
                </h3>
                {allReviews.map((rv) => {
                  const isOwn = user && String(rv.user?._id || rv.user) === String(user._id);
                  return (
                    <div key={rv._id} className={`pd-rv-item${isOwn ? ' pd-rv-item--own' : ''}`}>
                      <div className="pd-rv-item__header">
                        <div className="pd-rv-item__avatar">
                          {rv.user?.profileImage
                            ? <img src={rv.user.profileImage} alt={rv.user?.name} />
                            : <span className="material-icons">account_circle</span>}
                        </div>
                        <div className="pd-rv-item__meta">
                          <span className="pd-rv-item__name">
                            {rv.user?.name || 'User'}
                            {isOwn && <span className="pd-rv-item__you">You</span>}
                          </span>
                          <Stars value={rv.rating} />
                        </div>
                        <span className="pd-rv-item__date">{relativeDate(rv.createdAt)}</span>
                      </div>
                      {rv.comment && <p className="pd-rv-item__comment">{rv.comment}</p>}
                      {rv.adminReply?.message && (
                        <div className="pd-rv-item__reply">
                          <span className="material-icons">support_agent</span>
                          <div>
                            <p className="pd-rv-item__reply-title">Seller Response</p>
                            <p className="pd-rv-item__reply-msg">{rv.adminReply.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {total === 0 && (
              <p className="pd-rv-empty">
                <span className="material-icons">rate_review</span>
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </>
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
