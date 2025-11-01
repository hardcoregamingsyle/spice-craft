import React from 'react';
import { OracleJudgement } from '../types';
import { Card } from './ui/Card';

interface OracleResponseProps {
  judgement: OracleJudgement;
}

export const OracleResponse: React.FC<OracleResponseProps> = ({ judgement }) => {
  const scoreColor = judgement.score >= 8 ? 'text-green-400' : judgement.score >= 5 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-judgement-reveal">
            <Card border="border-2 border-amber-400 shadow-2xl shadow-amber-500/20">
                <h3 className="text-2xl font-cinzel text-center text-amber-300 mb-4">The Oracle Has Spoken!</h3>
                <div className="text-center mb-6">
                    <p className="text-lg text-gray-300">You have created...</p>
                    <h4 className="text-4xl font-cinzel text-white drop-shadow-[0_1px_1px_rgba(251,191,36,0.5)]">{judgement.dishName}</h4>
                </div>

                <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
                    <div className="md:col-span-2 bg-black/20 p-4 rounded-lg">
                        <h5 className="font-bold text-amber-400 mb-2">Description</h5>
                        <p className="text-gray-300 italic">"{judgement.description}"</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg text-center flex flex-col justify-center">
                        <h5 className="font-bold text-amber-400 mb-2">Oracle's Score</h5>
                        <p className={`text-6xl font-bold font-cinzel ${scoreColor}`}>{judgement.score.toFixed(1)}<span className="text-2xl text-gray-400">/10</span></p>
                    </div>
                    <div className="md:col-span-3 bg-black/20 p-4 rounded-lg">
                        <h5 className="font-bold text-amber-400 mb-2">Feedback</h5>
                        <p className="text-gray-300">{judgement.feedback}</p>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};