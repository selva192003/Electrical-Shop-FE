import { useDarkMode } from '../../context/DarkModeContext.jsx';
import './DarkModeToggle.css';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      className={`dark-mode-toggle ${darkMode ? 'dark' : 'light'}`}
      onClick={toggleDarkMode}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark mode"
    >
      <span className="dm-icon">{darkMode ? '☀️' : '🌙'}</span>
      <span className="dm-track">
        <span className="dm-thumb" />
      </span>
    </button>
  );
}
