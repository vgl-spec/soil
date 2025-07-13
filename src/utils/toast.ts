import Swal from 'sweetalert2';

// Toast configuration
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  loading: (title: string = 'Processing...') => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      timer: undefined,
      timerProgressBar: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: 'rgba(74, 85, 104, 0.95)',
      color: 'white',
    });
  },
  
  close: () => {
    Swal.close();
  }tton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'animated-toast',
    title: 'toast-title',
    icon: 'toast-icon'
  }
});

// Custom animations for toasts
const toastAnimations = `
  .animated-toast {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  .animated-toast.swal2-show {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  .animated-toast.swal2-hide {
    animation: slideOutRight 0.3s ease-in forwards;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .toast-icon {
    animation: pulse 0.6s ease-in-out;
  }
  
  .toast-title {
    font-weight: 600;
    font-size: 14px;
  }
  
  .swal2-popup.animated-toast {
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }
`;

// Inject animations into the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = toastAnimations;
  document.head.appendChild(style);
}

export const showToast = {
  success: (title: string, text?: string) => {
    return Toast.fire({
      icon: 'success',
      title,
      text,
      background: 'rgba(72, 187, 120, 0.95)',
      color: 'white',
    });
  },
  
  error: (title: string, text?: string) => {
    return Toast.fire({
      icon: 'error',
      title,
      text,
      background: 'rgba(245, 101, 101, 0.95)',
      color: 'white',
      timer: 4000,
    });
  },
  
  warning: (title: string, text?: string) => {
    return Toast.fire({
      icon: 'warning',
      title,
      text,
      background: 'rgba(237, 137, 54, 0.95)',
      color: 'white',
    });
  },
  
  info: (title: string, text?: string) => {
    return Toast.fire({
      icon: 'info',
      title,
      text,
      background: 'rgba(66, 153, 225, 0.95)',
      color: 'white',
    });
  },
  
  loading: (title: string = 'Processing...') => {
    return Toast.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      timer: undefined,
      timerProgressBar: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: 'rgba(74, 85, 104, 0.95)',
      color: 'white',
    });
  }
};

export const showConfirmation = {
  delete: (itemName: string) => {
    return Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete <strong>${itemName}</strong>.<br>This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'animated-modal',
        confirmButton: 'confirm-btn',
        cancelButton: 'cancel-btn'
      },
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut animate__faster'
      }
    });
  },
  
  clear: (message: string) => {
    return Swal.fire({
      title: 'Clear All Data?',
      html: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3182ce',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Yes, clear all!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'animated-modal',
      },
      showClass: {
        popup: 'animate__animated animate__bounceIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__bounceOut animate__faster'
      }
    });
  },
  
  action: (title: string, message: string, confirmText: string = 'Confirm') => {
    return Swal.fire({
      title,
      html: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#38a169',
      cancelButtonColor: '#718096',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'animated-modal',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });
  }
};

// Custom modal animations
const modalAnimations = `
  .animated-modal {
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  .confirm-btn {
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .confirm-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .cancel-btn {
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .cancel-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

// Inject modal animations
if (typeof document !== 'undefined') {
  const modalStyle = document.createElement('style');
  modalStyle.textContent = modalAnimations;
  document.head.appendChild(modalStyle);
}
