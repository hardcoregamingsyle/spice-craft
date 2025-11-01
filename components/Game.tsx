import React, { useState, useCallback, useEffect } from 'react';
import { GameScreen } from './GameScreen';
import { RegionSelector } from './RegionSelector';
import { Loader } from './Loader';
import { Challenge } from '../types';
import { generateChallenge } from '../services/geminiService';
// Fix: Import the Button component to resolve reference errors.
import { Button } from './ui/Button';

type GameState = 'selecting_region' | 'generating_challenge' | 'playing' | 'error';

export const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('selecting_region');
    const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
    const [currentRegion, setCurrentRegion] = useState<string | null>(null);

    const fetchNewChallenge = useCallback(async (region: string) => {
        setGameState('generating_challenge');
        try {
            const challenge = await generateChallenge(region);
            setCurrentChallenge(challenge);
            setGameState('playing');
        } catch (e) {
            console.error(e);
            setGameState('error');
        }
    }, []);

    const handleRegionSelect = useCallback((region: string) => {
        setCurrentRegion(region);
        fetchNewChallenge(region);
    }, [fetchNewChallenge]);
    
    const handleNextChallenge = useCallback(() => {
        if(currentRegion) {
            fetchNewChallenge(currentRegion);
        }
    }, [currentRegion, fetchNewChallenge]);
    
    const startNewGame = useCallback(() => {
       if (window.confirm("Are you sure you want to start a new game?")) {
            setCurrentChallenge(null);
            setCurrentRegion(null);
            setGameState('selecting_region');
       }
    }, []);

    const renderGameState = () => {
        switch(gameState) {
            case 'selecting_region':
                return <RegionSelector onSelect={handleRegionSelect} />;
            case 'generating_challenge':
                return <Loader message="Generating a new culinary challenge..." />;
            case 'playing':
                if (currentChallenge) {
                    return <GameScreen challenge={currentChallenge} onNextChallenge={handleNextChallenge} onNewGame={startNewGame} />;
                }
                return <div>Error: Challenge not loaded.</div>; // Should not happen
            case 'error':
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-header text-red-600">An Error Occurred</h2>
                        <p>Could not generate a new challenge. Please try again.</p>
                        {/* Fix: Use Button component for UI consistency. */}
                        <Button onClick={startNewGame}>Try Again</Button>
                    </div>
                );
        }
    }

    return (
        <>
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[var(--color-border)]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M19.3,4.12a1,1,0,0,0-1.1-1.53,10.1,10.1,0,0,0-3.1,1.88,10,10,0,0,0-5.78,0,10.1,10.1,0,0,0-3.1-1.88A1,1,0,0,0,5.1,3.2a1,1,0,0,0-.22,1,9.88,9.88,0,0,0,1.9,3.4,1,1,0,0,0,.7.3,1,1,0,0,0,.71-.3,7.77,7.77,0,0,1,5.2,0,1,1,0,0,0,.71.3,1,1,0,0,0,.7-.3A9.88,9.88,0,0,0,19,4.2,1,1,0,0,0,19.3,4.12ZM10,12a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V13A1,1,0,0,0,10,12Zm0-4a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V9A1,1,0,0,0,10,8Zm5.71.29a.92.92,0,0,0-.11-.14,8,8,0,0,0-11.2,0,.92.92,0,0,0-.11.14.94.94,0,0,0,0,1.42A6,6,0,0,1,10,11a6,6,0,0,1,5.71-1.29A.94.94,0,0,0,15.71,8.29Z"/>
                            </svg>
                            <h1 className="text-xl font-header">Spice Jadoo</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button onClick={startNewGame} variant="secondary">
                                New Game
                            </Button>
                            <Button onClick={() => alert('Save feature coming soon!')}>
                                Save Game
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {renderGameState()}
            </main>
        </>
    );
};