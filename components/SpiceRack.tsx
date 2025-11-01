import React from 'react';
import { SPICES } from '../constants';
import { Card } from './ui/Card';

interface SpiceRackProps {
  onSpiceSelect: (spiceId: string) => void;
  disabled: boolean;
}

export const SpiceRack: React.FC<SpiceRackProps> = ({ onSpiceSelect, disabled }) => {
  return (
    <Card className="h-full">
      <h3 className="text-xl font-cinzel text-amber-300 mb-4 text-center">The Altar of Spices</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {SPICES.map(spice => (
          <button
            key={spice.id}
            onClick={() => onSpiceSelect(spice.id)}
            disabled={disabled}
            className="group relative p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-amber-800/30 hover:bg-amber-900/50 hover:border-amber-500 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:transform-none"
            title={disabled ? undefined : `Add ${spice.name}`}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <spice.icon className="w-12 h-12 text-amber-400 group-hover:text-amber-200 transition-colors" />
              <p className="mt-2 font-bold text-amber-200">{spice.name}</p>
              <p className="text-xs text-amber-200/70 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity">{spice.description}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};