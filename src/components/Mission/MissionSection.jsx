import './MissionSection.css';

const MissionSection = () => {
  const points = [
    {
      title: 'Quality Assurance',
      description:
        'Every product is carefully sourced from trusted manufacturers, with a strong focus on durability and performance.',
    },
    {
      title: 'Customer Satisfaction',
      description:
        'We believe in long-term relationships, offering honest guidance, fair pricing, and dependable after-sales support.',
    },
    {
      title: 'Innovation & Safety',
      description:
        'We embrace new technologies and standards that make homes safer, more efficient, and future-ready.',
    },
  ];

  return (
    <section className="home-section mission-section card">
      <div className="home-section-header">
        <h2 className="home-section-title">Our Mission</h2>
      </div>
      <p className="mission-text">
        To provide high-quality electrical and hardware products that ensure safety, durability, and long-term performance
        while maintaining affordable pricing and customer satisfaction.
      </p>
      <div className="mission-grid">
        {points.map((p) => (
          <div key={p.title} className="mission-card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MissionSection;
