import React from 'react';
import { theme } from '@/lib/marketingTheme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClasses = "px-6 py-3 text-sm inline-flex items-center justify-center gap-2";
  const variantClasses = theme.buttons[variant];
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
