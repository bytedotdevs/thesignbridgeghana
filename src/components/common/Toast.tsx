import React from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFavorites();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              padding: '12px 18px',
              borderRadius: '9999px',
              backgroundColor: isSuccess ? '#0f172a' : isError ? '#991b1b' : '#1e293b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.22), 0 2px 6px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSuccess && <CheckCircle2 size={18} color="#4ade80" />}
              {isError && <AlertTriangle size={18} color="#f87171" />}
              {!isSuccess && !isError && <Info size={18} color="#60a5fa" />}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
