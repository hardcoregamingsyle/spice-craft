import React, { useState, useMemo, useCallback } from 'react';
import { SPICES } from '../constants';
import { Challenge, SelectedSpice, OracleJudgement, FlavorProfile, Flavor } from '../types';
import { getJudgementFromOracle } from '../services/geminiService';

import { SpiceRack } from './SpiceRack';
import { Cauldron } from './Cauldron';
import { FlavorMeters } from './FlavorMeters';
import { OracleResponse } from './OracleResponse';
import { Loader } from './Loader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Celebration } from './Celebration';

const initialFlavorProfile: FlavorProfile = {
  [Flavor.HEAT]: 0,
  [Flavor.EARTHY]: 0,
  [Flavor.SWEET]: 0,
  [Flavor.TANGY]: 0,
  [Flavor.AROMATIC]: 0,
};

interface GameScreenProps {
  challenge: Challenge;
  onNextChallenge: () => void;
  onNewGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ challenge, onNextChallenge, onNewGame }) => {
  const [selectedSpices, setSelectedSpices] = useState<SelectedSpice[]>([]);
  const [judgement, setJudgement] = useState<OracleJudgement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentFlavorProfile = useMemo((): FlavorProfile => {
    return selectedSpices.reduce((acc, selectedSpice) => {
      const spiceData = SPICES.find(s => s.id === selectedSpice.id);
      if (!spiceData) return acc;

      const newProfile = { ...acc };
      for (const key in spiceData.flavorProfile) {
        const flavorKey = key as Flavor;
        newProfile[flavorKey] += spiceData.flavorProfile[flavorKey] * selectedSpice.quantity;
      }
      return newProfile;
    }, { ...initialFlavorProfile });
  }, [selectedSpices]);

  const addSpice = useCallback((spiceId: string) => {
    setSelectedSpices(prevSpices => {
      const existingSpice = prevSpices.find(s => s.id === spiceId);
      if (existingSpice) {
        return prevSpices.map(s =>
          s.id === spiceId ? { ...s, quantity: s.quantity + 1 } : s
        );
      }
      const spiceData = SPICES.find(s => s.id === spiceId);
      return [...prevSpices, { id: spiceId, name: spiceData?.name || '', quantity: 1 }];
    });
  }, []);
  
  const removeSpice = useCallback((spiceId: string) => {
    setSelectedSpices(prevSpices => {
      const existingSpice = prevSpices.find(s => s.id === spiceId);
      if (existingSpice && existingSpice.quantity > 1) {
        return prevSpices.map(s => 
          s.id === spiceId ? { ...s, quantity: s.quantity - 1 } : s
        );
      }
      return prevSpices.filter(s => s.id !== spiceId);
    });
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setJudgement(null);
    const result = await getJudgementFromOracle(challenge, selectedSpices);
    setJudgement(result);
    setIsLoading(false);

    if (result.score === 10) {
      setShowCelebration(true);
    }
  };

  const handleNext = () => {
    setSelectedSpices([]);
    setJudgement(null);
    setShowCelebration(false);
    onNextChallenge();
  };
  
  const resetChallenge = () => {
    setSelectedSpices([]);
    setJudgement(null);
    setShowCelebration(false);
  }

  return (
    <div className="animate-fade-in-slow">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <span className="text-sm font-semibold bg-[var(--color-primary)] text-white px-3 py-1 rounded-full">{challenge.region} India</span>
            <h2 className="text-2xl font-header mt-3 mb-2">{challenge.title}</h2>
            <p className="text-[var(--color-text-body)]">{challenge.description}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">Base: <span className="italic text-[var(--color-text-body)]">{challenge.base}</span></p>
          </Card>
          <SpiceRack onSpiceSelect={addSpice} disabled={!!judgement} />
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
            <Cauldron selectedSpices={selectedSpices} onRemoveSpice={removeSpice}/>
            <FlavorMeters currentProfile={currentFlavorProfile} targetProfile={challenge.targetProfile} />
        </aside>
      </div>
      
      {/* Action Buttons */}
      <div className="text-center pt-8 h-14">
        {judgement ? (
            <div className="flex items-center justify-center gap-4 animate-fade-in">
              <Button onClick={handleNext}>
                Next Challenge
              </Button>
               <Button onClick={onNewGame} variant="secondary">
                New Game
              </Button>
            </div>
        ) : (
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <Button onClick={handleSubmit} disabled={isLoading || selectedSpices.length === 0}>
                {isLoading ? 'Consulting...' : 'Present to the Oracle'}
            </Button>
            <Button onClick={resetChallenge} variant="secondary" disabled={isLoading || selectedSpices.length === 0}>
                Empty Cauldron
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loader />}
      {judgement && !isLoading && <OracleResponse judgement={judgement} />}
      {showCelebration && <Celebration onComplete={() => setShowCelebration(false)} />}
    </div>
  );
};