/**
 * Modern Animated Button Component
 * Production-Ready Interactive Buttons
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { buttonVariants } from '../../../lib/animations';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  animated?: boolean;
  glow?: boolean;
  className?: string;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  animated = true,
  glow = false,
  className,
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border-2 border-border bg-transparent hover:bg-muted',
    ghost: 'bg-transparent hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    gradient: 'bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 text-white shadow-lg hover:shadow-xl hover:from-teal-700 hover:via-teal-600 hover:to-teal-500 transform hover:scale-105 transition-all duration-300 border border-teal-400/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    icon: 'p-3',
  };

  const Component = animated ? motion.button : 'button';
  const motionProps: Partial<MotionProps> = animated
    ? {
        variants: buttonVariants,
        initial: 'initial',
        whileHover: disabled || isLoading ? undefined : 'hover',
        whileTap: disabled || isLoading ? undefined : 'tap',
        onDrag: undefined,
      }
    : {};

  return (
    <Component
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'rounded-xl font-bold transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'backdrop-blur-sm',
        variantClasses[variant],
        sizeClasses[size],
        glow && 'shadow-glow',
        className
      )}
      disabled={disabled || isLoading}
      {...motionProps}
      {...(props as any)}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">جاري التحميل...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          <span className="font-bold">{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </Component>
  );
};

// ============================================
// BUTTON VARIATIONS
// ============================================

export const PrimaryButton: React.FC<Omit<ModernButtonProps, 'variant'>> = (props) => (
  <ModernButton {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ModernButtonProps, 'variant'>> = (props) => (
  <ModernButton {...props} variant="secondary" />
);

export const GradientButton: React.FC<Omit<ModernButtonProps, 'variant'>> = (props) => (
  <ModernButton {...props} variant="gradient" glow />
);

export const OutlineButton: React.FC<Omit<ModernButtonProps, 'variant'>> = (props) => (
  <ModernButton {...props} variant="outline" />
);

export const GhostButton: React.FC<Omit<ModernButtonProps, 'variant'>> = (props) => (
  <ModernButton {...props} variant="ghost" />
);

export const DestructiveButton: React.FC<Omit<ModernButtonProps, 'variant'>> = (props) => (
  <ModernButton {...props} variant="destructive" />
);

// ============================================
// ICON BUTTON
// ============================================

interface IconButtonProps extends Omit<ModernButtonProps, 'children' | 'size'> {
  icon: LucideIcon;
  label?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  ...props
}) => (
  <ModernButton {...props} size="icon" aria-label={label}>
    <Icon className="w-5 h-5" />
  </ModernButton>
);
