import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CordialSpecificationProfile, AiAnalysisMode, SavedCordialProduct, Ingredient } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';
import SciFiSlider from './ui/SciFiSlider';
import { WaveformIcon, NetworkIntelligenceIcon, GoogleIcon, LoadIcon, TrashIcon, GenerateIcon } from '../constants';
import { getCordialRecipeStream, generateCordialProfileFromObjective } from '../services/geminiService';
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


// A simple markdown-like renderer
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-indigo-300 font-bold mt-4 mb-2 text-lg uppercase tracking-wider">{line.substring(4)}</h3>;
                }
                 if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') || line.startsWith('*   **') || line.startsWith('- **')) {
                    const boldEnd = line.indexOf('**:', 2);
                    if (boldEnd !== -1) {
                         const startIdx = line.indexOf('**');
                         return <p key={index} className="my-2"><strong className="text-indigo-300 mr-2 font-semibold">{line.substring(startIdx + 2, boldEnd)}</strong>{line.substring(boldEnd + 3)}</p>;
                    }
                    const parts = line.split(':');
                     return <p key={index} className="my-2"><strong className="text-indigo-300 mr-2 font-semibold">{parts[0]}:</strong>{parts.slice(1).join(':')}</p>;
                }
                if (line.startsWith('**')) {
                    const parts = line.split('**');
                    return <p key={index} className="my-1"><strong className="text-indigo-300 font-semibold">{parts[1]}</strong>{parts[2]}</p>;
                }
                return <p key={index} className="my-1 text-gray-400">{line}</p>;
            })}
        </div>
    );
};

