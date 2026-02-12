/**
 * Toast Notification System
 * 
 * Provides utility functions for showing toast notifications throughout the app.
 * Uses react-hot-toast library for consistent, customizable notifications.
 */

import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Default toast configuration
 */
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

/**
 * Show success toast
 */
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

/**
 * Show error toast
 */
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

/**
 * Show warning toast
 */
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

/**
 * Show info toast
 */
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

/**
 * Show loading toast
 */
export function showLoading(message = 'Loading...', options = {}) {
  return toast.loading(message, {
    ...defaultOptions,
    ...options
  });
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId) {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
}

/**
 * Show promise toast with loading, success, and error states
 */
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

/**
 * Custom toast with custom content
 */
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
