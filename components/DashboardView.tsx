
import React from 'react';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { INITIAL_COMPONENTS, BeakerIcon, DatabaseIcon, SynthesisIcon, CheckIcon, LoadIcon } from '../constants';

// FIX: Specified that the icon prop is a React.ReactElement that accepts a className prop, resolving the TypeScript error with React.cloneElement.
const StatCard: React.FC<{ title: string; value: string; subValue: string; icon: React.ReactElement<{ className?: string }> }> = ({ title, value, subValue, icon }) => (
    <div className="p-4 bg-slate-900 rounded-lg border border-slate-700/50 transition-all hover:border-amber-400/50 hover:bg-slate-900 hover:-translate-y-1">
        <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400 font-mono tracking-wider uppercase">{title}</p>
            {React.cloneElement(icon, { className: 'w-6 h-6 text-amber-300/30' })}
        </div>
        <p className="text-3xl font-bold text-amber-300 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-mono">{subValue}</p>
    </div>
);


const DashboardView: React.FC = () => {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-100 mb-1 font-display uppercase flex items-center gap-3">
                    Dashboard
                </h2>
                <p className="text-gray-500 font-mono">{dateString}</p>
            </div>

            <div className="relative p-6 rounded-xl border border-slate-800 dashboard-card-bg">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard title="Total Components" value={INITIAL_COMPONENTS.length.toString()} subValue="In Database" icon={<DatabaseIcon />} />
                    <StatCard title="Syntheses Run" value="42" subValue="Last 30 Days" icon={<SynthesisIcon />} />
                    <StatCard title="Saved Profiles" value="12" subValue="Synthesis & Flavour" icon={<LoadIcon />} />
                    <StatCard title="AI Engine Status" value="Online" subValue="All Systems Go" icon={<CheckIcon />} />
                </div>
            </div>

            <GlassmorphicCard className="p-6 rounded-xl border border-slate-800 dashboard-card-bg">
                <div className="flex items-start gap-4">
                    <BeakerIcon className="w-8 h-8 text-amber-300/80 flex-shrink-0 mt-1"/>
                    <div>
                        <h3 className="text-lg font-bold text-gray-200 uppercase tracking-wider">Acknowledgements</h3>
                        <p className="text-gray-400 mt-2">
                            This platform is dedicated to the pioneering work of my co-founder at <strong className="font-semibold text-amber-300/90">Craftsmen & Co Bar Consultancy</strong>, <strong className="font-semibold text-amber-300/90">Sanjay Darnal</strong>. 
                            His expertise as a <strong className="font-semibold text-amber-300/90">Liquid Engineer</strong> has been fundamental to the principles behind the Flavour DNA engine.
                        </p>
                    </div>
                </div>
            </GlassmorphicCard>
        </div>
    );
};

export default DashboardView;