const HistoryCard: React.FC<{ product: SavedCordialProduct, onLoad: () => void, onDelete: () => void, isNew?: boolean }> = ({ product, onLoad, onDelete, isNew }) => (
    <GlassmorphicCard className={`p-4 flex flex-col justify-between gap-3 interactive-card ${isNew ? 'animate-highlight' : ''}`}>
        <div>
            <h3 className="text-md font-bold text-indigo-300 truncate">{product.name}</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">
                {new Date(product.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="text-xs mt-3 space-y-1 text-gray-400 border-t border-slate-700/50 pt-2">
                <p>pH: {product.profile.target_pH.toFixed(2)}</p>
                <p>Sharpness: {product.profile.sharpness}</p>
                <p>Sweetness: {product.profile.sweet_body}</p>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
            <button onClick={onDelete} className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-700/50 transition-colors" aria-label="Delete product"><TrashIcon className="w-5 h-5"/></button>
            <button onClick={onLoad} className="text-gray-500 hover:text-indigo-400 p-1.5 rounded-full hover:bg-slate-700/50 transition-colors" aria-label="Load product"><LoadIcon className="w-5 h-5"/></button>
        </div>
    </GlassmorphicCard>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const CordialEngineerView: React.FC = () => {
    const [profile, setProfile] = useState<CordialSpecificationProfile>({
        base_identity: 'Green Apple Cordial',
        objective: 'Create a crisp, refreshing, and thirst-quenching green apple cordial.',
        volume_ml: 1000,
        sharpness: 80,
        juiciness: 20,
        dryness: 5,
        sweet_body: 60,
        texture: 10,
        flavour_pop: 10,
        fresh_cut: 8,
        aroma_bias: 30, // Leaning fruity
        target_pH: 3.0,
        constraints: ['clear liquid', 'non-alcoholic'],
        explain_for_training: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [synthesisRationale, setSynthesisRationale] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AiAnalysisMode>('standard');
    const [history, setHistory] = useState<SavedCordialProduct[]>([]);
    const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null);
    const [composition, setComposition] = useState<{ ingredientId: string; weight: number }[]>([]);
    const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('cordialHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('cordialHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [history]);
    
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

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
         if (type === 'checkbox') {
            setProfile(prev => ({ ...prev, [name]: checked }));
        } else {
            setProfile(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
        }
    };

    const handleConstraintsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const constraintsArray = value.split(',').map(c => c.trim()).filter(c => c);
        setProfile(prev => ({ ...prev, constraints: constraintsArray }));
    };

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

    const handleSynthesizeProfile = useCallback(async () => {
        setIsSynthesizing(true);
        setSynthesisRationale('');
        setError(null);
        try {
            const result = await generateCordialProfileFromObjective(profile.objective, compositionIngredients);
            setProfile(prev => ({ ...prev, ...result.profile }));
            setSynthesisRationale(result.rationale);
        } catch (err) {
            console.error(err);
            const userFriendlyError = 'Failed to synthesize profile from objective. The model may have returned an unexpected format. Please try again.';
            setError(userFriendlyError);
        } finally {
            setIsSynthesizing(false);
        }
    }, [profile.objective, compositionIngredients]);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        setAnalysis('');
        setError(null);
        try {
            const stream = await getCordialRecipeStream(profile, compositionIngredients, analysisMode);
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
    }, [profile, analysisMode, compositionIngredients]);

     const handleSaveProduct = () => {
        const productName = window.prompt("Enter a name for this product:", profile.base_identity);
        if (productName && productName.trim() !== "") {
            const newProduct: SavedCordialProduct = {
                id: uuidv4(),
                name: productName.trim(),
                profile: profile,
                composition: composition,
                recipe: analysis,
                savedAt: new Date().toISOString(),
            };
            setHistory(prev => [newProduct, ...prev]);
            setRecentlySavedId(newProduct.id);
        }
    };

    const handleLoadProduct = (productId: string) => {
        const productToLoad = history.find(p => p.id === productId);
        if (productToLoad) {
            setProfile(productToLoad.profile);
            setComposition(productToLoad.composition || []);
            setAnalysis(productToLoad.recipe);
            setSynthesisRationale(''); // Clear previous rationale when loading
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDeleteProduct = (productId: string) => {
        if (window.confirm("Are you sure you want to delete this saved product?")) {
            setHistory(prev => prev.filter(p => p.id !== productId));
        }
    };

    const totalWeight = composition.reduce((sum, item) => sum + item.weight, 0);

    return (
        <div className="theme-flavour">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Builder Section */}
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="sticky top-0 pt-4 bg-[#020617]/80 backdrop-blur-sm z-10">
                        <h2 className="text-3xl font-bold text-gray-100 mb-2 font-display uppercase">Cordial Engineer</h2>
                        <p className="text-gray-400 mb-8">Define a target sensory profile. The engine will generate a professional recipe.</p>
                    </div>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Identity & Objective</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                 <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">Base Identity</label>
                                <input type="text" name="base_identity" value={profile.base_identity} onChange={handleInputChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                            </div>
                             <div>
                                 <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">Volume (mL)</label>
                                <input type="number" name="volume_ml" value={profile.volume_ml} onChange={handleInputChange} min="50" max="20000" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                            </div>
                        </div>
                         <div className="mt-4">
                            <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">Objective</label>
                            <input type="text" name="objective" value={profile.objective} onChange={handleInputChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </div>
                    </GlassmorphicCard>

                     <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Ingredient Composition</h3>
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
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Core Perception DNA</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <SciFiSlider label="Sharpness (Malic)" name="sharpness" value={profile.sharpness} min={0} max={100} step={1} onChange={handleSliderChange} />
                            <SciFiSlider label="Juiciness (Citric)" name="juiciness" value={profile.juiciness} min={0} max={100} step={1} onChange={handleSliderChange} />
                            <SciFiSlider label="Sweet Body" name="sweet_body" value={profile.sweet_body} min={0} max={100} step={1} onChange={handleSliderChange} />
                            <SciFiSlider label="Texture" name="texture" value={profile.texture} min={0} max={100} step={1} onChange={handleSliderChange} />
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Fine-Tuning & Aromatics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <SciFiSlider label="Dryness (Tartaric)" name="dryness" value={profile.dryness} min={0} max={30} step={1} onChange={handleSliderChange} />
                             <SciFiSlider label="Flavour Pop (Salt)" name="flavour_pop" value={profile.flavour_pop} min={0} max={20} step={1} onChange={handleSliderChange} />
                             <SciFiSlider label="Fresh Cut Illusion" name="fresh_cut" value={profile.fresh_cut} min={0} max={15} step={1} onChange={handleSliderChange} />
                             <SciFiSlider label="Aroma Bias" name="aroma_bias" value={profile.aroma_bias} min={-50} max={50} step={1} onChange={handleSliderChange} minLabel="Herbal" maxLabel="Fruity" />
                        </div>
                    </GlassmorphicCard>
                    
                     <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-indigo-300 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">Technical Parameters & AI</h3>
                        <div className="space-y-4">
                            <SciFiSlider label="Target pH" name="target_pH" value={profile.target_pH} min={2.6} max={3.4} step={0.01} onChange={handleSliderChange} />
                            <div>
                                <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block uppercase">Constraints</label>
                                <input type="text" name="constraints" value={profile.constraints.join(', ')} onChange={handleConstraintsChange} placeholder="e.g., clear liquid, non-alcoholic" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                            </div>
                             <div className="flex items-center gap-3">
                                <input type="checkbox" id="explain" name="explain_for_training" checked={profile.explain_for_training} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                                <label htmlFor="explain" className="text-sm text-gray-300">Include educational explanations in output</label>
                            </div>
                            <AiModeSelector selectedMode={analysisMode} onSelectMode={setAnalysisMode} />
                        </div>
                    </GlassmorphicCard>

                    <div className="pb-8 space-y-4">
                        <button onClick={handleSynthesizeProfile} disabled={isLoading || isSynthesizing} className="w-full flex items-center justify-center gap-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSynthesizing ? (
                                <>
                                    <GenerateIcon className="w-6 h-6 animate-spin" />
                                    <span>SYNTHESIZING PROFILE...</span>
                                </>
                            ) : (
                                <>
                                    <GenerateIcon className="w-6 h-6" />
                                    <span>SYNTHESIZE PROFILE FROM OBJECTIVE</span>
                                </>
                            )}
                        </button>
                         <button onClick={handleSubmit} disabled={isLoading || isSynthesizing} className="w-full flex items-center justify-center gap-3 bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 font-bold py-3 px-6 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-subtle-glow-indigo">
                            {isLoading ? (
                                <>
                                    <WaveformIcon className="w-6 h-6 animate-pulse" />
                                    <span>ENGINEERING RECIPE...</span>
                                </>
                            ) : (
                                 <>
                                    <WaveformIcon className="w-6 h-6" />
                                    <span>GENERATE RECIPE</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16">
                     <GlassmorphicCard className="p-6 h-full flex flex-col">
                         <div className="flex-shrink-0 flex justify-between items-center border-b border-slate-800 -mx-6 px-6 pb-4 mb-4">
                            <h2 className="text-2xl font-bold text-gray-100 uppercase tracking-wider">Perception Engine Output</h2>
                            <button 
                                onClick={handleSaveProduct} 
                                disabled={!analysis || isLoading}
                                className="bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 font-semibold py-1.5 px-4 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                            >
                                Save Product
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-shrink-0" style={{maxHeight: "35vh"}}>
                            {error && (
                                <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg my-4">
                                    <h4 className="font-bold">Analysis Error</h4>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            )}
                            
                            {synthesisRationale && (
                                <div className="mb-6 p-4 bg-slate-900/60 rounded-lg border border-slate-700/80">
                                    <SimpleMarkdownRenderer content={synthesisRationale} />
                                    {isSynthesizing && <div className="inline-block w-2 h-2 ml-1 bg-indigo-300 rounded-full animate-pulse"></div>}
                                </div>
                            )}

                            {!isLoading && !analysis && !error && !synthesisRationale && (
                                <div className="text-center text-gray-600 pt-16 flex flex-col items-center justify-center h-full">
                                    <WaveformIcon className="w-20 h-20 mx-auto mb-4 opacity-10" />
                                    <p className="font-semibold text-lg">Recipe Awaiting Specification</p>
                                    <p>Define a profile and generate the recipe.</p>
                                </div>
                            )}
                            <div>
                                <SimpleMarkdownRenderer content={analysis} />
                                {isLoading && <div className="inline-block w-2 h-2 ml-1 bg-indigo-300 rounded-full animate-pulse"></div>}
                            </div>
                        </div>

                        <div className="border-t border-slate-700 my-4 -mx-6 flex-shrink-0"></div>

                        <div className="flex-grow flex flex-col min-h-0">
                            <h3 className="text-lg font-bold text-gray-100 mb-4 font-display uppercase flex-shrink-0">Saved Products</h3>
                            <div className="flex-grow overflow-y-auto pr-2">
                                {history.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        No saved products yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {history.map(product => (
                                            <HistoryCard 
                                                key={product.id} 
                                                product={product}
                                                onLoad={() => handleLoadProduct(product.id)}
                                                onDelete={() => handleDeleteProduct(product.id)}
                                                isNew={product.id === recentlySavedId}
                                            />
                                        ))}
                                    </div>
                                )}
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
        </div>
    );
};

export default CordialEngineerView;