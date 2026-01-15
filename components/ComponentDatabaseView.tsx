
import React, { useState, useEffect, useRef } from 'react';
import { Component, Descriptor } from '../types';
import { INITIAL_COMPONENTS, PencilIcon, TrashIcon, GenerateIcon } from '../constants';
import GlassmorphicCard from './ui/GlassmorphicCard';
import ComponentModal from './ComponentModal';
import SciFiSlider from './ui/SciFiSlider';
import GenerateComponentModal from './GenerateComponentModal';
import { generateComponentProfile } from '../services/geminiService';

const ComponentCard: React.FC<{ 
    component: Component,
    onEdit: (component: Component) => void,
    onDelete: (id: string) => void,
}> = ({ component, onEdit, onDelete }) => (
  <GlassmorphicCard className="p-4 flex flex-col gap-2 transition-all duration-300 hover:border-cyan-400/50 group relative border border-slate-800/50 hover:bg-slate-900/60">
    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(component)} className="text-gray-500 hover:text-cyan-400 p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"><PencilIcon className="w-5 h-5"/></button>
        <button onClick={() => onDelete(component.id)} className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"><TrashIcon className="w-5 h-5"/></button>
    </div>
    
    <h3 className="text-lg font-bold text-cyan-300 pr-12 font-sans">{component.name}</h3>
    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{component.category}</p>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2 text-gray-400">
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Impact:</span> {component.impact}</p>
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Novelty:</span> {component.novelty}</p>
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Feasibility:</span> {component.feasibility}</p>
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Complexity:</span> {component.complexity}</p>
    </div>
    <div className="mt-2 flex flex-wrap gap-1">
        {component.descriptors.slice(0, 4).map(tag => (
            <span key={tag} className="bg-cyan-900/50 border border-cyan-700/30 text-cyan-300 text-xs font-medium px-2 py-0.5 rounded-full font-mono">{tag}</span>
        ))}
    </div>
  </GlassmorphicCard>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const ComponentDatabaseView: React.FC = () => {
  const [components, setComponents] = useState<Component[]>(INITIAL_COMPONENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    descriptors: [] as Descriptor[],
    category: [] as string[],
    impact: { min: 0, max: 10 },
    novelty: { min: 0, max: 10 },
    feasibility: { min: 0, max: 10 },
    complexity: { min: 0, max: 10 },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [isDescriptorSelectorOpen, setIsDescriptorSelectorOpen] = useState(false);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [isNumericFilterOpen, setIsNumericFilterOpen] = useState(false);
  const descriptorSelectorRef = useRef<HTMLDivElement>(null);
  const categorySelectorRef = useRef<HTMLDivElement>(null);
  
  const allCategories = [...new Set(components.map(i => i.category))].sort();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (descriptorSelectorRef.current && !descriptorSelectorRef.current.contains(event.target as Node)) {
        setIsDescriptorSelectorOpen(false);
      }
      if (categorySelectorRef.current && !categorySelectorRef.current.contains(event.target as Node)) {
        setIsCategorySelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenModal = (component: Component | null = null) => {
    setEditingComponent(component);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingComponent(null);
  };
  
  const handleSaveComponent = (component: Component) => {
    if (editingComponent && components.some(c => c.id === editingComponent.id)) {
      setComponents(prev => prev.map(i => i.id === component.id ? component : i));
    } else {
      setComponents(prev => [component, ...prev]);
    }
    handleCloseModal();
  };

  const handleDeleteComponent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
        setComponents(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleGenerateComponent = async (componentName: string, options: { fast: boolean }) => {
      try {
          const generatedProfile = await generateComponentProfile(componentName, options);
          setIsGenerateModalOpen(false);
          handleOpenModal({ ...generatedProfile, id: '' }); // Open as new component
      } catch (error) {
          console.error("Failed to generate component profile:", error);
          let userFriendlyError = `Could not generate a profile for "${componentName}".`;
          const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();
          if (errorMessage.includes('api key')) {
              userFriendlyError += ' This seems to be an API Key issue. Please verify your key.';
          } else if (errorMessage.includes('quota')) {
              userFriendlyError += ' The request quota has been exceeded. Please check your account usage.';
          } else if (errorMessage.includes('network') || errorMessage.includes('failed to fetch')) {
              userFriendlyError += ' A network error occurred. Please check your connection.';
          } else if (errorMessage.includes('schema') || errorMessage.includes('json')) {
              userFriendlyError += ' The model returned data in an unexpected format. Please try again.';
          } else {
              userFriendlyError += ' An unexpected error occurred.';
          }
          alert(`Generation Failed: ${userFriendlyError}`);
      }
  };

  const handleDescriptorToggle = (descriptor: Descriptor) => {
    setFilters(prev => {
        const newDescriptors = prev.descriptors.includes(descriptor)
            ? prev.descriptors.filter(t => t !== descriptor)
            : [...prev.descriptors, descriptor];
        return { ...prev, descriptors: newDescriptors };
    });
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => {
        const newCategories = prev.category.includes(category)
            ? prev.category.filter(c => c !== category)
            : [...prev.category, category];
        return { ...prev, category: newCategories };
    });
  };

  // FIX: Refactored `handleRangeChange` to accept a `type` parameter ('min' or 'max') directly,
  // avoiding the use of a problematic synthetic event object which caused type errors.
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const { name, value } = e.target;
    const filterKey = name as keyof Omit<typeof filters, 'descriptors' | 'category'>;
    setFilters(prev => ({
        ...prev,
        [filterKey]: { ...prev[filterKey], [type]: Number(value) }
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
        descriptors: [],
        category: [],
        impact: { min: 0, max: 10 },
        novelty: { min: 0, max: 10 },
        feasibility: { min: 0, max: 10 },
        complexity: { min: 0, max: 10 },
    });
  };

  const filteredComponents = components.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescriptor = filters.descriptors.length === 0 || filters.descriptors.some(desc => c.descriptors.includes(desc));
    const matchesCategory = filters.category.length === 0 || filters.category.includes(c.category);
    const matchesImpact = c.impact >= filters.impact.min && c.impact <= filters.impact.max;
    const matchesNovelty = c.novelty >= filters.novelty.min && c.novelty <= filters.novelty.max;
    const matchesFeasibility = c.feasibility >= filters.feasibility.min && c.feasibility <= filters.feasibility.max;
    const matchesComplexity = c.complexity >= filters.complexity.min && c.complexity <= filters.complexity.max;
    
    return matchesSearch && matchesDescriptor && matchesCategory && matchesImpact && matchesNovelty && matchesFeasibility && matchesComplexity;
  });

  return (
    <div className="animate-fade-in theme-research">
      <h2 className="text-3xl font-bold text-gray-100 mb-2 font-sans">Component Database</h2>
      <p className="text-gray-400 mb-6">Explore, search, and manage the core properties of research components.</p>
      
      <GlassmorphicCard className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase font-mono">Search</label>
                <input type="text" placeholder="e.g., Transformer" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition" />
            </div>
            <div className="relative" ref={categorySelectorRef}>
                <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase font-mono">Category</label>
                <button onClick={() => setIsCategorySelectorOpen(prev => !prev)} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition text-left flex justify-between items-center">
                    <span className="truncate">{filters.category.length > 0 ? `${filters.category.length} selected` : 'All Categories'}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCategorySelectorOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategorySelectorOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md shadow-lg z-20 p-2 flex flex-wrap gap-2">
                        {allCategories.map(cat => (
                            <button key={cat} onClick={() => handleCategoryToggle(cat)} className={`text-xs font-medium px-2 py-1 rounded-full transition-colors capitalize font-mono ${filters.category.includes(cat) ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>
             <div className="relative" ref={descriptorSelectorRef}>
                <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase font-mono">Descriptors</label>
                <button onClick={() => setIsDescriptorSelectorOpen(prev => !prev)} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition text-left flex justify-between items-center">
                    <span className="truncate">{filters.descriptors.length > 0 ? `${filters.descriptors.length} selected` : 'All Descriptors'}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDescriptorSelectorOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDescriptorSelectorOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md shadow-lg z-20 p-2 flex flex-wrap gap-2">
                        {Object.values(Descriptor).map(tag => (
                            <button key={tag} onClick={() => handleDescriptorToggle(tag)} className={`text-xs font-medium px-2 py-1 rounded-full transition-colors capitalize font-mono ${filters.descriptors.includes(tag) ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
             <div className="flex gap-2 lg:col-start-3 xl:col-start-5">
                <button onClick={resetFilters} className="w-full border border-slate-700 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">Reset</button>
                <button onClick={() => handleOpenModal()} className="w-full border border-slate-700 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap">+ Add</button>
                <button onClick={() => setIsGenerateModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-cyan-500/20 transition-colors whitespace-nowrap animate-subtle-glow"><GenerateIcon className="w-5 h-5"/> Gen</button>
            </div>
        </div>
        
        <div className="mt-4">
            <button onClick={() => setIsNumericFilterOpen(prev => !prev)} className="text-sm text-cyan-300 hover:text-cyan-200 flex items-center gap-2 cursor-pointer font-semibold">
                Numerical Range Filters <ChevronDownIcon className={`w-4 h-4 transition-transform ${isNumericFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isNumericFilterOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 p-4 bg-slate-900/40 rounded-lg border border-slate-800/50">
                    {/* FIX: Updated onChange handlers to pass the event and type directly to the refactored `handleRangeChange` function. */}
                    <SciFiSlider label="Impact" name="impact" value={filters.impact.max} min={filters.impact.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="impact" value={filters.impact.min} min={0} max={filters.impact.max} onChange={(e) => handleRangeChange(e, 'min')} />
                    
                    <SciFiSlider label="Novelty" name="novelty" value={filters.novelty.max} min={filters.novelty.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="novelty" value={filters.novelty.min} min={0} max={filters.novelty.max} onChange={(e) => handleRangeChange(e, 'min')} />

                    <SciFiSlider label="Feasibility" name="feasibility" value={filters.feasibility.max} min={filters.feasibility.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="feasibility" value={filters.feasibility.min} min={0} max={filters.feasibility.max} onChange={(e) => handleRangeChange(e, 'min')} />

                    <SciFiSlider label="Complexity" name="complexity" value={filters.complexity.max} min={filters.complexity.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="complexity" value={filters.complexity.min} min={0} max={filters.complexity.max} onChange={(e) => handleRangeChange(e, 'min')} />
                </div>
            )}
        </div>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredComponents.map(component => (
          <ComponentCard 
            key={component.id} 
            component={component}
            onEdit={handleOpenModal}
            onDelete={handleDeleteComponent}
          />
        ))}
      </div>
      
      {isModalOpen && (
        <ComponentModal 
            component={editingComponent}
            onClose={handleCloseModal}
            onSave={handleSaveComponent}
        />
      )}

      {isGenerateModalOpen && (
        <GenerateComponentModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onGenerate={handleGenerateComponent}
        />
      )}
    </div>
  );
};

export default ComponentDatabaseView;
