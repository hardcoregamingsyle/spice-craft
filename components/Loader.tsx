import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Consulting the Oracle...",
    "Weighing the cosmic essences...",
    "Gauging the celestial flavors...",
    "Awaiting a divine verdict...",
    "Decoding ancient recipes...",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-amber-200 text-lg font-cinzel transition-opacity duration-500">{message}</p>
    </div>
  );
};