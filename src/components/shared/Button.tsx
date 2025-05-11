// src/components/shared/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'default';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  icon,
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full-width' : '';
  
  const combinedClasses = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button className={combinedClasses} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};







