import React from 'react';
import { useToast } from '../context/ToastContext';
import './toast.css';

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container-root">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`} role="status" onClick={() => removeToast(t.id)}>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;



