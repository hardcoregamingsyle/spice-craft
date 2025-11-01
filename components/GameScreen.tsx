import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CHALLENGES, SPICES } from '../constants';
import { Challenge, SelectedSpice, OracleJudgement, FlavorProfile, Flavor } from '../types';
import { getJudgementFromOracle } from '../services/geminiService';

import { SpiceRack } from './SpiceRack';
import { Cauldron } from './Cauldron';
import { FlavorMeters } from './FlavorMeters';
import { OracleResponse } from './OracleResponse';
import { Loader } from './Loader';
import { Tutorial } from './Tutorial';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const initialFlavorProfile: FlavorProfile = {
  [Flavor.HEAT]: 0,
  [Flavor.EARTHY]: 0,
  [Flavor.SWEET]: 0,
  [Flavor.TANGY]: 0,
  [Flavor.AROMATIC]: 0,
};

interface GameScreenProps {
  onPlayAgain: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onPlayAgain }) => {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedSpices, setSelectedSpices] = useState<SelectedSpice[]>([]);
  const [judgement, setJudgement] = useState<OracleJudgement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('spiceSovereignTutorialSeen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('spiceSovereignTutorialSeen', 'true');
    setShowTutorial(false);
  };

  const currentChallenge = CHALLENGES[challengeIndex];
  const isLastChallenge = challengeIndex === CHALLENGES.length - 1;

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
    const result = await getJudgementFromOracle(currentChallenge, selectedSpices);
    setJudgement(result);
    setIsLoading(false);
  };

  const handleNextChallenge = () => {
    if (!isLastChallenge) {
      setChallengeIndex((prevIndex) => prevIndex + 1);
      setSelectedSpices([]);
      setJudgement(null);
    } else {
      onPlayAgain();
    }
  };
  
  const resetChallenge = () => {
    setSelectedSpices([]);
    setJudgement(null);
  }

  return (
    <>
    {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
    <div className="space-y-8 animate-fade-in-slow">
      <Card>
        <h2 className="text-2xl font-cinzel text-amber-300 mb-2">Challenge {challengeIndex + 1}: {currentChallenge.title}</h2>
        <p className="text-gray-300">{currentChallenge.description}</p>
        <p className="text-sm text-gray-400 mt-2">Base: <span className="italic">{currentChallenge.base}</span></p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <SpiceRack onSpiceSelect={addSpice} disabled={!!judgement} />
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Cauldron selectedSpices={selectedSpices} onRemoveSpice={removeSpice}/>
            <FlavorMeters currentProfile={currentFlavorProfile} targetProfile={currentChallenge.targetProfile} />
        </div>
      </div>
      
      <div className="text-center mt-8 h-12">
        {judgement ? (
            <Button onClick={handleNextChallenge} className="animate-fade-in">
              {isLastChallenge ? 'Play Again' : 'Next Divine Challenge'}
            </Button>
        ) : (
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <Button onClick={handleSubmit} disabled={isLoading || selectedSpices.length === 0}>
                {isLoading ? 'Awaiting...' : 'Present to the Oracle'}
            </Button>
            <Button onClick={resetChallenge} variant="secondary" disabled={isLoading || selectedSpices.length === 0}>
                Clear Cauldron
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loader />}
      {judgement && !isLoading && <OracleResponse judgement={judgement} />}
    </div>
    </>
  );
};