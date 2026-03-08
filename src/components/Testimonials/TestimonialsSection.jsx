import './TestimonialsSection.css';

const testimonials = [
  {
    name: 'Muthu Krishnan',
    role: 'Homeowner — Perundurai',
    text:
      'I have been buying all my wiring and switchgear from Sri Murugan Electricals since 2018. Their products are always genuine, and the staff guides you patiently even for small requirements.',
  },
  {
    name: 'Senthil Electrical Works',
    role: 'Electrical Contractor — Erode',
    text:
      'For bulk orders and site projects, they give competitive rates and ensure the material is always available. Delivery to our sites in Erode district is prompt and hassle-free.',
  },
  {
    name: 'Karthik Enterprises',
    role: 'Small Business Owner — Perundurai West',
    text:
      'Purchased Luminous inverter batteries and a complete wiring kit for our new showroom. The team recommended exactly what we needed — no overselling, just honest advice.',
  },

];

const TestimonialsSection = () => {
  return (
    <section className="home-section testimonials-section">
      <div className="home-section-header">
        <h2 className="home-section-title">What Our Customers Say</h2>
        <p className="home-section-subtitle">Real experiences from homeowners, contractors, and businesses.</p>
      </div>
      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <article key={t.name} className="testimonial-card card">
            <p className="testimonial-text">“{t.text}”</p>
            <div className="testimonial-footer">
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-icons testimonial-star">star</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
