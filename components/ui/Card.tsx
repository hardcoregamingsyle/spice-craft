import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  border?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', border = 'border-amber-800/40' }) => {
  return (
    <div className={`bg-gradient-to-br from-[#111827] via-[#101a30] to-[#0c111f] p-6 rounded-xl shadow-lg shadow-black/30 border ${border} ${className} shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`}>
      {children}
    </div>
  );
};