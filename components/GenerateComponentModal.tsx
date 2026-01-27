
import React, { useState } from 'react';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { WaveformIcon, BoltIcon } from '../constants';

interface GenerateComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (componentName: string, options: { fast: boolean }) => Promise<void>;
}

const GenerateComponentModal: React.FC<GenerateComponentModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [componentName, setComponentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);

  if (!isOpen) return null;

  const handleGenerateClick = async () => {
    if (!componentName.trim()) {
      alert('Please enter a component name.');
      return;
    }
    setIsLoading(true);
    await onGenerate(componentName, { fast: isFastMode });
    setIsLoading(false);
  };

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <GlassmorphicCard className="w-full max-w-md" onClick={handleModalContentClick}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 uppercase tracking-wider">Generate Component with AI</h2>
          <p className="text-gray-400 mb-6">Enter the name of a research component, and the Synthesis Engine will generate its Research DNA profile for you to review.</p>
          
          <div className="space-y-4">
            <div>
                <label htmlFor="componentName" className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Component Name</label>
                <input
                  id="componentName"
                  type="text"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="e.g., CRISPR, Blockchain, Stoicism..."
                  disabled={isLoading}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition disabled:opacity-50"
                  autoFocus
                />
            </div>
             <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700">
                 <div className="flex items-center gap-2">
                    <BoltIcon className="w-5 h-5 text-yellow-300"/>
                    <label htmlFor="fastMode" className="text-sm font-semibold text-gray-300">Fast Response</label>
                 </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="fastMode" checked={isFastMode} onChange={(e) => setIsFastMode(e.target.checked)} className="sr-only peer" disabled={isLoading}/>
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isLoading}
              className="border border-slate-700 text-gray-400 font-semibold py-2 px-6 rounded-lg hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleGenerateClick} 
              disabled={isLoading || !componentName.trim()}
              className="min-w-[150px] flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 font-bold py-2 px-6 rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-subtle-glow"
            >
              {isLoading ? (
                <>
                  <WaveformIcon className="w-5 h-5 animate-pulse" />
                  <span>Generating...</span>
                </>
              ) : (
                'Generate Profile'
              )}
            </button>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default GenerateComponentModal;
