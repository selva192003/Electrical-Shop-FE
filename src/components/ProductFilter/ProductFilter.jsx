import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters, setPage } from '../../redux/slices/productSlice.js';
import './ProductFilter.css';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const ProductFilter = () => {
  const dispatch = useDispatch();
  const { categories, brands, filters } = useSelector((s) => s.products);

  const update = (key, val) => {
    dispatch(setFilters({ [key]: val }));
    dispatch(setPage(1));
  };

  const handleReset = () => {
    dispatch(clearFilters());
  };

  const hasActive =
    filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.sort;

  return (
    <aside className="product-filter">
      <div className="product-filter__header">
        <h3 className="product-filter__heading">Filters</h3>
        {hasActive && (
          <button className="product-filter__reset" onClick={handleReset}>
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="product-filter__group">
        <label className="product-filter__label">Category</label>
        <select
          className="product-filter__select"
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.icon ? `${c.icon} ` : ''}{c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className="product-filter__group">
          <label className="product-filter__label">Brand</label>
          <select
            className="product-filter__select"
            value={filters.brand}
            onChange={(e) => update('brand', e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div className="product-filter__group">
        <label className="product-filter__label">Price Range (₹)</label>
        <div className="product-filter__price-row">
          <input
            type="number"
            className="product-filter__input"
            placeholder="Min"
            min="0"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
          />
          <span className="product-filter__price-sep">–</span>
          <input
            type="number"
            className="product-filter__input"
            placeholder="Max"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Sort */}
      <div className="product-filter__group">
        <label className="product-filter__label">Sort By</label>
        <select
          className="product-filter__select"
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
};

export default ProductFilter;
