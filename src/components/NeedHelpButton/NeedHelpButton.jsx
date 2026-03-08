import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NeedHelpButton.css';

const NeedHelpButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer.site-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setMerging(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  // Hide on the support page itself
  if (pathname === '/support') return null;

  return (
    <button
      className={`need-help-btn${merging ? ' need-help-btn--merging' : ''}`}
      onClick={() => navigate('/support')}
      aria-label="Go to Support page"
      title="Need Help?"
    >
      <span className="material-icons need-help-icon">help_outline</span>
      <span className="need-help-label">Need Help?</span>
    </button>
  );
};

export default NeedHelpButton;
