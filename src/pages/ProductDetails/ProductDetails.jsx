import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { getProductById } from '../../services/productService.js';
import { addItemToCart } from '../../redux/slices/cartSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
      addToast('Added to cart', 'success');
    } catch (err) {
      addToast(err || 'Could not add to cart', 'error');
    }
  };

  const onReviewSubmit = async (data) => {
    try {
      // reviews API
      const res = await fetch(`/api/reviews/${product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('eshop_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Failed to add review');
      }
      addToast('Review submitted', 'success');
      reset();
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="page-container">{error}</div>;
  if (!product) return null;

  return (
    <div className="page-container product-page">
      <div className="product-layout card">
        <div className="product-media">
          <img src={product.images?.[0] || '/placeholder-product.png'} alt={product.name} />
        </div>
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-brand">{product.brand}</p>
          {product.rating && (
            <p className="product-rating">Rating: {Number(product.rating).toFixed(1)} / 5</p>
          )}
          <p className="product-price">₹{product.price}</p>
          <p className="product-stock">{product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}</p>
          <p className="product-description">{product.description}</p>
          <button
            type="button"
            className="accent-btn product-buy-btn"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="product-reviews card">
        <h2 className="section-title">Leave a review</h2>
        <form className="review-form" onSubmit={handleSubmit(onReviewSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="rating">
              Rating (1-5)
            </label>
            <input
              id="rating"
              type="number"
              min="1"
              max="5"
              className="input-field"
              {...register('rating', { required: 'Rating is required' })}
            />
            {errors.rating && <p className="error-text">{errors.rating.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="comment">
              Comment
            </label>
            <textarea
              id="comment"
              rows="3"
              className="input-field"
              {...register('comment', { required: 'Comment is required' })}
            />
            {errors.comment && <p className="error-text">{errors.comment.message}</p>}
          </div>
          <button className="primary-btn" type="submit">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetails;
