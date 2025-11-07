import { generateSpeechFromText } from './geminiService';

// --- Types ---
export type AudioStatus = 'idle' | 'loading' | 'playing';
export interface AudioState {
    status: AudioStatus;
    textIdentifier: string | null;
};
type StateListener = (state: AudioState) => void;

// --- State and Listeners ---
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentState: AudioState = { status: 'idle', textIdentifier: null };
const listeners = new Set<StateListener>();

const setState = (status: AudioStatus, textIdentifier: string | null) => {
    currentState = { status, textIdentifier };
    listeners.forEach(listener => listener(currentState));
};

// --- Audio Decoding Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const initializeAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

// --- Public Service ---
export const audioService = {
    subscribe: (listener: StateListener) => {
        listeners.add(listener);
        listener(currentState); // Notify immediately with current state
        return () => listeners.delete(listener);
    },

    getCurrentState: (): AudioState => {
        return currentState;
    },

    stop: () => {
        if (currentSource) {
            currentSource.onended = null; // Prevent onended from firing on manual stop
            currentSource.stop();
            currentSource = null;
        }
        if (currentState.status !== 'idle') {
            setState('idle', null);
        }
    },

    play: async (base64Audio: string, identifier: string): Promise<void> => {
        audioService.stop();
        const context = initializeAudio();
        setState('playing', identifier);

        try {
            const audioBuffer = await decodeAudioData(decode(base64Audio), context, 24000, 1);
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);

            return new Promise((resolve, reject) => {
                source.onended = () => {
                    if (currentSource === source) {
                        setState('idle', null);
                        currentSource = null;
                    }
                    resolve();
                };
                currentSource = source;
                source.start();
            });
        } catch (error) {
            console.error(`Error playing identifier ${identifier}:`, error);
            setState('idle', null);
            throw error;
        }
    },

    speak: async (text: string, identifier: string): Promise<void> => {
        audioService.stop();
        initializeAudio();
        setState('loading', identifier);

        try {
            const base64Audio = await generateSpeechFromText(text);
            if (!base64Audio) {
                throw new Error("Audio generation returned no data.");
            }
            return audioService.play(base64Audio, identifier);
        } catch (error) {
            console.error(`Error speaking identifier ${identifier}:`, error);
            setState('idle', null);
            throw error;
        }
    },
};
