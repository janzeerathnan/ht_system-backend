import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  // Custom color logic
  const getBgColor = (severity) => {
    switch (severity) {
      case 'success':
        return '#43a047'; // green
      case 'error':
        return '#d32f2f'; // red
      case 'server':
        return '#1976d2'; // blue
      default:
        return '#a60515'; // fallback
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity === 'server' ? 'info' : toast.severity}
          sx={{
            bgcolor: getBgColor(toast.severity),
            color: 'white',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minWidth: 280
          }}
          icon={false}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext); 