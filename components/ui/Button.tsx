import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = "px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100";
  
  const variantClasses = {
    primary: 'bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-sm hover:bg-[var(--color-primary-dark)] hover:-translate-y-px focus:ring-[var(--color-primary)] active:translate-y-0',
    secondary: 'bg-white border border-gray-300 text-[var(--color-text-body)] hover:bg-gray-50 focus:ring-[var(--color-primary)] active:scale-95',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};