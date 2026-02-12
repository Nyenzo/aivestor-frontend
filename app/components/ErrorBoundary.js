'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI.
 * Prevents the entire app from crashing due to errors in a single component.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // You can also log the error to an error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                <p className="text-gray-400">
                  We're sorry for the inconvenience. An unexpected error has occurred.
                </p>
              </div>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-black/40 p-4 rounded-lg mb-6 overflow-auto max-h-64">
                <p className="text-red-400 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
