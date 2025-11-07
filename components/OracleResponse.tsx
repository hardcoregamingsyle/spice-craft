import React, { useState, useEffect } from 'react';
import { OracleJudgement } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { audioService, AudioState } from '../services/audioService';
import { SpeakerIcon, StopIcon, AudioSpinner } from './ui/AudioIcons';
import { generateSpeechFromText } from '../services/geminiService';
import { Loader } from './Loader';

interface OracleResponseProps {
  judgement: OracleJudgement;
  onClose: () => void;
}

export const OracleResponse: React.FC<OracleResponseProps> = ({ judgement, onClose }) => {
  const scoreColor = judgement.score >= 8 ? 'text-green-600' : judgement.score >= 5 ? 'text-amber-600' : 'text-red-600';
  
  const [stage, setStage] = useState<'preparing' | 'playing_vision' | 'playing_wisdom' | 'complete'>('preparing');
  const [visionAudio, setVisionAudio] = useState<string | null>(null);
  const [wisdomAudio, setWisdomAudio] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ status: 'idle', textIdentifier: null });

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setAudioState);
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const playSequence = async () => {
      // 1. Generate vision audio while in "preparing" stage
      const visionAudioData = await generateSpeechFromText(judgement.description);
      if (isCancelled) return;
      if (!visionAudioData) {
        console.error("Failed to generate vision audio.");
        setStage('complete'); // Show all content on failure
        return;
      }
      setVisionAudio(visionAudioData);

      // 2. Start generating wisdom audio in the background
      const wisdomAudioPromise = generateSpeechFromText(judgement.feedback);

      // 3. Move to vision stage and play audio
      setStage('playing_vision');
      try {
        await audioService.play(visionAudioData, 'oracle-vision');
      } catch (e) {
        console.log("Vision audio playback interrupted.");
      }
      if (isCancelled) return;

      // 4. Get the wisdom audio result
      const wisdomAudioData = await wisdomAudioPromise;
      if (isCancelled) return;
      if (!wisdomAudioData) {
        console.error("Failed to generate wisdom audio.");
        setStage('complete'); // Show all content on failure
        return;
      }
      setWisdomAudio(wisdomAudioData);

      // 5. Move to wisdom stage and play audio
      setStage('playing_wisdom');
      try {
        await audioService.play(wisdomAudioData, 'oracle-wisdom');
      } catch (e) {
        console.log("Wisdom audio playback interrupted.");
      }
      if (isCancelled) return;
      
      setStage('complete');
    };

    playSequence();

    return () => {
      isCancelled = true;
      audioService.stop();
    };
  }, [judgement]);

  const PlayAudioButton: React.FC<{ text: string, audioData: string | null, sectionIdentifier: string }> = ({ text, audioData, sectionIdentifier }) => {
    const isLoading = audioState.status === 'loading' && audioState.textIdentifier === sectionIdentifier;
    const isPlaying = audioState.status === 'playing' && audioState.textIdentifier === sectionIdentifier;
    const isDisabled = audioState.status !== 'idle' && !isPlaying && !isLoading;

    const handleClick = () => {
        if (isPlaying) {
            audioService.stop();
        } else if (audioData) {
            audioService.play(audioData, sectionIdentifier).catch(() => {});
        } else {
            audioService.speak(text, sectionIdentifier).catch(() => {});
        }
    };

    return (
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className="p-1.5 rounded-full hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={isPlaying ? "Stop" : "Hear the Oracle"}
      >
        {isLoading ? <AudioSpinner /> : isPlaying ? <StopIcon /> : <SpeakerIcon />}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-modal-reveal">
        <Card className="!p-8 min-h-[400px]">
          {/* Fix: The main content is no longer in an 'else' block.
              This ensures it's always in the DOM, allowing CSS transitions to work correctly.
              The Loader will overlay this content when 'stage' is 'preparing', as it has a higher z-index.
              This resolves the TypeScript error and enables the intended fade-in animation. */}
          {stage === 'preparing' ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader message="The Oracle is preparing its vision..." />
            </div>
          ) : (
            <>
              <div className={`text-center transition-opacity duration-700 ${stage === 'preparing' ? 'opacity-0' : 'opacity-100'}`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">The Oracle Has Spoken!</h3>
                <p className="text-lg text-[var(--color-text-body)] mt-4">You have created...</p>
                <h4 className="text-4xl font-header text-[var(--color-primary-dark)] mt-1 mb-6">{judgement.dishName}</h4>
              </div>

              <div className={`space-y-4 transition-opacity duration-700 ${stage === 'preparing' ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="font-bold text-amber-800">Oracle's Vision</h5>
                    <PlayAudioButton text={judgement.description} audioData={visionAudio} sectionIdentifier="oracle-vision" />
                  </div>
                  <p className="text-amber-700 italic">"{judgement.description}"</p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 transition-opacity duration-700 ${stage === 'playing_wisdom' || stage === 'complete' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="sm:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="font-bold text-gray-800">Oracle's Wisdom</h5>
                      <PlayAudioButton text={judgement.feedback} audioData={wisdomAudio} sectionIdentifier="oracle-wisdom" />
                    </div>
                    <p className="text-[var(--color-text-body)]">{judgement.feedback}</p>
                  </div>
                  <div className="sm:col-span-1 bg-gray-50 p-4 rounded-lg text-center flex flex-col justify-center items-center border border-gray-100">
                    <h5 className="font-bold text-gray-800 mb-2">Final Score</h5>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-white border-4 ${scoreColor.replace('text-', 'border-')}`}>
                      <p className={`text-5xl font-header ${scoreColor}`}>{judgement.score.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Button onClick={onClose}>
                  Next Challenge
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
