
import React, { useState } from 'react';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { ResearchDnaIcon, MoleculeIcon, SynthesisIcon, DatabaseIcon, ArrowRightIcon, CheckIcon } from '../constants';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactElement;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to the Synthesis Engine',
    description: 'This is a professional R&D intelligence system. It helps you model complex topics as data and discover new insights. This short guide will show you the core features.',
    icon: <ResearchDnaIcon className="w-16 h-16 text-cyan-300" />,
  },
  {
    title: 'Two Core Modules: Research & Flavour',
    description: 'The application is split into two main sections, accessible from the navigation rail. "Research DNA" is for abstract concepts and scientific R&D, while "Flavour DNA" is for sensory and culinary R&D.',
    icon: <div className="flex gap-4"><ResearchDnaIcon className="w-12 h-12 text-cyan-300" /><MoleculeIcon className="w-12 h-12 text-indigo-300" /></div>,
  },
  {
    title: 'Natural & Synthetic Chemicals',
    description: "Fruits and vegetables contain natural chemicals like vitamins (C, A), minerals (Potassium, Magnesium), fiber, and organic acids (citric, malic). They can also have synthetic pesticides like chlorpyrifos from farming, which are monitored for potential harm. Key beneficial compounds include anthocyanins (blue/red colors), lycopene (reds), and beta-carotene (orange/yellow).",
    icon: <MoleculeIcon className="w-16 h-16 text-indigo-300" />,
  },
  {
    title: 'The Synthesis & Flavour Labs',
    description: 'The Labs are where you engineer new ideas. You can define a target profile for a research paper or a beverage, and the AI will analyze it, predict outcomes, and explain the logic.',
    icon: <SynthesisIcon className="w-16 h-16 text-cyan-300" />,
  },
  {
    title: 'The Component & Ingredient Databases',
    description: 'The Databases are your libraries of building blocks. You can explore, filter, and manage the properties of research components or food ingredients that you can use in the labs.',
    icon: <DatabaseIcon className="w-16 h-16 text-gray-300" />,
  },
  {
    title: "You're Ready to Go!",
    description: 'That\'s the basics. Feel free to explore the different labs and databases. Use the AI to generate new ideas, analyze concepts, and accelerate your R&D workflow.',
    icon: <CheckIcon className="w-16 h-16 text-green-400" />,
  },
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // Finish on the last step
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <GlassmorphicCard className="w-full max-w-lg border-cyan-400/30" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <div className="p-8 text-center flex flex-col items-center">
          <div className="mb-6 h-16 flex items-center justify-center">{stepData.icon}</div>
          <h2 id="onboarding-title" className="text-2xl font-bold text-gray-100 mb-4 uppercase tracking-wider">{stepData.title}</h2>
          <p className="text-gray-400 mb-8 h-24">{stepData.description}</p>
          
          <div className="w-full flex justify-between items-center">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm font-semibold transition-colors">
              Skip Tutorial
            </button>
            
            <div className="flex items-center gap-4">
               {currentStep > 0 && (
                <button onClick={handleBack} className="border border-slate-700 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 font-bold py-2 px-6 rounded-lg hover:bg-cyan-500/20 transition-colors animate-subtle-glow"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ArrowRightIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep ? 'bg-cyan-400 w-4' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default OnboardingGuide;