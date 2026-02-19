/**
 * Modern Animated Card Component
 * Production-Ready Interactive Cards
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';
import { cardVariants } from '../../../lib/animations';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hoverable?: boolean;
  clickable?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  variant = 'default',
  hoverable = true,
  clickable = false,
  animated = true,
  onClick,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-card border border-border shadow-md',
    glass: 'backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 shadow-xl rounded-2xl',
    gradient: 'gradient-card',
    outline: 'border-2 border-border bg-transparent',
  };

  const Component = animated ? motion.div : 'div';
  const motionProps: Partial<MotionProps> = animated
    ? {
        variants: cardVariants,
        initial: 'hidden',
        animate: 'visible',
        whileHover: hoverable ? 'hover' : undefined,
        whileTap: clickable ? 'tap' : undefined,
      }
    : {};

  return (
    <Component
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variantClasses[variant],
        hoverable && 'hover:shadow-xl',
        clickable && 'cursor-pointer active:scale-95',
        className
      )}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// CARD VARIATIONS
// ============================================

export const GlassCard: React.FC<Omit<AnimatedCardProps, 'variant'>> = (props) => (
  <AnimatedCard {...props} variant="glass" />
);

export const GradientCard: React.FC<Omit<AnimatedCardProps, 'variant'>> = (props) => (
  <AnimatedCard {...props} variant="gradient" />
);

export const OutlineCard: React.FC<Omit<AnimatedCardProps, 'variant'>> = (props) => (
  <AnimatedCard {...props} variant="outline" />
);
