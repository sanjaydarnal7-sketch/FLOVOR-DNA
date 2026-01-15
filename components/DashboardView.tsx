import React from 'react';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { INITIAL_COMPONENTS } from '../constants';

const StatCard: React.FC<{ title: string; value: string; subValue: string; }> = ({ title, value, subValue }) => (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 transition-all hover:border-amber-400/50 hover:bg-slate-900">
        <p className="text-sm text-gray-400 font-mono tracking-wider">{title}</p>
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
                <h2 className="text-3xl font-bold text-gray-100 mb-1 font-sans flex items-center gap-3">
                    Dashboard
                </h2>
                <p className="text-gray-500 font-mono">{dateString}</p>
            </div>

            <div className="relative p-6 rounded-xl border border-slate-800 dashboard-card-bg">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard title="Total Components" value={INITIAL_COMPONENTS.length.toString()} subValue="In Database" />
                    <StatCard title="Syntheses Run" value="42" subValue="Last 30 Days" />
                    <StatCard title="Active Profiles" value="3" subValue="Saved Syntheses" />
                    <StatCard title="AI Engine Status" value="Online" subValue="Synthesis Engine" />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;