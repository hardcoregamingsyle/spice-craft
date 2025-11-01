import React from 'react';
import { FlavorProfile, Flavor } from '../types';
import { Card } from './ui/Card';

interface FlavorMetersProps {
  currentProfile: FlavorProfile;
  targetProfile: FlavorProfile;
}

const flavorColors: { [key in Flavor]: { base: string; glow: string } } = {
  [Flavor.HEAT]: { base: 'bg-red-500', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.7)]' },
  [Flavor.EARTHY]: { base: 'bg-yellow-700', glow: 'shadow-[0_0_8px_rgba(180,83,9,0.7)]' },
  [Flavor.SWEET]: { base: 'bg-pink-500', glow: 'shadow-[0_0_8px_rgba(236,72,153,0.7)]' },
  [Flavor.TANGY]: { base: 'bg-green-500', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.7)]' },
  [Flavor.AROMATIC]: { base: 'bg-purple-500', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.7)]' },
};

const FlavorMeter: React.FC<{ flavor: Flavor, value: number, target: number }> = ({ flavor, value, target }) => {
    const MAX_VALUE = 150; // Allow for overshooting the target visually
    const width = Math.min((value / MAX_VALUE) * 100, 100);
    const targetPos = Math.min((target / MAX_VALUE) * 100, 100);
    const colors = flavorColors[flavor];

    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-bold text-amber-200">{flavor}</span>
                <span className="font-mono text-gray-400">{value}</span>
            </div>
            <div className="w-full bg-black/30 backdrop-blur-sm rounded-full h-5 p-0.5 relative border border-gray-700 shadow-inner">
                <div
                    className={`${colors.base} ${colors.glow} h-full rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${width}%` }}
                ></div>
                <div 
                    className="absolute -top-0.5 h-6 w-1 bg-white/70 rounded-full shadow-[0_0_6px_1px_rgba(255,255,255,0.5)]"
                    style={{ left: `calc(${targetPos}% - 2px)` }}
                    title={`Target: ${target}`}
                >
                    <div className="w-full h-full bg-white/50 rounded-full blur-[1px]"></div>
                </div>
            </div>
        </div>
    );
};


export const FlavorMeters: React.FC<FlavorMetersProps> = ({ currentProfile, targetProfile }) => {
  return (
    <Card>
      <h3 className="text-xl font-cinzel text-amber-300 mb-4 text-center">Flavor Essences</h3>
      <div className="space-y-4">
        {Object.keys(currentProfile).map(key => {
            const flavorKey = key as Flavor;
            return (
              <FlavorMeter 
                key={flavorKey} 
                flavor={flavorKey} 
                value={currentProfile[flavorKey]}
                target={targetProfile[flavorKey]}
              />
            )
        })}
      </div>
    </Card>
  );
};