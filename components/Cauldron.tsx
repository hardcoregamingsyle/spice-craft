import React from 'react';
import { SelectedSpice } from '../types';
import { Card } from './ui/Card';

interface CauldronProps {
  selectedSpices: SelectedSpice[];
  onRemoveSpice: (spiceId: string) => void;
}

export const Cauldron: React.FC<CauldronProps> = ({ selectedSpices, onRemoveSpice }) => {
  return (
    <Card>
        <h3 className="text-xl font-cinzel text-amber-300 mb-4 text-center">Divine Cauldron</h3>
        <div className="space-y-2 min-h-[100px]">
            {selectedSpices.length === 0 && (
                <p className="text-center text-gray-400 italic pt-6">The cauldron awaits your touch...</p>
            )}
            {selectedSpices.map(spice => (
                <div key={spice.id} className="flex justify-between items-center p-2 bg-black/20 rounded-md animate-fade-in">
                    <span className="text-amber-200">{spice.name}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-amber-900/50 px-2 py-0.5 rounded">x{spice.quantity}</span>
                        <button onClick={() => onRemoveSpice(spice.id)} className="text-red-400 hover:text-red-300 text-xs w-6 h-6 flex items-center justify-center rounded-full bg-red-900/50 hover:bg-red-900/80 transition-colors font-bold">
                            -
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </Card>
  );
};