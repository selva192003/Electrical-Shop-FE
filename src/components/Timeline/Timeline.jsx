import './Timeline.css';

const Timeline = () => {
  const milestones = [
    {
      year: '1998',
      title: 'Humble Beginnings',
      description:
        'Started as a small neighbourhood electrical shop, serving local homes with basic lighting and wiring needs.',
      icon: '💡',
    },
    {
      year: '2005',
      title: 'Hardware & Wiring Expansion',
      description:
        'Expanded into hardware, wiring accessories, and domestic switchgear to support growing residential projects.',
      icon: '🧰',
    },
    {
      year: '2012',
      title: 'Authorised Brand Partner',
      description:
        'Became an authorised distributor for leading electrical brands, strengthening our promise of genuine products.',
      icon: '✅',
    },
    {
      year: '2024',
      title: 'Digital Transformation',
      description:
        'Launched our online platform to make trusted electrical and hardware solutions accessible from anywhere.',
      icon: '🌐',
    },
  ];

  return (
    <section className="home-section">
      <div className="home-section-header">
        <h2 className="home-section-title">Our History & Growth Journey</h2>
        <p className="home-section-subtitle">A steady journey of trust, service, and expansion.</p>
      </div>
      <div className="timeline">
        {milestones.map((m, index) => {
          const side = index % 2 === 0 ? 'left' : 'right';
          return (
            <div key={m.year} className={`timeline-item timeline-item--${side}`}>
            <div className="timeline-marker">
              <span className="timeline-icon">{m.icon}</span>
              <span className="timeline-year">{m.year}</span>
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">{m.title}</h3>
              <p className="timeline-description">{m.description}</p>
            </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Timeline;
