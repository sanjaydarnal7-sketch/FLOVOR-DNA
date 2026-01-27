
import React, { useState } from 'react';
import { Component } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';

interface ComponentSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (component: Component) => void;
  components: Component[];
  existingIds: string[];
  categories: string[];
}

const ComponentSelectModal: React.FC<ComponentSelectModalProps> = ({ isOpen, onClose, onSelect, components, existingIds, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  if (!isOpen) return null;

  const availableComponents = components
    .filter(c => !existingIds.includes(c.id))
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => selectedCategory ? c.category === selectedCategory : true);

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <GlassmorphicCard className="w-full max-w-md max-h-[80vh] flex flex-col" onClick={handleModalContentClick}>
        <div className="p-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-gray-100 uppercase tracking-wider">Add Component to Synthesis</h2>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search components..."
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mt-4"
                autoFocus
            />
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mt-2 capitalize"
            >
                <option value="">All Categories</option>
                {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>
        </div>
        <div className="overflow-y-auto p-4 flex-grow">
            {availableComponents.length > 0 ? (
                <ul className="space-y-2">
                    {availableComponents.map(component => (
                        <li key={component.id}>
                            <button
                                onClick={() => onSelect(component)}
                                className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-cyan-400/10 hover:border-cyan-400 border border-transparent transition-all"
                            >
                                <p className="font-semibold text-cyan-300">{component.name}</p>
                                <p className="text-xs text-gray-400">{component.abstract}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 py-8">No components found.</p>
            )}
        </div>
        <div className="p-4 border-t border-slate-800 flex justify-end">
            <button onClick={onClose} className="border border-slate-700 text-gray-400 font-semibold py-2 px-6 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Close
            </button>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default ComponentSelectModal;
