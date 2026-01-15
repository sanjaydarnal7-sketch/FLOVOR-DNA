
import React, { useState, useEffect, useRef } from 'react';
import { Ingredient } from '../types';
import { PencilIcon, TrashIcon, GenerateIcon } from '../constants';
import GlassmorphicCard from './ui/GlassmorphicCard';
import IngredientModal from './IngredientModal';
import SciFiSlider from './ui/SciFiSlider';
import GenerateIngredientModal from './GenerateIngredientModal';
import { generateIngredientProfile } from '../services/geminiService';

const IngredientCard: React.FC<{ 
    ingredient: Ingredient,
    onEdit: (ingredient: Ingredient) => void,
    onDelete: (id: string) => void,
}> = ({ ingredient, onEdit, onDelete }) => (
  <GlassmorphicCard className="p-4 flex flex-col gap-2 transition-all duration-300 hover:border-indigo-400/50 group relative border border-slate-800/50 hover:bg-slate-900/60">
    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(ingredient)} className="text-gray-500 hover:text-indigo-400 p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"><PencilIcon className="w-5 h-5"/></button>
        <button onClick={() => onDelete(ingredient.id)} className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"><TrashIcon className="w-5 h-5"/></button>
    </div>
    
    <h3 className="text-lg font-bold text-indigo-300 pr-12 font-sans">{ingredient.name}</h3>
    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{ingredient.type} / {ingredient.subcategory}</p>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2 text-gray-400">
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Acids:</span> {ingredient.dna.acids}</p>
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Sugars:</span> {ingredient.dna.sugars}</p>
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Aromatics:</span> {ingredient.dna.aromatics}</p>
        <p className="font-mono"><span className="font-sans font-semibold text-gray-500">Umami:</span> {ingredient.dna.umami}</p>
        <p className="font-mono col-span-2"><span className="font-sans font-semibold text-gray-500">Season:</span> <span className="capitalize">{ingredient.seasonality}</span></p>
    </div>
    <div className="mt-2 flex flex-wrap gap-1">
        <span className="bg-indigo-900/50 border border-indigo-700/30 text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full font-mono">{ingredient.archetype}</span>
    </div>
  </GlassmorphicCard>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const IngredientDNAView: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: [] as string[],
    archetype: [] as string[],
    acids: { min: 0, max: 10 },
    sugars: { min: 0, max: 10 },
    bitterness: { min: 0, max: 10 },
    umami: { min: 0, max: 10 },
    aromatics: { min: 0, max: 10 },
    texture: { min: 0, max: 10 },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isArchetypeSelectorOpen, setIsArchetypeSelectorOpen] = useState(false);
  const [isNumericFilterOpen, setIsNumericFilterOpen] = useState(false);
  const typeSelectorRef = useRef<HTMLDivElement>(null);
  const archetypeSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('data/ingredients.json')
      .then(res => {
          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
      })
      .then(data => setIngredients(data as Ingredient[]))
      .catch(error => console.error("Failed to fetch ingredients:", error));
  }, []);
  
  const allTypes = [...new Set(ingredients.map(i => i.type))].sort();
  const allArchetypes = [...new Set(ingredients.map(i => i.archetype))].sort();


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeSelectorRef.current && !typeSelectorRef.current.contains(event.target as Node)) {
        setIsTypeSelectorOpen(false);
      }
      if (archetypeSelectorRef.current && !archetypeSelectorRef.current.contains(event.target as Node)) {
        setIsArchetypeSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleOpenModal = (ingredient: Ingredient | null = null) => {
    setEditingIngredient(ingredient);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
  };
  
  const handleSaveIngredient = (ingredient: Ingredient) => {
    if (editingIngredient && ingredients.some(i => i.id === editingIngredient.id)) {
      setIngredients(prev => prev.map(i => i.id === ingredient.id ? ingredient : i));
    } else {
      setIngredients(prev => [ingredient, ...prev]);
    }
    handleCloseModal();
  };

  const handleDeleteIngredient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) {
        setIngredients(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleGenerateIngredient = async (ingredientName: string, options: { fast: boolean }) => {
      try {
          const generatedProfile = await generateIngredientProfile(ingredientName, options);
          setIsGenerateModalOpen(false);
          handleOpenModal(generatedProfile as Ingredient);
      } catch (error) {
          console.error("Failed to generate ingredient profile:", error);
          let userFriendlyError = `Could not generate a profile for "${ingredientName}".`;
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

  const handleTypeToggle = (type: string) => {
    setFilters(prev => {
        const newTypes = prev.type.includes(type)
            ? prev.type.filter(c => c !== type)
            : [...prev.type, type];
        return { ...prev, type: newTypes };
    });
  };

  const handleArchetypeToggle = (archetype: string) => {
    setFilters(prev => {
        const newArchetypes = prev.archetype.includes(archetype)
            ? prev.archetype.filter(c => c !== archetype)
            : [...prev.archetype, archetype];
        return { ...prev, archetype: newArchetypes };
    });
  };

  // FIX: Refactored `handleRangeChange` to accept a `type` parameter ('min' or 'max') directly,
  // avoiding the use of a problematic synthetic event object which caused type errors.
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const { name, value } = e.target;
    const filterKey = name as keyof Omit<typeof filters, 'type' | 'archetype'>;
    setFilters(prev => ({
        ...prev,
        [filterKey]: { ...prev[filterKey], [type]: Number(value) }
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
        type: [],
        archetype: [],
        acids: { min: 0, max: 10 },
        sugars: { min: 0, max: 10 },
        bitterness: { min: 0, max: 10 },
        umami: { min: 0, max: 10 },
        aromatics: { min: 0, max: 10 },
        texture: { min: 0, max: 10 },
    });
  };

  const filteredIngredients = ingredients.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.archetype.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(i.type);
    const matchesArchetype = filters.archetype.length === 0 || filters.archetype.includes(i.archetype);
    const matchesAcids = i.dna.acids >= filters.acids.min && i.dna.acids <= filters.acids.max;
    const matchesSugars = i.dna.sugars >= filters.sugars.min && i.dna.sugars <= filters.sugars.max;
    const matchesBitterness = i.dna.bitterness >= filters.bitterness.min && i.dna.bitterness <= filters.bitterness.max;
    const matchesUmami = i.dna.umami >= filters.umami.min && i.dna.umami <= filters.umami.max;
    const matchesAromatics = i.dna.aromatics >= filters.aromatics.min && i.dna.aromatics <= filters.aromatics.max;
    const matchesTexture = i.dna.texture >= filters.texture.min && i.dna.texture <= filters.texture.max;

    return matchesSearch && matchesType && matchesArchetype && matchesAcids && matchesSugars && matchesBitterness && matchesUmami && matchesAromatics && matchesTexture;
  });

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-100 mb-2 font-sans">Ingredient DNA Database</h2>
      <p className="text-gray-400 mb-6">Explore, search, and manage the sensory profiles of raw materials.</p>
      
      <GlassmorphicCard className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase font-mono">Search</label>
                <input type="text" placeholder="e.g., Alphonso Mango" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div className="relative" ref={typeSelectorRef}>
                <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase font-mono">Type</label>
                <button onClick={() => setIsTypeSelectorOpen(prev => !prev)} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-left flex justify-between items-center">
                    <span className="truncate">{filters.type.length > 0 ? `${filters.type.length} selected` : 'All Types'}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isTypeSelectorOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTypeSelectorOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md shadow-lg z-20 p-2 flex flex-wrap gap-2">
                        {allTypes.map(cat => (
                            <button key={cat} onClick={() => handleTypeToggle(cat)} className={`text-xs font-medium px-2 py-1 rounded-full transition-colors capitalize font-mono ${filters.type.includes(cat) ? 'bg-indigo-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>
             <div className="relative" ref={archetypeSelectorRef}>
                <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase font-mono">Archetype</label>
                <button onClick={() => setIsArchetypeSelectorOpen(prev => !prev)} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-left flex justify-between items-center">
                    <span className="truncate">{filters.archetype.length > 0 ? `${filters.archetype.length} selected` : 'All Archetypes'}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isArchetypeSelectorOpen ? 'rotate-180' : ''}`} />
                </button>
                {isArchetypeSelectorOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md shadow-lg z-20 p-2 flex flex-wrap gap-2">
                        {allArchetypes.map(tag => (
                            <button key={tag} onClick={() => handleArchetypeToggle(tag)} className={`text-xs font-medium px-2 py-1 rounded-full transition-colors capitalize font-mono ${filters.archetype.includes(tag) ? 'bg-indigo-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
             <div className="flex gap-2">
                <button onClick={resetFilters} className="w-full border border-slate-700 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">Reset</button>
                <button onClick={() => handleOpenModal()} className="w-full border border-slate-700 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap">+ Add</button>
                <button onClick={() => setIsGenerateModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 border border-indigo-500 text-indigo-300 font-bold py-2 px-4 rounded-lg hover:bg-indigo-500/20 transition-colors whitespace-nowrap animate-subtle-glow"><GenerateIcon className="w-5 h-5"/> Gen</button>
            </div>
        </div>
        
        <div className="mt-4">
            <button onClick={() => setIsNumericFilterOpen(prev => !prev)} className="text-sm text-indigo-300 hover:text-indigo-200 flex items-center gap-2 cursor-pointer font-semibold">
                Numerical DNA Filters <ChevronDownIcon className={`w-4 h-4 transition-transform ${isNumericFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isNumericFilterOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 p-4 bg-slate-900/40 rounded-lg border border-slate-800/50">
                    <SciFiSlider label="Acids" name="acids" value={filters.acids.max} min={filters.acids.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="acids" value={filters.acids.min} min={0} max={filters.acids.max} onChange={(e) => handleRangeChange(e, 'min')} />
                    
                    <SciFiSlider label="Sugars" name="sugars" value={filters.sugars.max} min={filters.sugars.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="sugars" value={filters.sugars.min} min={0} max={filters.sugars.max} onChange={(e) => handleRangeChange(e, 'min')} />

                    <SciFiSlider label="Bitterness" name="bitterness" value={filters.bitterness.max} min={filters.bitterness.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="bitterness" value={filters.bitterness.min} min={0} max={filters.bitterness.max} onChange={(e) => handleRangeChange(e, 'min')} />

                    <SciFiSlider label="Umami" name="umami" value={filters.umami.max} min={filters.umami.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="umami" value={filters.umami.min} min={0} max={filters.umami.max} onChange={(e) => handleRangeChange(e, 'min')} />
                    
                    <SciFiSlider label="Aromatics" name="aromatics" value={filters.aromatics.max} min={filters.aromatics.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="aromatics" value={filters.aromatics.min} min={0} max={filters.aromatics.max} onChange={(e) => handleRangeChange(e, 'min')} />

                    <SciFiSlider label="Texture" name="texture" value={filters.texture.max} min={filters.texture.min} max={10} onChange={(e) => handleRangeChange(e, 'max')} />
                    <SciFiSlider label="" name="texture" value={filters.texture.min} min={0} max={filters.texture.max} onChange={(e) => handleRangeChange(e, 'min')} />
                </div>
            )}
        </div>
      </GlassmorphicCard>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIngredients.map(ingredient => (
          <IngredientCard 
            key={ingredient.id} 
            ingredient={ingredient}
            onEdit={handleOpenModal}
            onDelete={handleDeleteIngredient}
          />
        ))}
      </div>
      
      {isModalOpen && (
        <IngredientModal 
            ingredient={editingIngredient}
            onClose={handleCloseModal}
            onSave={handleSaveIngredient}
        />
      )}

      {isGenerateModalOpen && (
        <GenerateIngredientModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onGenerate={handleGenerateIngredient}
        />
      )}
    </div>
  );
};

export default IngredientDNAView;
