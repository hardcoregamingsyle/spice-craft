import React, { useState, useCallback } from 'react';
import { GameScreen } from './components/GameScreen';

function App() {
  const [gameKey, setGameKey] = useState(0);

  const startNewGame = useCallback(() => {
    if (window.confirm("Are you sure you want to start anew? Your current creation will be lost to the cosmos.")) {
      setGameKey(prevKey => prevKey + 1);
    }
  }, []);


  return (
    <div className="bg-[#0c111f] min-h-screen text-white antialiased">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 relative">
          <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-amber-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
            Spice Sovereign
          </h1>
          <p className="text-lg text-amber-100 mt-2">
            Craft legendary dishes as a culinary deity.
          </p>
          <div className="absolute top-0 right-0">
             <button 
                onClick={startNewGame} 
                className="px-4 py-2 text-sm bg-transparent border border-amber-700 text-amber-300 rounded-lg hover:bg-amber-500/10 transition-colors"
                title="Start a new game"
              >
                Start Anew
              </button>
          </div>
        </header>
        <GameScreen key={gameKey} onPlayAgain={startNewGame} />
      </main>
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>Powered by Gemini. Your divine culinary journey awaits.</p>
      </footer>
    </div>
  );
}

export default App;