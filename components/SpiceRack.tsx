import React from 'react';
import { SPICES } from '../constants';

interface SpiceRackProps {
  onSpiceSelect: (spiceId: string) => void;
  disabled: boolean;
}

export const SpiceRack: React.FC<SpiceRackProps> = ({ onSpiceSelect, disabled }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-[var(--color-border)] border-dashed">
      <div className="text-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m5 11v4m-2-2h4M12 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
        <h3 className="text-lg font-header mt-2">Add Spices to your Cauldron</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Click to discover new flavors.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {SPICES.map(spice => (
          <button
            key={spice.id}
            onClick={() => onSpiceSelect(spice.id)}
            disabled={disabled}
            className="group flex flex-col items-center justify-start p-3 bg-[var(--color-surface)] rounded-lg border-2 border-[var(--color-border)] transition-all duration-200 ease-in-out transform hover:border-[var(--color-primary)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:transform-none disabled:bg-gray-50 disabled:border-[var(--color-border)]"
            title={disabled ? undefined : spice.description}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <spice.icon className="w-10 h-10 text-gray-500 transition-colors duration-200" />
            </div>
            <p className="mt-2 font-semibold text-center text-sm text-[var(--color-text-header)] transition-colors duration-200">{spice.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};