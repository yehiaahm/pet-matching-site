/**
 * Modern Error State Component
 * User-Friendly Error Display
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { cn } from '../../utils/cn';
import { scaleUpVariants } from '../../../lib/animations';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'حدث خطأ ما',
  message = 'نعتذر، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  error,
  onRetry,
  onGoHome,
  className,
  showDetails = false,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
      variants={scaleUpVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mb-6 p-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20"
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
      >
        <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" strokeWidth={1.5} />
      </motion.div>

      <h3 className="text-2xl font-bold mb-2 text-foreground">
        {title}
      </h3>

      <p className="text-muted-foreground max-w-md mb-6">
        {message}
      </p>

      {showDetails && errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg max-w-md">
          <p className="text-sm text-red-600 dark:text-red-400 font-mono text-left">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {onRetry && (
          <motion.button
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white shadow-lg"
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
            حاول مرة أخرى
          </motion.button>
        )}

        {onGoHome && (
          <motion.button
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border bg-background text-foreground"
            onClick={onGoHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// ERROR BOUNDARY WRAPPER
// ============================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          error={this.state.error}
          onRetry={() => {
            this.setState({ hasError: false, error: undefined });
            window.location.reload();
          }}
          onGoHome={() => {
            window.location.href = '/';
          }}
          showDetails={true}
        />
      );
    }

    return this.props.children;
  }
}
