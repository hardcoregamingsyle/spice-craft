import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SPICES, EMPTY_PROFILE } from '../constants';
import { Challenge, SelectedSpice, OracleJudgement, FlavorProfile, Flavor } from '../types';
import { getJudgementFromOracle } from '../services/geminiService';
import { audioService, AudioState } from '../services/audioService';

import { SpiceRack } from './SpiceRack';
import { Cauldron } from './Cauldron';
import { FlavorMeters } from './FlavorMeters';
import { OracleResponse } from './OracleResponse';
import { Loader } from './Loader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Celebration } from './Celebration';
import { SpeakerIcon, StopIcon, AudioSpinner } from './ui/AudioIcons';

interface GameScreenProps {
  challenge: Challenge;
  onNextChallenge: () => void;
  challengeAudio: string | null;
}

export const GameScreen: React.FC<GameScreenProps> = ({ challenge, onNextChallenge, challengeAudio }) => {
  const [selectedSpices, setSelectedSpices] = useState<SelectedSpice[]>([]);
  const [isConsultingOracle, setIsConsultingOracle] = useState(false);
  const [oracleJudgement, setOracleJudgement] = useState<OracleJudgement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({ status: 'idle', textIdentifier: null });
  const challengeIdentifier = `challenge-${challenge.id}`;

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setAudioState);
    // Fix: The cleanup function from useEffect must return void.
    // The `unsubscribe()` function returned from `audioService.subscribe` was returning
    // a boolean from `Set.delete()`, which is an invalid return type for a cleanup function.
    // This wraps the call in a new function that returns void.
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setSelectedSpices([]);
    setOracleJudgement(null);
    setShowCelebration(false);
    setIsConsultingOracle(false);

    if (challengeAudio) {
        audioService.play(challengeAudio, challengeIdentifier).catch(e => console.log("Challenge audio playback interrupted."));
    }

    return () => {
        if (audioService.getCurrentState().textIdentifier === challengeIdentifier) {
            audioService.stop();
        }
    };
  }, [challenge, challengeAudio, challengeIdentifier]);

  const currentProfile = useMemo((): FlavorProfile => {
    const newProfile: FlavorProfile = { ...EMPTY_PROFILE };
    selectedSpices.forEach(selected => {
      const spiceData = SPICES.find(s => s.id === selected.id);
      if (spiceData) {
        Object.values(Flavor).forEach(flavorKey => {
          newProfile[flavorKey] += spiceData.flavorProfile[flavorKey] * selected.quantity;
        });
      }
    });
    return newProfile;
  }, [selectedSpices]);

  const handleSpiceSelect = useCallback((spiceId: string) => {
    setSelectedSpices(prevSpices => {
      const existingSpice = prevSpices.find(s => s.id === spiceId);
      const spiceInfo = SPICES.find(s => s.id === spiceId);
      if (!spiceInfo) return prevSpices;
      if (existingSpice) {
        return prevSpices.map(s => s.id === spiceId ? { ...s, quantity: s.quantity + 1 } : s);
      } else {
        return [...prevSpices, { id: spiceId, name: spiceInfo.name, quantity: 1 }];
      }
    });
  }, []);

  const handleRemoveSpice = useCallback((spiceId: string) => {
    setSelectedSpices(prevSpices => {
      const existingSpice = prevSpices.find(s => s.id === spiceId);
      if (!existingSpice) return prevSpices;
      if (existingSpice.quantity > 1) {
        return prevSpices.map(s => s.id === spiceId ? { ...s, quantity: s.quantity - 1 } : s);
      } else {
        return prevSpices.filter(s => s.id !== spiceId);
      }
    });
  }, []);

  const handleClearCauldron = useCallback(() => {
    setSelectedSpices([]);
  }, []);

  const handleSubmitToOracle = async () => {
    if (selectedSpices.length === 0) return;
    setIsConsultingOracle(true);
    const judgement = await getJudgementFromOracle(challenge, selectedSpices);
    setOracleJudgement(judgement);
    if (judgement.score === 10) {
      setShowCelebration(true);
    }
    setIsConsultingOracle(false);
  };

  const handleCloseOracleResponse = () => {
    onNextChallenge();
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  const handlePlayChallengeAudio = () => {
    const isPlayingThis = audioState.status === 'playing' && audioState.textIdentifier === challengeIdentifier;
    if (isPlayingThis) {
        audioService.stop();
    } else if (challengeAudio) {
        audioService.play(challengeAudio, challengeIdentifier).catch(() => {});
    }
  };

  const isChallengeAudioPlaying = audioState.status === 'playing' && audioState.textIdentifier === challengeIdentifier;
  const isChallengeAudioLoading = audioState.status === 'loading' && audioState.textIdentifier === challengeIdentifier;

  return (
    <>
      {isConsultingOracle && <Loader />}
      {showCelebration && <Celebration onComplete={handleCelebrationComplete} />}
      {oracleJudgement && <OracleResponse judgement={oracleJudgement} onClose={handleCloseOracleResponse} />}

      <div className="main-grid" style={{ all: 'unset', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>
          <div className="flex flex-col gap-5">
              <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>Challenge: {challenge.region}</div>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{challenge.title}</h2>
                    </div>
                    {challengeAudio && (
                      <button 
                        onClick={handlePlayChallengeAudio} 
                        className="p-1.5 rounded-full hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title={isChallengeAudioPlaying ? "Stop" : "Hear the challenge"}
                      >
                        {isChallengeAudioLoading ? <AudioSpinner /> : isChallengeAudioPlaying ? <StopIcon /> : <SpeakerIcon />}
                      </button>
                    )}
                  </div>
                  <p style={{ marginTop: 8 }}>{challenge.description}</p>
                  <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
                      <strong>Base:</strong> {challenge.base}
                  </p>
              </Card>
              <SpiceRack onSpiceSelect={handleSpiceSelect} disabled={isConsultingOracle || !!oracleJudgement} />
          </div>

          <div className="flex flex-col gap-5">
              <Cauldron selectedSpices={selectedSpices} onRemoveSpice={handleRemoveSpice} />
              <FlavorMeters currentProfile={currentProfile} targetProfile={challenge.targetProfile} />
              
              <div className="flex flex-col gap-2">
                  <Button 
                      onClick={handleSubmitToOracle}
                      disabled={selectedSpices.length === 0 || isConsultingOracle || !!oracleJudgement}
                  >
                      Consult the Oracle
                  </Button>
                  <Button 
                      variant="secondary"
                      onClick={handleClearCauldron}
                      disabled={selectedSpices.length === 0 || isConsultingOracle || !!oracleJudgement}
                  >
                      Clear Cauldron
                  </Button>
              </div>
          </div>
      </div>
    </>
  );
};
