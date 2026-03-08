import './Timeline.css';

const Timeline = () => {
  const milestones = [
    {
      year: '2015',
      title: 'Humble Beginnings',
      description:
        'Sri Murugan electricals & Hardwares opened its doors in Perundurai West, serving local homes and electricians with genuine wiring and lighting products.',
      icon: 'lightbulb',
    },
    {
      year: '2017',
      title: 'Hardware & Battery Range',
      description:
        'Expanded into hardware, switchgear, and batteries — becoming an authorised dealer for Luminous inverter batteries and Amaron UPS batteries.',
      icon: 'battery_charging_full',
    },
    {
      year: '2020',
      title: 'Multi-Brand Distributor',
      description:
        'Grew into a comprehensive multi-brand electrical distributor, stocking Havells, Finolex, Polycab, Crompton, Orient, and more under one roof.',
      icon: 'task_alt',
    },
    {
      year: '2026',
      title: 'Online Store Launch',
      description:
        'Launched our e-commerce platform to bring trusted electrical and hardware products to customers across Tamil Nadu.',
      icon: 'public',
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
              <span className="timeline-icon material-icons">{m.icon}</span>
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
