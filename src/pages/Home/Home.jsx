import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { fetchProducts, fetchCategories, fetchFeaturedProducts, setFilters, setPage } from '../../redux/slices/productSlice.js';
import { addItemToCart } from '../../redux/slices/cartSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { items, featured, categories, loading, page, totalPages, filters } = useSelector((state) => state.products);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      keyword: filters.keyword,
      category: filters.category,
      sort: filters.sort,
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({
      page,
      keyword: filters.keyword || undefined,
      category: filters.category || undefined,
      sort: filters.sort || undefined,
    }));
  }, [dispatch, page, filters.keyword, filters.category, filters.sort]);

  const onFilterSubmit = (data) => {
    dispatch(setFilters(data));
    dispatch(setPage(1));
  };

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
      addToast('Added to cart', 'success');
    } catch (err) {
      addToast(err || 'Could not add to cart', 'error');
    }
  };

  return (
    <div className="page-container home-page">
      <section className="home-hero card">
        <div>
          <h1 className="home-hero-title">Power up your space with trusted electricals.</h1>
          <p className="home-hero-subtitle">
            Shop premium electrical products – from LED lighting to heavy-duty breakers – curated for safety, efficiency, and performance.
          </p>
        </div>
      </section>

      <section className="home-filters card">
        <form className="home-filter-form" onSubmit={handleSubmit(onFilterSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="keyword">
              Search
            </label>
            <input id="keyword" className="input-field" placeholder="Search bulbs, fans, MCBs..." {...register('keyword')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select id="category" className="input-field" {...register('category')}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sort">
              Sort by
            </label>
            <select id="sort" className="input-field" {...register('sort')}>
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          <div className="home-filter-actions">
            <button type="submit" className="primary-btn">
              Apply Filters
            </button>
          </div>
        </form>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Featured Picks</h2>
        </div>
        <div className="home-grid">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">All Products</h2>
          <p className="home-section-subtitle">Showing page {page}</p>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="home-grid">
              {items.map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
            <div className="home-pagination">
              <button
                type="button"
                className="primary-btn"
                disabled={page <= 1}
                onClick={() => dispatch(setPage(page - 1))}
              >
                Previous
              </button>
              <span className="home-page-indicator">
                {page} / {totalPages || 1}
              </span>
              <button
                type="button"
                className="primary-btn"
                disabled={totalPages && page >= totalPages}
                onClick={() => dispatch(setPage(page + 1))}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
