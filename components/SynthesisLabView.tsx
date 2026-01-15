
import React, { useState, useCallback, useEffect } from 'react';
import { SynthesisProfile, Component, AiAnalysisMode } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';
import SciFiSlider from './ui/SciFiSlider';
import { INITIAL_COMPONENTS, TrashIcon, WaveformIcon, NetworkIntelligenceIcon, GoogleIcon } from '../constants';
import { getSynthesisAnalysisStream } from '../services/geminiService';
import ComponentSelectModal from './ComponentSelectModal';

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
                                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
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
                    return <h3 key={index} className="text-cyan-300 font-bold mt-4 mb-2 text-lg font-sans">{line.substring(4)}</h3>;
                }
                 if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ')) {
                    const boldEnd = line.indexOf('**', 2);
                    if (line.startsWith('**') && boldEnd !== -1) {
                         return <p key={index} className="my-2"><strong className="text-cyan-300 mr-2 font-semibold font-sans">{line.substring(2, boldEnd)}</strong>{line.substring(boldEnd + 2)}</p>;
                    }
                    const parts = line.split(':');
                     return <p key={index} className="my-2"><strong className="text-cyan-300 mr-2 font-semibold font-sans">{parts[0]}:</strong>{parts.slice(1).join(':')}</p>;
                }
                if (line.startsWith('**')) {
                    const parts = line.split('**');
                    return <p key={index} className="my-1"><strong className="text-cyan-300 font-semibold font-sans">{parts[1]}</strong>{parts[2]}</p>;
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

const SynthesisLabView: React.FC = () => {
    const [profile, setProfile] = useState<SynthesisProfile>({
        targetImpact: 5,
        targetNovelty: 5,
        targetFeasibility: 5,
        targetComplexity: 5,
        targetAbstractConcreteBias: 0,
        targetTheoreticalAppliedBias: 0,
        synergy: 3,
        risk: 2,
        researchObjective: 'Develop a novel, interdisciplinary approach to...',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AiAnalysisMode>('standard');

    const [composition, setComposition] = useState<{ componentId: string; weight: number }[]>([]);
    const [isComponentModalOpen, setComponentModalOpen] = useState(false);
    
    const allComponents = INITIAL_COMPONENTS;
    const allCategories = [...new Set(allComponents.map(i => i.category))].sort();

    useEffect(() => {
        const calculateCompositionDNA = () => {
            const composedItems = composition
                .map(item => ({
                    ...(allComponents.find(c => c.id === item.componentId) as Component),
                    weight: item.weight
                }))
                .filter(item => item.id);
            
            if (composedItems.length === 0) return;

            const totalWeight = composedItems.reduce((sum, item) => sum + item.weight, 0);
            if (totalWeight === 0) return;

            const newProfile: Partial<SynthesisProfile> = {};

            const weightedAverage = (key: keyof Component) => {
                return composedItems.reduce((sum, item) => sum + ((item[key] as number) * item.weight), 0) / totalWeight;
            };
            
            const weightedAverageBias = (key: 'abstractConcreteBias' | 'theoreticalAppliedBias') => {
                const value = weightedAverage(key);
                return value - 5; // Map from component's [0, 10] scale to profile's [-5, 5] scale
            };
            
            newProfile.targetImpact = weightedAverage('impact');
            newProfile.targetNovelty = weightedAverage('novelty');
            newProfile.targetFeasibility = weightedAverage('feasibility');
            newProfile.targetComplexity = weightedAverage('complexity');
            
            newProfile.targetAbstractConcreteBias = weightedAverageBias('abstractConcreteBias');
            newProfile.targetTheoreticalAppliedBias = weightedAverageBias('theoreticalAppliedBias');
            
            setProfile(prev => ({
                ...prev,
                ...newProfile
            }));
        };

        calculateCompositionDNA();
    }, [composition, allComponents]);

    const handleAddComponent = (component: Component) => {
        if (!composition.some(item => item.componentId === component.id)) {
            setComposition(prev => [...prev, { componentId: component.id, weight: 50 }]);
        }
        setComponentModalOpen(false);
    };

    const handleRemoveComponent = (componentId: string) => {
        setComposition(prev => prev.filter(item => item.componentId !== componentId));
    };

    const handleWeightChange = (componentId: string, value: string) => {
        setComposition(prev => prev.map(item => item.componentId === componentId ? { ...item, weight: Number(value) } : item));
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
            const stream = await getSynthesisAnalysisStream(profile, analysisMode);
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
    }, [profile, analysisMode]);

    const totalWeight = composition.reduce((sum, item) => sum + item.weight, 0);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Builder Section */}
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="sticky top-0 pt-4 bg-[#020617]/80 backdrop-blur-sm z-10">
                        <h2 className="text-3xl font-bold text-gray-100 mb-2">Synthesis Lab</h2>
                        <p className="text-gray-400 mb-6">Engineer a target research profile. The engine will predict outcomes and explain the logic.</p>
                    </div>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2 mb-4">Composition Canvas</h3>
                        <div className="space-y-4">
                            {composition.map(item => {
                                const component = allComponents.find(c => c.id === item.componentId);
                                if (!component) return null;
                                const percentage = totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0;

                                return (
                                    <div key={item.componentId} className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-lg">
                                        <div className="w-1/3">
                                            <span className="font-semibold text-gray-300 truncate block" title={component.name}>{component.name}</span>
                                            <span className="text-xs text-cyan-400 font-mono">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-2/3">
                                            <SciFiSlider
                                                label=""
                                                name={`weight-${item.componentId}`}
                                                value={item.weight}
                                                min={0}
                                                max={100}
                                                step={1}
                                                onChange={(e) => handleWeightChange(item.componentId, e.target.value)}
                                            />
                                        </div>
                                        <button onClick={() => handleRemoveComponent(item.componentId)} className="text-gray-500 hover:text-red-500">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                         <div className="mt-4">
                            <button onClick={() => setComponentModalOpen(true)} className="w-full flex items-center justify-center gap-2 border border-slate-700 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                                <PlusIcon className="w-5 h-5"/>
                                Add Component
                            </button>
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2 mb-4">Core Metrics (Calculated)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <SciFiSlider label="Impact" name="targetImpact" value={Math.round(profile.targetImpact * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                            <SciFiSlider label="Novelty" name="targetNovelty" value={Math.round(profile.targetNovelty * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                            <SciFiSlider label="Feasibility" name="targetFeasibility" value={Math.round(profile.targetFeasibility * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                            <SciFiSlider label="Complexity" name="targetComplexity" value={Math.round(profile.targetComplexity * 10) / 10} min={0} max={10} onChange={handleSliderChange} />
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2 mb-4">Conceptual Bias (Calculated)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <SciFiSlider label="Conceptual Bias" name="targetAbstractConcreteBias" value={Math.round(profile.targetAbstractConcreteBias * 10) / 10} min={-5} max={5} minLabel="Abstract" maxLabel="Concrete" onChange={handleSliderChange} />
                            <SciFiSlider label="Methodological Bias" name="targetTheoreticalAppliedBias" value={Math.round(profile.targetTheoreticalAppliedBias * 10) / 10} min={-5} max={5} minLabel="Theoretical" maxLabel="Applied" onChange={handleSliderChange} />
                        </div>
                    </GlassmorphicCard>
                    
                     <GlassmorphicCard className="p-6">
                        <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2 mb-4">Synthesis Parameters</h3>
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <SciFiSlider label="Synergy Potential" name="synergy" value={profile.synergy} min={0} max={10} onChange={handleSliderChange} />
                                <SciFiSlider label="Risk Factor" name="risk" value={profile.risk} min={0} max={10} onChange={handleSliderChange} />
                            </div>
                            <div>
                                 <label className="text-sm font-medium text-gray-400 tracking-wider mb-1 block">Research Objective</label>
                                <input type="text" name="researchObjective" value={profile.researchObjective} onChange={handleInputChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition" />
                            </div>
                            <AiModeSelector selectedMode={analysisMode} onSelectMode={setAnalysisMode} />
                        </div>
                    </GlassmorphicCard>

                    <div className="pb-8">
                         <button onClick={handleSubmit} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 font-bold py-3 px-6 rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-subtle-glow">
                            {isLoading ? (
                                <>
                                    <WaveformIcon className="w-6 h-6 animate-pulse" />
                                    <span>ANALYZING SYNTHESIS...</span>
                                </>
                            ) : (
                                 <>
                                    <WaveformIcon className="w-6 h-6" />
                                    <span>RUN SYNTHESIS ANALYSIS</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16">
                     <GlassmorphicCard className="p-6 h-full flex flex-col">
                         <h2 className="text-2xl font-bold text-gray-100 mb-4 sticky top-0 bg-slate-900/40 backdrop-blur-sm py-2 z-10 border-b border-slate-800 -mx-6 px-6 font-sans">Synthesis Engine Output</h2>
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
                                {isLoading && <div className="inline-block w-2 h-2 ml-1 bg-cyan-300 rounded-full animate-pulse"></div>}
                            </div>
                        </div>
                     </GlassmorphicCard>
                </div>
            </div>
            
            {isComponentModalOpen && (
                <ComponentSelectModal
                    isOpen={isComponentModalOpen}
                    onClose={() => setComponentModalOpen(false)}
                    onSelect={handleAddComponent}
                    components={allComponents}
                    existingIds={composition.map(item => item.componentId)}
                    categories={allCategories}
                />
            )}
        </>
    );
};

export default SynthesisLabView;