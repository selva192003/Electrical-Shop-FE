import { useLocation, useNavigate } from 'react-router-dom';
import './NeedHelpButton.css';

const NeedHelpButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Hide on the support page itself
  if (pathname === '/support') return null;

  return (
    <button
      className="need-help-btn"
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
