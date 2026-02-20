import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../../redux/slices/wishlistSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './Wishlist.css';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { items, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      dispatch(fetchWishlist()); // refresh populated list
      addToast('Removed from wishlist', 'info');
    } catch (err) {
      addToast(err || 'Failed to remove', 'error');
    }
  };

  const handleClear = async () => {
    try {
      await dispatch(clearWishlist()).unwrap();
      addToast('Wishlist cleared', 'info');
    } catch (err) {
      addToast(err || 'Failed to clear', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="wishlist-page page-wrapper">
      <div className="wishlist-header">
        <h1 className="wishlist-title">My Wishlist</h1>
        {items.length > 0 && (
          <button className="btn accent-btn" onClick={handleClear}>
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <span className="wishlist-empty-icon">♡</span>
          <p>Your wishlist is empty.</p>
          <Link to="/" className="btn primary-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((product) => (
            <div key={product._id} className="wishlist-card card">
              <Link to={`/products/${product._id}`} className="wishlist-card-image-wrap">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="wishlist-card-image"
                  />
                ) : (
                  <div className="wishlist-card-placeholder">No Image</div>
                )}
              </Link>
              <div className="wishlist-card-body">
                <Link to={`/products/${product._id}`} className="wishlist-card-name">
                  {product.name}
                </Link>
                <p className="wishlist-card-price">₹{product.price?.toLocaleString('en-IN')}</p>
                <div className="wishlist-card-actions">
                  <Link to={`/products/${product._id}`} className="btn primary-btn btn-sm">
                    View
                  </Link>
                  <button
                    className="btn accent-btn btn-sm"
                    onClick={() => handleRemove(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
