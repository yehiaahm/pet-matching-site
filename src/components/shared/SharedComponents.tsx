import React from 'react';
import { Loader2 } from 'lucide-react';
import { theme } from '../../theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const SharedButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transform-gpu transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none';
  
  const variantClasses = {
    primary: `border border-blue-500/40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30`,
    secondary: 'border border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-md shadow-gray-300/30 hover:shadow-lg hover:shadow-gray-300/40',
    outline: 'border border-blue-300 bg-gradient-to-r from-white to-blue-50 text-gray-900 shadow-sm hover:shadow-md',
    ghost: 'border border-transparent bg-transparent hover:border-blue-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50',
    destructive: 'border border-red-500/40 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30',
  };

  const sizeClasses = {
    sm: theme.components.button.padding.sm,
    md: theme.components.button.padding.md,
    lg: theme.components.button.padding.lg,
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;

  const iconElement = icon && (
    <span className={iconPosition === 'left' ? 'mr-2' : 'ml-2'}>
      {icon}
    </span>
  );

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && iconPosition === 'left' && iconElement}
      {children}
      {!loading && iconPosition === 'right' && iconElement}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const SharedCard: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default',
}) => {
  const baseClasses = 'rounded-lg';
  
  const variantClasses = {
    default: 'bg-white',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-sm border border-gray-100',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className || ''}`;

  return <div className={classes}>{children}</div>;
};

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SharedCardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={`flex items-center justify-between space-y-0 pb-4 ${className || ''}`}>
      <div>
        <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SharedCardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return <div className={`pt-0 ${className || ''}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SharedCardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return <div className={`flex items-center pt-4 ${className || ''}`}>{children}</div>;
};
