import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TutorialProps {
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Greetings, Deity!",
    content: "Welcome to Spice Sovereign. Your task is to craft dishes worthy of the cosmos. Each challenge has a unique goal and a target flavor profile."
  },
  {
    title: "The Altar of Spices",
    content: "Here lie the divine spices. Click on a spice to add it to your cauldron. Each one possesses a unique combination of flavor essences."
  },
  {
    title: "The Divine Cauldron",
    content: "Your selected spices appear here. You can add multiple parts of the same spice or remove them if you change your mind."
  },
  {
    title: "The Flavor Essences",
    content: "These gauges show the current flavor profile of your creation. The glowing white line on each meter indicates the target for the current challenge. Try to match it!"
  },
  {
    title: "The Oracle's Judgment",
    content: "When you are satisfied with your concoction, present it to the Oracle. It will judge your creation and bestow a score and feedback. Good luck, Sovereign!"
  }
];

export const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };
  
  const handlePrev = () => {
      if(step > 0) {
          setStep(step - 1);
      }
  }

  const currentStep = tutorialSteps[step];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg" border="border-amber-500">
        <h2 className="text-2xl font-cinzel text-amber-300 mb-4">{`Step ${step + 1}: ${currentStep.title}`}</h2>
        <p className="text-gray-300 mb-6 min-h-[70px]">{currentStep.content}</p>
        
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                {tutorialSteps.map((_, index) => (
                    <div key={index} className={`w-3 h-3 rounded-full transition-colors ${index === step ? 'bg-amber-400' : 'bg-gray-600'}`}></div>
                ))}
            </div>
            <div className="flex gap-4">
                {step > 0 && <Button onClick={handlePrev} variant="secondary">Prev</Button>}
                <Button onClick={handleNext}>
                    {step === tutorialSteps.length - 1 ? "Let's Cook!" : 'Next'}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};
