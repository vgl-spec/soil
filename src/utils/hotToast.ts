import toast, { Toaster } from 'react-hot-toast';

// Custom toast styles optimized for mobile
const toastOptions = {
  // Default options for all toasts
  duration: 3000,
  position: 'top-center' as const,
  
  // Styling
  style: {
    borderRadius: '12px',
    background: '#333',
    color: '#fff',
    fontSize: '14px',
    maxWidth: '90vw',
    padding: '12px 16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
  },

  // Success toast style
  success: {
    duration: 3000,
    style: {
      background: 'rgba(34, 197, 94, 0.95)',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'rgba(34, 197, 94, 0.95)',
    },
  },

  // Error toast style
  error: {
    duration: 4000,
    style: {
      background: 'rgba(239, 68, 68, 0.95)',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'rgba(239, 68, 68, 0.95)',
    },
  },

  // Loading toast style
  loading: {
    style: {
      background: 'rgba(59, 130, 246, 0.95)',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'rgba(59, 130, 246, 0.95)',
    },
  },
};

// Enhanced toast functions with mobile optimization
export const showToast = {
  success: (title: string, message?: string) => {
    const content = message ? `${title}\n${message}` : title;
    return toast.success(content, toastOptions.success);
  },

  error: (title: string, message?: string) => {
    const content = message ? `${title}\n${message}` : title;
    return toast.error(content, toastOptions.error);
  },

  loading: (message: string) => {
    return toast.loading(message, toastOptions.loading);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      style: toastOptions.style,
      success: toastOptions.success,
      error: toastOptions.error,
      loading: toastOptions.loading,
    });
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },

  custom: (message: string, options?: any) => {
    return toast(message, { ...toastOptions, ...options });
  }
};

// Export the Toaster component for App.tsx
export { Toaster };

// Default export for backward compatibility
export default showToast;
