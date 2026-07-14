

import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const defaultOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#1f2937',
    color: '#fff',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    maxWidth: '400px'
  }
};

export function showSuccess(message, options = {}) {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    style: {
      ...defaultOptions.style,
      border: '1px solid #10b981',
      ...options.style
    }
  });
}

export function showError(message, options = {}) {
  return toast.error(message, {
    ...defaultOptions,
    duration: 6000,
    ...options,
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    style: {
      ...defaultOptions.style,
      border: '1px solid #ef4444',
      ...options.style
    }
  });
}

export function showWarning(message, options = {}) {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    style: {
      ...defaultOptions.style,
      border: '1px solid #f59e0b',
      ...options.style
    }
  });
}

export function showInfo(message, options = {}) {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: <Info className="w-5 h-5 text-blue-500" />,
    style: {
      ...defaultOptions.style,
      border: '1px solid #3b82f6',
      ...options.style
    }
  });
}

export function showLoading(message = 'Loading...', options = {}) {
  return toast.loading(message, {
    ...defaultOptions,
    ...options
  });
}

export function dismissToast(toastId) {
  toast.dismiss(toastId);
}

export function dismissAllToasts() {
  toast.dismiss();
}

export function showPromise(promise, messages = {}) {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: (err) => messages.error || err?.message || 'An error occurred'
    },
    defaultOptions
  );
}

export function showCustom(content, options = {}) {
  return toast.custom(content, {
    ...defaultOptions,
    ...options
  });
}

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  promise: showPromise,
  custom: showCustom,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts
};
