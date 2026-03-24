import Swal from 'sweetalert2';

// TripKey theme colors
const TRIPKEY_THEME = {
  primary: '#0ea5e9', // sky-500
  primaryDark: '#0284c7', // sky-600
  success: '#10b981', // emerald-500
  danger: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  background: '#f0f9ff', // sky-50
  text: '#111827', // gray-900
  textLight: '#6b7280', // gray-500
};

export const tripKeyAlert = {
  // Success alert
  success: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonColor: TRIPKEY_THEME.primary,
      confirmButtonText: 'OK',
      background: TRIPKEY_THEME.background,
      titleText: title,
      allowOutsideClick: false,
      customClass: {
        title: 'text-gray-900 font-bold',
        confirmButton: 'bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg',
      },
    });
  },

  // Error alert
  error: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonColor: TRIPKEY_THEME.danger,
      confirmButtonText: 'OK',
      background: TRIPKEY_THEME.background,
      allowOutsideClick: false,
      customClass: {
        title: 'text-gray-900 font-bold',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg',
      },
    });
  },

  // Warning alert
  warning: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonColor: TRIPKEY_THEME.warning,
      confirmButtonText: 'OK',
      background: TRIPKEY_THEME.background,
      allowOutsideClick: false,
      customClass: {
        title: 'text-gray-900 font-bold',
        confirmButton: 'bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg',
      },
    });
  },

  // Confirmation alert (for destructive actions)
  confirm: (title: string, message: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: TRIPKEY_THEME.danger,
      cancelButtonColor: TRIPKEY_THEME.textLight,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      background: TRIPKEY_THEME.background,
      allowOutsideClick: false,
      customClass: {
        title: 'text-gray-900 font-bold',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg mr-2',
        cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg',
      },
    });
  },

  // Sign out confirmation
  signOutConfirm: () => {
    return Swal.fire({
      icon: 'question',
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out from TripKey?',
      showCancelButton: true,
      confirmButtonColor: TRIPKEY_THEME.danger,
      cancelButtonColor: TRIPKEY_THEME.textLight,
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel',
      background: TRIPKEY_THEME.background,
      allowOutsideClick: false,
      customClass: {
        title: 'text-gray-900 font-bold',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg mr-2',
        cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg',
      },
    });
  },

  // Info alert
  info: (title: string, message?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonColor: TRIPKEY_THEME.primary,
      confirmButtonText: 'OK',
      background: TRIPKEY_THEME.background,
      allowOutsideClick: false,
      customClass: {
        title: 'text-gray-900 font-bold',
        confirmButton: 'bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg',
      },
    });
  },

  // Loading toast notification
  loading: (message: string) => {
    return Swal.fire({
      title: message,
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: TRIPKEY_THEME.background,
      customClass: {
        title: 'text-gray-900 font-bold',
      },
    });
  },

  // Close any open alert
  close: () => {
    Swal.close();
  },
};
