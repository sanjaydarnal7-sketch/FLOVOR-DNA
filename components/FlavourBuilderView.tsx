
import React, { useState, useCallback, useEffect } from 'react';
import { FlavourDNAProfile, Ingredient, AiAnalysisMode } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';
import SciFiSlider from './ui/SciFiSlider';
import { TrashIcon, WaveformIcon, NetworkIntelligenceIcon, GoogleIcon } from '../constants';
import { getFlavourAnalysisStream } from '../services/geminiService';
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
            <label className="text-sm font-medium text-gray-400 tracking-wider mb-2 block">AI Analysis Mode</label>
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


// A simple markdown-like renderer
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 font-sans">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-indigo-300 font-bold mt-4 mb-2 text-lg font-sans">{line.substring(4)}</h3>;
                }
                 if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ')) {
                    const boldEnd = line.indexOf('**', 2);
                    if (line.startsWith('**') && boldEnd !== -1) {
                         return <p key={index} className="my-2"><strong className="text-indigo-300 mr-2 font-semibold font-sans">{line.substring(2, boldEnd)}</strong>{line.substring(boldEnd + 2)}</p>;
                    }
                    const parts = line.split(':');
                     return <p key={index} className="my-2"><strong className="text-indigo-300 mr-2 font-semibold font-sans">{parts[0]}:</strong>{parts.slice(1).join(':')}</p>;
                }
                if (line.startsWith('**')) {
                    const parts = line.split('**');
                    return <p key={index} className="my-1"><strong className="text-indigo-300 font-semibold font-sans">{parts[1]}</strong>{parts[2]}</p>;
                }
                return <p key={index} className="my-1 text-gray-400">{line}</p>;
            })}
        </div>
    );
};

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const FlavourBuilderView: React.FC = () => {
    const [profile, setProfile] = useState<FlavourDNAProfile>({
        targetAcidity: 5,
        targetSweetness: 5,
        targetBitterness: 2,
        targetUmami: 1,
        targetAromaticIntensity: 5,
        targetTexture: 5,
        balance: 5,
        complexity: 3,
        objective: 'Create a refreshing and complex non-alcoholic beverage.',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AiAnalysisMode>('standard');
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

    const [composition, setComposition] = useState<{ ingredientId: string; weight: number }[]>([]);
    const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
    
    useEffect(() => {
        fetch('data/ingredients.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => setAllIngredients(data as Ingredient[]))
            .catch(error => console.error("Failed to fetch ingredients:", error));
    }, []);

    const allCategories = [...new Set(allIngredients.map(i => i.type))].sort();

    const compositionIngredients = composition
        .map(item => allIngredients.find(c => c.id === item.ingredientId))
        .filter((c): c is Ingredient => !!c);

    useEffect(() => {
        const calculateCompositionDNA = () => {
            if (compositionIngredients.length === 0) return;

            const totalWeight = composition.reduce((sum, item) => sum + item.weight, 0);
            if (totalWeight === 0) return;

            const newProfile: Partial<FlavourDNAProfile> = {};

            const weightedAverage = (key: keyof Ingredient['dna']) => {
                 return compositionIngredients.reduce((sum, item) => {
                    const weight = composition.find(c => c.ingredientId === item.id)?.weight || 0;
                    return sum + (item.dna[key] * weight);
                }, 0) / totalWeight;
            };
            
            newProfile.targetAcidity = weightedAverage('acids');
            newProfile.targetSweetness = weightedAverage('sugars');
            newProfile.targetBitterness = weightedAverage('bitterness');
            newProfile.targetUmami = weightedAverage('umami');
            newProfile.targetAromaticIntensity = weightedAverage('aromatics');
            newProfile.targetTexture = weightedAverage('texture');
            
            setProfile(prev => ({
                ...prev,
                ...newProfile
            }));
        };

        calculateCompositionDNA();
    }, [composition, compositionIngredients]);

    const handleAddIngredient = (ingredient: Ingredient) => {
        if (!composition.some(item => item.ingredientId === ingredient.id)) {
            setComposition(prev => [...prev, { ingredientId: ingredient.id, weight: 50 }]);
        }
        setIngredientModalOpen(false);
    };

    const handleRemoveIngredient = (ingredientId: string) => {
        setComposition(prev => prev.filter(item => item.ingredientId !== ingredientId));
    };

    const handleWeightChange = (ingredientId: string, value: string) => {
        setComposition(prev => prev.map(item => item.ingredientId === ingredientId ? { ...item, weight: Number(value) } : item));
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        setAnalysis('');
        setError(null);
        try {
            const stream = await getFlavourAnalysisStream(profile, compositionIngredients, analysisMode);
            for await (const chunk of stream) {
                setAnalysis(prev => prev + chunk);
            }
        } catch (err) {
            console.error(err);
            let userFriendlyError = 'An unexpected error occurred during analysis.';
            const errorMessage = String(err).toLowerCase();
            if (errorMessage.includes('api key')) {
                userFriendlyError = 'API Key Error: Please ensure your API key is valid and correctly configured.';
            } else if (errorMessage.includes('quota')) {
                userFriendlyError = 'Quota Exceeded: You have exceeded your request limit. Please check your usage and billing information.';
            } else if (errorMessage.includes('network') || errorMessage.includes('failed to fetch')) {
                userFriendlyError = 'Network Error: Could not connect to the server. Please check your internet connection.';
            } else {
                userFriendlyError = 'Analysis Failed: The model could not process the request. Please try adjusting the parameters or try again later.';
            }
            setError(userFriendlyError);
        } finally {
            setIsLoading(false);
        }
    }, [profile, compositionIngredients, analysisMode]);

    const totalWeight = composition.reduce((sum, item) => sum + item.weight, 0);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Builder Section */}
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="sticky top-0 pt-4 bg-[#020617]/80 backdrop-blur-sm z-10">
                        <h2 className="text-3xl font-bold text-gray-100 mb-2">Flavour Builder</h2>
                        <p className="text-gray-400 mb-6">Engineer a target flavour profile. The engine will predict the sensory outcome.</p>
                    </div>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4">Ingredient Blend</h3>
                        <div className="space-y-4">
                            {composition.map(item => {
                                const ingredient = allIngredients.find(c => c.id === item.ingredientId);
                                if (!ingredient) return null;
                                const percentage = totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0;

                                return (
                                    <div key={item.ingredientId} className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-lg">
                                        <div className="w-1/3">
                                            <span className="font-semibold text-gray-300 truncate block" title={ingredient.name}>{ingredient.name}</span>
                                            <span className="text-xs text-indigo-400 font-mono">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-2/3">
                                            <SciFiSlider
                                                label=""
                                                name={`weight-${item.ingredientId}`}
                                                value={item.weight}
                                                min={0}
                                                max={100}
                                                step={1}
                                                onChange={(e) => handleWeightChange(item.ingredientId, e.target.value)}
                                            />
                                        </div>
                                        <button onClick={() => handleRemoveIngredient(item.ingredientId)} className="text-gray-500 hover:text-red-500">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                         <div className="mt-4">
                            <button onClick={() => setIngredientModalOpen(true)} className="w-full flex items-center justify-center gap-2 border border-slate-700 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                                <PlusIcon className="w-5 h-5"/>
                                Add Ingredient
                            </button>
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4">Core Taste Profile (Calculated)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <SciFiSlider label="Acidity" name="targetAcidity" value={Math.round(profile.targetAcidity * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                            <SciFiSlider label="Sweetness" name="targetSweetness" value={Math.round(profile.targetSweetness * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                            <SciFiSlider label="Bitterness" name="targetBitterness" value={Math.round(profile.targetBitterness * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                            <SciFiSlider label="Umami" name="targetUmami" value={Math.round(profile.targetUmami * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4">Aromatics & Texture</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                             <SciFiSlider label="Aromatic Intensity" name="targetAromaticIntensity" value={profile.targetAromaticIntensity} min={0} max={10} onChange={handleSliderChange} />
                             <SciFiSlider label="Target Texture" name="targetTexture" value={profile.targetTexture} min={0} max={10} onChange={handleSliderChange} />
                        </div>
                    </GlassmorphicCard>
                    
                     <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4">Conceptual Goals</h3>
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                 <SciFiSlider label="Balance" name="balance" value={profile.balance} min={0} max={10} onChange={handleSliderChange} />
                                <SciFiSlider label="Complexity" name="complexity" value={profile.complexity} min={0} max={10} onChange={handleSliderChange} />
                            </div>
                            <div>
                                 <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block">Objective</label>
                                <input type="text" name="objective" value={profile.objective} onChange={handleInputChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                            </div>
                            <AiModeSelector selectedMode={analysisMode} onSelectMode={setAnalysisMode} />
                        </div>
                    </GlassmorphicCard>

                    <div className="pb-8">
                         <button onClick={handleSubmit} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 font-bold py-3 px-6 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-subtle-glow">
                            {isLoading ? (
                                <>
                                    <WaveformIcon className="w-6 h-6 animate-pulse" />
                                    <span>ANALYZING FLAVOUR...</span>
                                </>
                            ) : (
                                 <>
                                    <WaveformIcon className="w-6 h-6" />
                                    <span>RUN FLAVOUR ANALYSIS</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16">
                     <GlassmorphicCard className="p-6 h-full flex flex-col">
                         <h2 className="text-2xl font-bold text-gray-100 mb-4 sticky top-0 bg-slate-900/40 backdrop-blur-sm py-2 z-10 border-b border-slate-800 -mx-6 px-6 font-sans">Perception Engine Output</h2>
                         <div className="overflow-y-auto flex-grow -mx-6 px-6 font-mono">
                            {error && (
                                <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg my-4">
                                    <h4 className="font-bold font-sans">Analysis Error</h4>
                                    <p className="text-sm mt-1 font-sans">{error}</p>
                                </div>
                            )}
                            {!isLoading && !analysis && !error && (
                                <div className="text-center text-gray-600 pt-16 flex flex-col items-center justify-center h-full">
                                    <WaveformIcon className="w-20 h-20 mx-auto mb-4 opacity-10" />
                                    <p className="font-semibold text-lg font-sans">Analysis Awaiting Input</p>
                                    <p className="font-sans">Define a profile and run the engine.</p>
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
                    onSelect={handleAddIngredient}
                    ingredients={allIngredients}
                    existingIds={composition.map(item => item.ingredientId)}
                    categories={allCategories}
                />
            )}
        </>
    );
};

export default FlavourBuilderView;
