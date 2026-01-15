import React, { useState, useEffect } from 'react';
import { Component, Descriptor } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';
import SciFiSlider from './ui/SciFiSlider';
import { CheckIcon } from '../constants';

interface ComponentModalProps {
  component: Component | null;
  onClose: () => void;
  onSave: (component: Component) => void;
}

const emptyComponent: Omit<Component, 'id'> = {
    name: '',
    category: 'Uncategorized',
    impact: 5,
    novelty: 5,
    feasibility: 5,
    complexity: 5,
    descriptors: [],
    abstractConcreteBias: 5,
    theoreticalAppliedBias: 5,
    abstract: '',
    sourceURL: '',
};

const ComponentModal: React.FC<ComponentModalProps> = ({ component, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Component, 'id'>>(() => component ? { ...component } : emptyComponent);
  const [showSuccess, setShowSuccess] = useState(false);
  const isEditing = !!component;

  useEffect(() => {
    setFormData(component ? { ...component } : emptyComponent);
    setShowSuccess(false);
  }, [component]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleDescriptorChange = (descriptor: Descriptor) => {
    setFormData(prev => {
        const newDescriptors = prev.descriptors.includes(descriptor)
            ? prev.descriptors.filter(t => t !== descriptor)
            : [...prev.descriptors, descriptor];
        return { ...prev, descriptors: newDescriptors };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSuccess) return;

    if (!formData.name) {
        alert("Component Name is required.");
        return;
    }
    const finalComponent: Component = {
        ...formData,
        id: isEditing && component ? component.id : `COMP_${Date.now()}`,
    };
    onSave(finalComponent);
    
    setShowSuccess(true);
    setTimeout(() => {
        onClose();
    }, 1500);
  };
  
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <GlassmorphicCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={handleModalContentClick}>
        <div className="relative">
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">{isEditing ? 'Edit Component DNA' : 'Add New Component'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Component Name" required className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category (e.g., AI Model)" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-cyan-300">Core Metrics</h3>
                <SciFiSlider label="Impact" name="impact" value={formData.impact} min={0} max={10} onChange={handleSliderChange} />
                <SciFiSlider label="Novelty" name="novelty" value={formData.novelty} min={0} max={10} onChange={handleSliderChange} />
                <SciFiSlider label="Feasibility" name="feasibility" value={formData.feasibility} min={0} max={10} onChange={handleSliderChange} />
                <SciFiSlider label="Complexity" name="complexity" value={formData.complexity} min={0} max={10} onChange={handleSliderChange} />
              </div>

              <div className="space-y-4">
                 <h3 className="font-semibold text-cyan-300">Conceptual Biases</h3>
                <SciFiSlider label="Conceptual Bias" name="abstractConcreteBias" value={formData.abstractConcreteBias} min={0} max={10} minLabel="Abstract" maxLabel="Concrete" onChange={handleSliderChange} />
                <SciFiSlider label="Methodological Bias" name="theoreticalAppliedBias" value={formData.theoreticalAppliedBias} min={0} max={10} minLabel="Theoretical" maxLabel="Applied" onChange={handleSliderChange} />
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold text-cyan-300 mb-2">Descriptors</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Descriptor).map(tag => (
                    <button type="button" key={tag} onClick={() => handleDescriptorChange(tag)} className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors capitalize ${formData.descriptors.includes(tag) ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                  <textarea name="abstract" value={formData.abstract} onChange={handleInputChange} placeholder="Abstract / Core Idea..." rows={3} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"></textarea>
                  <input name="sourceURL" value={formData.sourceURL} onChange={handleInputChange} placeholder="Source URL (e.g., arXiv, Wikipedia)" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
               <button type="button" onClick={onClose} disabled={showSuccess} className="border border-slate-700 text-gray-400 font-semibold py-2 px-6 rounded-lg hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
               <button type="submit" disabled={showSuccess} className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 font-bold py-2 px-6 rounded-lg hover:bg-cyan-500/20 transition-colors animate-subtle-glow disabled:opacity-50">Save Component</button>
            </div>
          </form>

          {showSuccess && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                    <CheckIcon className="w-10 h-10 text-green-400" />
                </div>
                <p className="mt-4 text-xl font-bold text-green-300">Component Saved!</p>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default ComponentModal;