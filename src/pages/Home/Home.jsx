import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { fetchProducts, fetchCategories, fetchFeaturedProducts, setFilters, setPage } from '../../redux/slices/productSlice.js';
import { addItemToCart } from '../../redux/slices/cartSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Timeline from '../../components/Timeline/Timeline.jsx';
import MissionSection from '../../components/Mission/MissionSection.jsx';
import VisionSection from '../../components/Vision/VisionSection.jsx';
import TestimonialsSection from '../../components/Testimonials/TestimonialsSection.jsx';
import BrandShowcase from '../../components/BrandShowcase/BrandShowcase.jsx';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { items, featured, categories, loading, error, page, totalPages, filters, featuredLoading, featuredError } =
    useSelector((state) => state.products);

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
        <div className="home-hero-left">
          <p className="home-hero-overline">Sri Murugan Electrical &amp; Hardware Store</p>
          <h1 className="home-hero-title">Powering Homes. Empowering Lives.</h1>
          <p className="home-hero-subtitle">
            With decades of dedication in delivering high-quality electrical and hardware solutions, Sri Murugan Electrical &amp;
            Hardware Store has become a trusted name in reliability, safety, and innovation.
          </p>
          <div className="home-hero-ctas">
            <button
              type="button"
              className="accent-btn"
              onClick={() =>
                document.getElementById('home-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Shop Now
            </button>
            <button
              type="button"
              className="primary-btn home-hero-secondary"
              onClick={() => document.getElementById('about-store')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Our Story
            </button>
          </div>
        </div>
        <div className="home-hero-right">
          <div className="home-hero-badge">
            <span className="home-hero-years">25+ Years</span>
            <span className="home-hero-note">of powering homes and businesses</span>
          </div>
          <div className="home-hero-motif" />
        </div>
      </section>

      <section className="home-strip card">
        <div className="home-strip-item">
          <div className="home-strip-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M9 16.2 5.5 12.7 4.1 14.1 9 19l11-11-1.4-1.4z" />
            </svg>
          </div>
          <div>
            <div className="home-strip-title">Genuine Brands</div>
            <div className="home-strip-text">Authorised products with safety assurance.</div>
          </div>
        </div>
        <div className="home-strip-item">
          <div className="home-strip-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M20 8h-3.17l-1.84-2.76A2 2 0 0 0 13.33 4H4a2 2 0 0 0-2 2v10h2a3 3 0 0 0 6 0h4a3 3 0 0 0 6 0h2v-6a2 2 0 0 0-2-2zm-14 9a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm10 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
            </svg>
          </div>
          <div>
            <div className="home-strip-title">Timely Delivery</div>
            <div className="home-strip-text">Quick dispatch for urgent projects.</div>
          </div>
        </div>
        <div className="home-strip-item">
          <div className="home-strip-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 12a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0-10A10 10 0 1 0 22 12 10 10 0 0 0 12 2zm3.7 13.3L11 13V7h2v4.2l3.3 1.9z" />
            </svg>
          </div>
          <div>
            <div className="home-strip-title">Support 9 AM - 8 PM</div>
            <div className="home-strip-text">Guidance from experienced store experts.</div>
          </div>
        </div>
      </section>

      <section id="about-store" className="home-about card">
        <div className="home-section-header">
          <h2 className="home-section-title">About Sri Murugan Electrical &amp; Hardware Store</h2>
        </div>
        <div className="home-about-grid">
          <p>
            Sri Murugan Electrical &amp; Hardware Store began as a modest local outlet, helping nearby households with everyday
            electrical essentials. Over the years, what started as a small counter and a few shelves has grown into a
            full-fledged destination for lighting, wiring, safety devices, and hardware solutions.
          </p>
          <p>
            Built on trust, genuine products, and consistent service, our store has earned the confidence of homeowners,
            electricians, contractors, and small businesses alike. We believe that every switch, cable, and fitting carries a
            responsibility towards safety and long-term reliability.
          </p>
          <p>
            As customer needs evolved, so did we. From expanding our product range to partnering with reputed brands, and now
            transforming into a digital platform, we have stayed rooted in our traditional values while embracing modern
            technology.
          </p>
          <p>
            Today, Sri Murugan Electrical &amp; Hardware Store brings the same personalised guidance and trust you find at our
            physical counter to your screen – helping you choose the right products for your home, projects, and business
            requirements.
          </p>
        </div>
      </section>

      <Timeline />
      <MissionSection />
      <VisionSection />

      <section className="home-section why-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Why Choose Us</h2>
          <p className="home-section-subtitle">Practical reasons customers keep coming back to us.</p>
        </div>
        <div className="why-grid">
          {[
            'Genuine Products',
            'Competitive Pricing',
            'Expert Guidance',
            'Bulk Order Support',
            'Fast Delivery',
            '24/7 Customer Support',
          ].map((item) => (
            <article key={item} className="why-card card">
              <h3>{item}</h3>
              <p>
                {item === 'Genuine Products' && 'We deal only with authorised brands and certified components, ensuring long-term safety.'}
                {item === 'Competitive Pricing' &&
                  'Transparent pricing that balances affordability with quality, suitable for homes and projects.'}
                {item === 'Expert Guidance' &&
                  'Our team is experienced in both domestic and commercial requirements, helping you choose wisely.'}
                {item === 'Bulk Order Support' &&
                  'Structured support for contractors, institutions, and businesses with volume needs and timelines.'}
                {item === 'Fast Delivery' && 'Prompt dispatch and local delivery support so your projects stay on schedule.'}
                {item === '24/7 Customer Support' &&
                  'Support for urgent requirements and clarifications, even beyond standard store hours.'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <BrandShowcase />

      <section className="home-section trust-section card">
        <div className="home-section-header">
          <h2 className="home-section-title">Customer Trust, Earned Over Time</h2>
          <p className="home-section-subtitle">Numbers that reflect our relationship with the community.</p>
        </div>
        <div className="trust-grid">
          <div className="trust-stat">
            <div className="trust-number" data-target="25">25+</div>
            <div className="trust-label">Years of Experience</div>
          </div>
          <div className="trust-stat">
            <div className="trust-number" data-target="10000">10,000+</div>
            <div className="trust-label">Happy Customers</div>
          </div>
          <div className="trust-stat">
            <div className="trust-number" data-target="5000">5,000+</div>
            <div className="trust-label">Products Available</div>
          </div>
          <div className="trust-stat">
            <div className="trust-number" data-target="99">99%</div>
            <div className="trust-label">Customer Satisfaction</div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="home-section closing-cta card">
        <div className="closing-text">
          <h2>Power Your Projects with Confidence.</h2>
          <p>
            From a single switchboard to complete electrical planning, Sri Murugan Electrical &amp; Hardware Store is here to
            support your journey with dependable products and grounded advice.
          </p>
        </div>
        <div className="closing-actions">
          <button type="button" className="accent-btn" onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}>
            Start Shopping
          </button>
          <button type="button" className="primary-btn" onClick={() => window.location.assign('tel:+919876543210')}>
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
