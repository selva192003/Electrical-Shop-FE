import { createContext, useCallback, useContext, useRef, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let idCounter = 0;
const DURATION = 4000; // ms

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);

  const value = {
    addToast,
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-body">
              <span className="toast-message">{toast.message}</span>
              <button className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Close">
                &times;
              </button>
            </div>
            <div className="toast-progress">
              <div
                className="toast-progress-bar"
                style={{ animationDuration: `${DURATION}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
