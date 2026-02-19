import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { skeletonVariants } from '../../../lib/animations';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'button' | 'image';
  count?: number;
}

export function Skeleton({ className, variant = 'text', count = 1 }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full',
    button: 'h-10 w-32',
    image: 'h-64 w-full',
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, index) => (
        <div key={index} className="relative overflow-hidden">
          <motion.div
            className={cn(
              'bg-muted rounded-lg',
              variantClasses[variant],
              className
            )}
            variants={skeletonVariants}
            animate="visible"
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 shimmer rounded-lg"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      ))}
    </>
  );
}

// Preset Components
export function SkeletonCard() {
  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 shadow-xl rounded-2xl p-4 space-y-3">
      <Skeleton variant="avatar" />
      <Skeleton variant="title" />
      <Skeleton variant="text" count={3} />
      <Skeleton variant="button" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
