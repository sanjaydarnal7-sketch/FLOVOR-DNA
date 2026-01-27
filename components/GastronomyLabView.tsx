
import React, { useState, useCallback, useEffect } from 'react';
import { Ingredient, Technique, TechniqueParameter, AiAnalysisMode } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { WaveformIcon, NetworkIntelligenceIcon, GoogleIcon, TrashIcon } from '../constants';
import { getGastronomyExperimentStream } from '../services/geminiService';
import IngredientSelectModal from './IngredientSelectModal';

const AiModeSelector: React.FC<{
    selectedMode: AiAnalysisMode;
    onSelectMode: (mode: AiAnalysisMode) => void;
}> = ({ selectedMode, onSelectMode }) => {
    const modes = [
        { id: 'standard', label: 'Standard', icon: <WaveformIcon className="w-5 h-5"/> },
        { id: 'deep', label: 'Deep Analysis', icon: <NetworkIntelligenceIcon className="w-5 h-5" /> },
        { id: 'grounded', label: 'Web Search', icon: <GoogleIcon className="w-5 h-5" /> },
    ] as const;

    return (
        <div>
            <label className="text-sm font-medium text-gray-400 tracking-wider mb-2 block uppercase">AI Analysis Mode</label>
            <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-900/50 border border-slate-700/50">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onSelectMode(mode.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            selectedMode === mode.id
                                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                                : 'text-gray-400 hover:bg-slate-800/50'
                        }`}
                    >
                        {mode.icon}
                        {mode.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-indigo-300 font-bold mt-4 mb-2 text-lg uppercase tracking-wider">{line.substring(4)}</h3>;
                }
                if (line.startsWith('**')) {
                    const parts = line.split('**');
                    return <p key={index} className="my-1"><strong className="text-indigo-300 font-semibold">{parts[1]}</strong>{parts[2]}</p>;
                }
                if (line.startsWith('- ')) {
                    return <li key={index} className="my-1 text-gray-400 ml-4">{line.substring(2)}</li>;
                }
                return <p key={index} className="my-1 text-gray-400">{line}</p>;
            })}
        </div>
    );
};

const GastronomyLabView: React.FC = () => {
    const [objective, setObjective] = useState('Create a transparent, savory chip from potato starch.');
    const [primaryIngredient, setPrimaryIngredient] = useState<Ingredient | null>(null);
    const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
    const [allTechniques, setAllTechniques] = useState<Technique[]>([]);
    const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AiAnalysisMode>('standard');

    // State for custom data sources
    const [ingredientDataUrl, setIngredientDataUrl] = useState('data/ingredients.json');
    const [techniqueDataUrl, setTechniqueDataUrl] = useState('data/techniques.json');
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);

    const loadData = useCallback(async (ingredientsUrl: string, techniquesUrl: string) => {
        setIsDataLoading(true);
        setDataLoadingError(null);
        try {
            const [ingredientsRes, techniquesRes] = await Promise.all([
                fetch(ingredientsUrl),
                fetch(techniquesUrl)
            ]);

            if (!ingredientsRes.ok) throw new Error(`Failed to fetch ingredients from ${ingredientsUrl} (status: ${ingredientsRes.status})`);
            if (!techniquesRes.ok) throw new Error(`Failed to fetch techniques from ${techniquesUrl} (status: ${techniquesRes.status})`);

            const ingredientsData = await ingredientsRes.json();
            const techniquesData = await techniquesRes.json();
            
            setAllIngredients(ingredientsData as Ingredient[]);
            setAllTechniques(techniquesData as Technique[]);
        } catch (err) {
            console.error("Failed to load custom data:", err);
            setDataLoadingError(err instanceof Error ? err.message : "An unknown error occurred while loading data. Check console for details.");
        } finally {
            setIsDataLoading(false);
        }
    }, []);

    // Load default data on mount
    useEffect(() => {
        loadData('data/ingredients.json', 'data/techniques.json');
    }, [loadData]);

    const handleLoadCustomData = () => {
        loadData(ingredientDataUrl, techniqueDataUrl);
        // Reset selections as they might not exist in the new datasets
        setPrimaryIngredient(null);
        setSelectedTechnique(null);
    };

    const handleSelectIngredient = (ingredient: Ingredient) => {
        setPrimaryIngredient(ingredient);
        setIngredientModalOpen(false);
    };

    const handleTechniqueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const techniqueId = e.target.value;
        const technique = allTechniques.find(t => t.id === techniqueId);
        if (technique) {
            // Initialize parameter values with defaults
            const techWithDefaults = {
                ...technique,
                parameters: technique.parameters.map(p => ({ ...p, value: p.defaultValue }))
            };
            setSelectedTechnique(techWithDefaults);
        } else {
            setSelectedTechnique(null);
        }
    };

    const handleParameterChange = (paramName: string, value: string | number) => {
        if (!selectedTechnique) return;
        
        const updatedParams = selectedTechnique.parameters.map(p => 
            p.name === paramName ? { ...p, value: value } : p
        );

        setSelectedTechnique({
            ...selectedTechnique,
            parameters: updatedParams,
        });
    };
    
    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        setAnalysis('');
        setError(null);
        try {
            const stream = await getGastronomyExperimentStream(objective, primaryIngredient, selectedTechnique, analysisMode);
            for await (const chunk of stream) {
                setAnalysis(prev => prev + chunk);
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred during analysis. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [objective, primaryIngredient, selectedTechnique, analysisMode]);

    return (
        <div className="theme-flavour">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Builder Section */}
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="sticky top-0 pt-4 bg-[#020617]/80 backdrop-blur-sm z-10">
                        <h2 className="text-3xl font-bold text-gray-100 mb-2 font-display uppercase">Gastronomy Lab</h2>
                        <p className="text-gray-400 mb-8">Design culinary experiments by combining ingredients with advanced techniques.</p>
                    </div>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Experiment Design</h3>
                        <div>
                            <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">R&D Objective</label>
                            <input type="text" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Data Sources</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">Ingredients Data URL</label>
                                <input 
                                    type="text" 
                                    value={ingredientDataUrl} 
                                    onChange={(e) => setIngredientDataUrl(e.target.value)} 
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" 
                                    placeholder="URL to ingredients JSON"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">Techniques Data URL</label>
                                <input 
                                    type="text" 
                                    value={techniqueDataUrl} 
                                    onChange={(e) => setTechniqueDataUrl(e.target.value)} 
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" 
                                    placeholder="URL to techniques JSON"
                                />
                            </div>
                            <button 
                                onClick={handleLoadCustomData} 
                                disabled={isDataLoading}
                                className="w-full flex items-center justify-center gap-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDataLoading ? 'Loading Data...' : 'Load Custom Data'}
                            </button>
                            {dataLoadingError && (
                                <p className="text-sm text-red-400 mt-2">{dataLoadingError}</p>
                            )}
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Primary Subject</h3>
                        {primaryIngredient ? (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                                <div>
                                    <p className="font-bold text-gray-200">{primaryIngredient.name}</p>
                                    <p className="text-xs text-gray-500 font-mono">{primaryIngredient.archetype}</p>
                                </div>
                                <button onClick={() => setPrimaryIngredient(null)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ) : (
                             <button onClick={() => setIngredientModalOpen(true)} className="w-full border-2 border-dashed border-slate-700 text-gray-500 font-semibold py-4 px-4 rounded-lg hover:bg-slate-800/50 hover:text-white hover:border-indigo-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={allIngredients.length === 0}>
                                {allIngredients.length > 0 ? 'Select Ingredient' : 'Load Ingredients Data First'}
                            </button>
                        )}
                    </GlassmorphicCard>

                     <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Technique & Parameters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">Technique</label>
                                <select onChange={handleTechniqueChange} value={selectedTechnique?.id || ''} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" disabled={allTechniques.length === 0}>
                                    <option value="" disabled>{allTechniques.length > 0 ? 'Select a technique...' : 'Load Techniques Data First'}</option>
                                    {allTechniques.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            {selectedTechnique && (
                                <div className="space-y-3 pt-3 border-t border-slate-800/50">
                                    {selectedTechnique.parameters.map(param => (
                                        <div key={param.name}>
                                            <label className="text-sm font-medium text-gray-400">{param.name} <span className="text-gray-500 text-xs">({param.unit})</span></label>
                                            {param.type === 'number' && <input type="number" value={param.value} onChange={e => handleParameterChange(param.name, e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />}
                                            {param.type === 'text' && <input type="text" value={param.value as string} onChange={e => handleParameterChange(param.name, e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />}
                                            {param.type === 'select' && (
                                                <select value={param.value as string} onChange={e => handleParameterChange(param.name, e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                                    {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <AiModeSelector selectedMode={analysisMode} onSelectMode={setAnalysisMode} />
                    </GlassmorphicCard>
                    
                    <div className="pb-8">
                         <button onClick={handleSubmit} disabled={isLoading || !primaryIngredient || !selectedTechnique} className="w-full flex items-center justify-center gap-3 bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 font-bold py-3 px-6 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-subtle-glow-indigo">
                            {isLoading ? (
                                <>
                                    <WaveformIcon className="w-6 h-6 animate-pulse" />
                                    <span>GENERATING PROTOCOL...</span>
                                </>
                            ) : (
                                 <>
                                    <WaveformIcon className="w-6 h-6" />
                                    <span>GENERATE EXPERIMENT</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16">
                     <GlassmorphicCard className="p-6 h-full flex flex-col">
                         <h2 className="text-2xl font-bold text-gray-100 mb-4 sticky top-0 bg-slate-900/40 backdrop-blur-sm py-2 z-10 border-b border-slate-800 -mx-6 px-6 uppercase tracking-wider">Experiment Protocol &amp; Prediction</h2>
                         <div className="overflow-y-auto flex-grow -mx-6 px-6">
                            {error && (
                                <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg my-4">
                                    <h4 className="font-bold">Analysis Error</h4>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            )}
                            {!isLoading && !analysis && !error && (
                                <div className="text-center text-gray-600 pt-16 flex flex-col items-center justify-center h-full">
                                    <WaveformIcon className="w-20 h-20 mx-auto mb-4 opacity-10" />
                                    <p className="font-semibold text-lg">Protocol Awaiting Input</p>
                                    <p>Design your experiment and generate the protocol.</p>
                                </div>
                            )}
                            <div className="mt-4">
                                <SimpleMarkdownRenderer content={analysis} />
                                {isLoading && <div className="inline-block w-2 h-2 ml-1 bg-indigo-300 rounded-full animate-pulse"></div>}
                            </div>
                        </div>
                     </GlassmorphicCard>
                </div>
            </div>

            {isIngredientModalOpen && (
                <IngredientSelectModal
                    isOpen={isIngredientModalOpen}
                    onClose={() => setIngredientModalOpen(false)}
                    onSelect={handleSelectIngredient}
                    ingredients={allIngredients}
                    existingIds={primaryIngredient ? [primaryIngredient.id] : []}
                    categories={[...new Set(allIngredients.map(i => i.type))].sort()}
                />
            )}
        </div>
    );
};

export default GastronomyLabView;
