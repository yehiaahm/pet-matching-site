// ErrorBoundary: catches unexpected runtime errors and prevents a white screen
// WHY: A top-level error boundary ensures the app shows a fallback UI instead of crashing silently.
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // WHY: Updating state here triggers the fallback UI on the next render.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // WHY: Logging the error helps debugging console issues causing white screens.
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
    
    this.setState({ errorInfo: info });
    
    // Call custom error handler if provided
    this.props.onError?.(error, info);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, info);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Send error to logging service (e.g., Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    // WHY: Full reload gives users a recovery path after a fatal error.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-red-900">
                      حدث خطأ غير متوقع
                    </h3>
                    <p className="text-sm text-red-700">
                      نعتذر عن هذا الإزعاج. يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة.
                    </p>
                  </div>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-4 text-left">
                      <summary className="cursor-pointer text-sm font-mono text-red-600 hover:text-red-800">
                        تفاصيل الخطأ (للمطورين)
                      </summary>
                      <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                        <div className="font-bold">Error:</div>
                        <div>{this.state.error.message}</div>
                        {this.state.error.stack && (
                          <>
                            <div className="font-bold mt-2">Stack:</div>
                            <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                          </>
                        )}
                      </div>
                    </details>
                  )}

                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={this.handleRetry}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      إعادة المحاولة
                    </Button>
                    <Button
                      onClick={this.handleReload}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      إعادة تحميل الصفحة
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured by useErrorHandler:', error);
    setError(error);
  }, []);

  return { error, resetError, captureError };
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
