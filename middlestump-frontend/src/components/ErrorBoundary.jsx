import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 overflow-auto h-full max-w-full" style={{ padding: '2rem', backgroundColor: '#fef2f2', color: '#7f1d1d' }}>
          <h1 className="text-2xl font-bold mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Dashboard Crash Report</h1>
          <p className="font-mono text-sm whitespace-pre-wrap" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</p>
          <pre className="mt-4 font-mono text-xs opacity-70 whitespace-pre-wrap break-all" style={{ marginTop: '1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error?.stack}</pre>
          <pre className="mt-4 font-mono text-xs opacity-70 whitespace-pre-wrap break-all" style={{ marginTop: '1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.errorInfo?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
