/**
 * Button Component - Simple UI Component
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transform-gpu transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none ring-offset-background';
    
    const variants = {
      default: 'border border-primary/30 bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
      destructive: 'border border-destructive/40 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground shadow-md shadow-destructive/20 hover:shadow-lg hover:shadow-destructive/30',
      outline: 'border border-primary/30 bg-gradient-to-r from-background to-accent/60 text-foreground shadow-sm hover:shadow-md hover:text-accent-foreground',
      secondary: 'border border-secondary/30 bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30',
      ghost: 'border border-transparent bg-transparent hover:border-primary/20 hover:bg-gradient-to-r hover:from-accent hover:to-accent/70 hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary'
    };

    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10'
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
