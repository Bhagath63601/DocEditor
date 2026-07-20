import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback glass fade-in" style={{
          padding: '2rem',
          margin: '1rem',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={40} color="#ef4444" />
          <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Something went wrong in this section
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>
            A component failed to render. You can try reloading the page to resolve the issue.
          </p>
          <button 
            className="btn btn-outline" 
            onClick={() => window.location.reload()}
            style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          >
            <RotateCcw size={16} /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
