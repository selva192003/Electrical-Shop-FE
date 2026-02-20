import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../redux/slices/productSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import './Categories.css';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((s) => s.products);

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  if (loading) return <div className="page-container"><Spinner /></div>;

  return (
    <div className="categories-page page-container">
      <div className="categories-header">
        <h1 className="categories-heading">Shop by Category</h1>
        <p className="categories-subheading">
          Browse our complete range of electrical products
        </p>
      </div>

      {error ? (
        <EmptyState icon="⚠️" title="Failed to load categories" message={error} />
      ) : categories.length === 0 ? (
        <EmptyState icon="📦" title="No categories yet" message="Check back soon!" />
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="category-card"
            >
              <div className="category-card__icon">{cat.icon || '⚡'}</div>
              <h3 className="category-card__name">{cat.name}</h3>
              {cat.description && (
                <p className="category-card__desc">{cat.description}</p>
              )}
              {cat.productCount > 0 && (
                <span className="category-card__count">
                  {cat.productCount} {cat.productCount === 1 ? 'product' : 'products'}
                </span>
              )}
              <span className="category-card__cta">Shop Now →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
