import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex min-h-screen items-center justify-center p-4"
          style={{ backgroundColor: 'var(--primary-background-color)' }}
        >
          <div className="max-w-md text-center">
            <h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
              Something went wrong
            </h1>
            <p
              className="mt-4"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'var(--text-color-on-primary)',
                borderRadius: 'var(--border-radius-medium)',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
