import { useState, useEffect, useRef, useCallback } from 'react';
import logo from '../../assets/sri-murugan-logo.png';
import './StoreGallery.css';

const IMAGES = [
  { src: '/store-images/store-1.jpg', alt: 'Sri Murugan Store – Main Counter', caption: 'Main Counter' },
  { src: '/store-images/store-2.jpg', alt: 'Sri Murugan Store – Product Display', caption: 'Product Display' },
  { src: '/store-images/store-3.jpg', alt: 'Sri Murugan Store – Hardware Section', caption: 'Hardware Section' },
  { src: '/store-images/store-4.png', alt: 'Sri Murugan Store – Electrical Aisle', caption: 'Electrical Aisle' },
  { src: '/store-images/store-5.png', alt: 'Sri Murugan Store – Customer Area', caption: 'Customer Area' },
];

/* ─── helpers ─────────────────────────────────────────── */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function getPositionData(index, active, total) {
  const offset = ((index - active) % total + total) % total;
  const normalized = offset > total / 2 ? offset - total : offset;
  // normalized: −2 left edge … 0 centre … +2 right edge (for 5 items)
  return normalized;
}

export default function StoreGallery() {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null); // index or null
  const [tilt, setTilt] = useState({ x: 0, y: 0 }); // parallax for active card
  const [touching, setTouching] = useState(false);
  const touchStartX = useRef(null);
  const containerRef = useRef(null);
  const autoplayRef = useRef(null);
  const total = IMAGES.length;

  /* ── autoplay ─────────────────────────────────────────── */
  const resetAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setActive((a) => (a + 1) % total);
    }, 4500);
  }, [total]);

  useEffect(() => {
    resetAutoplay();
    return () => clearInterval(autoplayRef.current);
  }, [resetAutoplay]);

  /* ── navigation ──────────────────────────────────────── */
  const goTo = (idx) => {
    setActive(((idx % total) + total) % total);
    resetAutoplay();
  };
  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);

  /* ── keyboard ─────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (lightbox !== null) {
        if (e.key === 'ArrowLeft') setLightbox((l) => ((l - 1 + total) % total));
        if (e.key === 'ArrowRight') setLightbox((l) => (l + 1) % total);
        if (e.key === 'Escape') setLightbox(null);
        return;
      }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lightbox]);

  /* ── parallax on centre card ─────────────────────────── */
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = clamp((e.clientX - cx) / (rect.width / 2), -1, 1);
    const y = clamp((e.clientY - cy) / (rect.height / 2), -1, 1);
    setTilt({ x, y });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  /* ── touch swipe ─────────────────────────────────────── */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setTouching(true);
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
    setTouching(false);
  };

  /* ── lightbox open ──────────────────────────────────── */
  const openLightbox = () => setLightbox(active);

  return (
    <section className="sg-section" aria-label="Our Store Experience">
      {/* background watermark */}
      <div className="sg-watermark" aria-hidden="true">
        <img src={logo} alt="" draggable="false" />
      </div>

      {/* header */}
      <div className="sg-header">
        <span className="sg-overline">Our Store Experience</span>
        <h2 className="sg-title">Step Inside Our Store</h2>
        <p className="sg-subtitle">
          Take a quick look at our store where quality electrical and hardware solutions meet trusted customer service.
        </p>
      </div>

      {/* carousel stage */}
      <div
        ref={containerRef}
        className="sg-stage"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {IMAGES.map((img, idx) => {
          const pos = getPositionData(idx, active, total);
          // only render cards within visible range (−2 … +2)
          if (Math.abs(pos) > 2) return null;

          const isActive = pos === 0;
          const absPos = Math.abs(pos);

          // layout values driven by position offset
          const scale = isActive ? 1 : 1 - absPos * 0.13;
          const zIndex = 10 - absPos;
          const translateX = pos * 220; // px shift per slot
          const rotateY = pos * -10;    // deg tilt for depth
          const opacity = absPos > 1 ? 0.6 : 1;

          // parallax only on active
          const tiltX = isActive ? tilt.y * -6 : 0;
          const tiltY = isActive ? tilt.x * 8 : 0;

          const transform = [
            `translateX(${translateX}px)`,
            `scale(${scale})`,
            `perspective(900px)`,
            `rotateY(${rotateY + tiltY}deg)`,
            `rotateX(${tiltX}deg)`,
          ].join(' ');

          return (
            /* float wrapper keeps the float animation separate from the JS transform */
            <div
              key={idx}
              className={`sg-float-wrap${isActive ? ' sg-float-wrap--active' : ''}${absPos === 1 ? ' sg-float-wrap--near' : ''}${absPos === 2 ? ' sg-float-wrap--far' : ''}`}
              style={{ position: 'absolute', zIndex }}
            >
              <div
                className={`sg-card${isActive ? ' sg-card--active' : ''}${absPos === 1 ? ' sg-card--near' : ''}${absPos === 2 ? ' sg-card--far' : ''}`}
                style={{ transform, opacity }}
                onClick={() => isActive ? openLightbox() : goTo(idx)}
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-label={isActive ? `View ${img.caption} fullscreen` : `Go to ${img.caption}`}
                onKeyDown={(e) => e.key === 'Enter' && (isActive ? openLightbox() : goTo(idx))}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  draggable="false"
                  className="sg-card__img"
                />
                <div className="sg-card__overlay">
                  <span className="sg-card__caption">{img.caption}</span>
                  {isActive && (
                    <span className="sg-card__hint">
                      <span className="material-icons">zoom_in</span> Click to expand
                    </span>
                  )}
                </div>
                {isActive && (
                  <div
                    className="sg-card__shine"
                    style={{
                      background: `radial-gradient(circle at ${50 + tilt.x * 30}% ${50 + tilt.y * 30}%, rgba(255,255,255,0.18) 0%, transparent 65%)`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* nav arrows */}
      <div className="sg-nav">
        <button className="sg-arrow" onClick={prev} aria-label="Previous image">
          <span className="material-icons">chevron_left</span>
        </button>

        {/* dot indicators */}
        <div className="sg-dots">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              className={`sg-dot${i === active ? ' sg-dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>

        <button className="sg-arrow" onClick={next} aria-label="Next image">
          <span className="material-icons">chevron_right</span>
        </button>
      </div>

      {/* lightbox */}
      {lightbox !== null && (
        <div
          className="sg-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={() => setLightbox(null)}
        >
          <button
            className="sg-lb-close"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            <span className="material-icons">close</span>
          </button>

          <button
            className="sg-lb-arrow sg-lb-arrow--left"
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => ((l - 1 + total) % total)); }}
            aria-label="Previous"
          >
            <span className="material-icons">chevron_left</span>
          </button>

          <div className="sg-lb-frame" onClick={(e) => e.stopPropagation()}>
            <img
              src={IMAGES[lightbox].src}
              alt={IMAGES[lightbox].alt}
              className="sg-lb-img"
            />
            <div className="sg-lb-caption">
              <span>{IMAGES[lightbox].caption}</span>
              <span className="sg-lb-counter">{lightbox + 1} / {total}</span>
            </div>
          </div>

          <button
            className="sg-lb-arrow sg-lb-arrow--right"
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l + 1) % total); }}
            aria-label="Next"
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
}
