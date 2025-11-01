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
        <h3 className="text-lg font-header mb-4">Your Ingredients</h3>
        <div className="space-y-2 min-h-[150px] bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)]">
            {selectedSpices.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)] pt-8">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <p className="text-sm">Your cauldron is empty.</p>
                </div>
            )}
            {selectedSpices.map(spice => (
                <div key={spice.id} className="flex justify-between items-center p-2 bg-white rounded-md animate-fade-in border border-gray-200">
                    <span className="font-semibold text-sm text-[var(--color-text-body)]">{spice.name}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">x{spice.quantity}</span>
                        <button 
                          onClick={() => onRemoveSpice(spice.id)} 
                          className="text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 transition-all duration-200"
                          title="Remove one part"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </Card>
  );
};