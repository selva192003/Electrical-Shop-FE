import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  setFilters,
  setPage,
  clearFilters,
} from '../../redux/slices/productSlice.js';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import ProductFilter from '../../components/ProductFilter/ProductFilter.jsx';
import ProductSearch from '../../components/ProductSearch/ProductSearch.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './Products.css';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    items, loading, error,
    page, totalPages, total,
    filters, categories,
  } = useSelector((s) => s.products);

  // Sync URL → Redux on first load
  useEffect(() => {
    const params = {};
    if (searchParams.get('category')) params.category = searchParams.get('category');
    if (searchParams.get('brand')) params.brand = searchParams.get('brand');
    if (searchParams.get('keyword')) params.keyword = searchParams.get('keyword');
    if (searchParams.get('sort')) params.sort = searchParams.get('sort');
    if (Object.keys(params).length) dispatch(setFilters(params));
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch whenever filters or page changes
  useEffect(() => {
    const query = {
      page,
      limit: 12,
      ...(filters.keyword && { keyword: filters.keyword }),
      ...(filters.category && { category: filters.category }),
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.sort && { sort: filters.sort }),
    };
    dispatch(fetchProducts(query));

    // Keep URL in sync
    const sp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && k !== 'page' && k !== 'limit') sp.set(k, v);
    });
    if (page > 1) sp.set('page', page);
    setSearchParams(sp, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const handlePageChange = useCallback((p) => {
    dispatch(setPage(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  const getCategoryName = (id) => categories.find((c) => c._id === id)?.name || '';

  const activeFilterCount = [
    filters.keyword, filters.category, filters.brand,
    filters.minPrice, filters.maxPrice, filters.sort,
  ].filter(Boolean).length;

  return (
    <div className="products-page page-container">
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="products-heading">
            {filters.category ? getCategoryName(filters.category) : 'All Products'}
          </h1>
          {!loading && (
            <p className="products-count">
              {total} {total === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>
        <ProductSearch placeholder="Search by name, brand…" />
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="products-chips">
          {filters.keyword && (
            <span className="filter-chip">
              Search: "{filters.keyword}"
              <button onClick={() => { dispatch(setFilters({ keyword: '' })); dispatch(setPage(1)); }}>✕</button>
            </span>
          )}
          {filters.category && (
            <span className="filter-chip">
              Category: {getCategoryName(filters.category)}
              <button onClick={() => { dispatch(setFilters({ category: '' })); dispatch(setPage(1)); }}>✕</button>
            </span>
          )}
          {filters.brand && (
            <span className="filter-chip">
              Brand: {filters.brand}
              <button onClick={() => { dispatch(setFilters({ brand: '' })); dispatch(setPage(1)); }}>✕</button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="filter-chip">
              Price: ₹{filters.minPrice || 0} – ₹{filters.maxPrice || '∞'}
              <button onClick={() => { dispatch(setFilters({ minPrice: '', maxPrice: '' })); dispatch(setPage(1)); }}>✕</button>
            </span>
          )}
          <button className="filter-chip-clear-all" onClick={() => dispatch(clearFilters())}>
            Clear all
          </button>
        </div>
      )}

      <div className="products-body">
        {/* Sidebar Filter */}
        <div className="products-sidebar">
          <ProductFilter />
        </div>

        {/* Grid */}
        <div className="products-main">
          {loading ? (
            <div className="products-loading"><Spinner /></div>
          ) : error ? (
            <EmptyState
              icon="⚠️"
              title="Something went wrong"
              message={error}
              actionLabel="Retry"
              onAction={() => dispatch(fetchProducts({ page, limit: 12, ...filters }))}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon="🔌"
              title="No products found"
              message="Try adjusting your search or filters to find what you're looking for."
              actionLabel="Clear Filters"
              onAction={() => dispatch(clearFilters())}
            />
          ) : (
            <div className="products-grid">
              {items.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="products-pagination">
              <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                ‹ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-btn${p === page ? ' active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
