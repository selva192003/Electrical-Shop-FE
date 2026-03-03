import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations } from '../../services/recommendationService.js';
import './RecommendedProducts.css';

export default function RecommendedProducts({ productId, category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!productId) return;
    getRecommendations(productId)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="recommended-section">
      <div className="recommended-header">
        <h2>Recommended for You</h2>
        <div className="recommended-nav">
          <button className="rec-nav-btn" onClick={() => scroll(-1)}>←</button>
          <button className="rec-nav-btn" onClick={() => scroll(1)}>→</button>
        </div>
      </div>
      <div className="recommended-scroll" ref={scrollRef}>
        {products.map(product => (
          <Link key={product._id} to={`/products/${product._id}`} className="rec-product-card">
            <img src={product.images?.[0]} alt={product.name} className="rec-product-img" />
            <div className="rec-product-body">
              <div className="rec-product-name">{product.name}</div>
              <div className="rec-product-brand">{product.brand}</div>
              <div className="rec-product-price">₹{product.price?.toLocaleString('en-IN')}</div>
              {product.rating > 0 && (
                <div className="rec-product-rating">⭐ {product.rating?.toFixed(1)}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
