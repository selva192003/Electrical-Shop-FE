import './TestimonialsSection.css';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Homeowner',
    text:
      'Sri Murugan Electrical & Hardware Store has been our family’s trusted shop for years. Their guidance on safe wiring and genuine products has always made a difference.',
  },
  {
    name: 'Priya Engineering Works',
    role: 'Electrical Contractor',
    text:
      'For bulk orders and project requirements, they are reliable, transparent, and timely. The team understands site realities and helps us choose the right materials.',
  },
  {
    name: 'S. Balasubramanian',
    role: 'Small Business Owner',
    text:
      'From our first shop to our latest renovation, they have supplied everything from lighting to MCBs with consistent quality and support.',
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
              <div className="testimonial-stars">★★★★★</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
