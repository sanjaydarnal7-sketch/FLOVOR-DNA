
import React, { useState } from 'react';
import { AppMode } from './types';
import { ResearchDnaIcon, DatabaseIcon, SynthesisIcon, DashboardIcon, VoiceIcon, FlavourIcon, MoleculeIcon } from './constants';
import ComponentDatabaseView from './components/ComponentDatabaseView';
import SynthesisLabView from './components/SynthesisLabView';
import DashboardView from './components/DashboardView';
import VoiceAssistantView from './components/VoiceAssistantView';
// FIX: Corrected import to match the actual component file name `FlavourBuilderView`.
import FlavourBuilderView from './components/FlavourBuilderView';
// FIX: Corrected import to match the actual component file name `IngredientDNAView`.
import IngredientDNAView from './components/IngredientDNAView';

const RESEARCH_MODES = [AppMode.SYNTHESIS_LAB, AppMode.COMPONENT_DATABASE];
const FLAVOUR_MODES = [AppMode.FLAVOUR_LAB, AppMode.INGREDIENT_DATABASE];

const TopBar: React.FC<{ activeMode: AppMode }> = ({ activeMode }) => {
  const isResearchMode = RESEARCH_MODES.includes(activeMode);
  const isFlavourMode = FLAVOUR_MODES.includes(activeMode);
  
  let title = "Synthesis Engine";
  let Icon = ResearchDnaIcon;
  let color = "text-cyan-400";
  let subtitle = "Dashboard";

  if (isResearchMode) {
    title = "Research DNA";
    Icon = ResearchDnaIcon;
    color = "text-cyan-400";
    subtitle = activeMode.replace('_', ' ');
  } else if (isFlavourMode) {
    title = "Flavour DNA";
    Icon = MoleculeIcon;
    color = "text-indigo-400";
    subtitle = activeMode.replace('_', ' ');
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/30 backdrop-blur-xl border-b border-slate-800 z-30 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <h1 className="text-xl font-bold text-gray-200 tracking-wider font-sans">
          {title}
        </h1>
      </div>
      <div className="font-mono text-sm text-gray-500 tracking-widest">
        {subtitle}
      </div>
    </header>
  );
};

const NavItem: React.FC<{
  // FIX: Changed icon type from `JSX.Element` to `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
  item: { mode: AppMode; label: string; icon: React.ReactElement };
  activeMode: AppMode;
  setMode: (mode: AppMode) => void;
  colorClass: string;
}> = ({ item, activeMode, setMode, colorClass }) => (
  <button
    onClick={() => setMode(item.mode)}
    className={`flex items-center justify-center lg:justify-start gap-4 pl-0 lg:pl-7 py-3 w-full text-left transition-all duration-300 relative ${
      activeMode === item.mode
        ? `${colorClass}`
        : 'text-gray-500 hover:bg-slate-800/60 hover:text-gray-300'
    }`}
  >
    {activeMode === item.mode && <div className={`absolute left-0 top-0 h-full w-1 bg-current shadow-[0_0_8px_currentColor]`}></div>}
    {item.icon}
    <span className="hidden lg:inline font-semibold tracking-wider text-base">{item.label}</span>
  </button>
);

const NavGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4">
        <h3 className="px-7 mb-2 text-xs font-bold text-gray-600 uppercase tracking-widest hidden lg:block">{title}</h3>
        {children}
    </div>
);


const ControlRail: React.FC<{ activeMode: AppMode; setMode: (mode: AppMode) => void }> = ({ activeMode, setMode }) => {
  const isFlavourActive = FLAVOUR_MODES.includes(activeMode);
  
  const dashboardItem = { mode: AppMode.DASHBOARD, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> };
  
  const researchNavItems = [
    { mode: AppMode.SYNTHESIS_LAB, label: 'Synthesis Lab', icon: <SynthesisIcon className="w-6 h-6" /> },
    { mode: AppMode.COMPONENT_DATABASE, label: 'Component DB', icon: <DatabaseIcon className="w-6 h-6" /> },
  ];

  const flavourNavItems = [
    { mode: AppMode.FLAVOUR_LAB, label: 'Flavour Lab', icon: <FlavourIcon className="w-6 h-6" /> },
    { mode: AppMode.INGREDIENT_DATABASE, label: 'Ingredient DB', icon: <MoleculeIcon className="w-6 h-6" /> },
  ];

  const voiceItem = { mode: AppMode.VOICE_ASSISTANT, label: 'Voice Assistant', icon: <VoiceIcon className="w-6 h-6" /> };

  return (
    <nav className="fixed top-16 left-0 w-20 lg:w-64 h-[calc(100vh-4rem)] bg-black/20 backdrop-blur-xl border-r border-slate-800 z-20 flex flex-col items-center lg:items-start pt-6">
      <div className="w-full">
        <NavItem item={dashboardItem} activeMode={activeMode} setMode={setMode} colorClass="text-gray-300"/>
        
        <NavGroup title="Research">
            {researchNavItems.map(item => (
              <NavItem key={item.mode} item={item} activeMode={activeMode} setMode={setMode} colorClass="text-cyan-300"/>
            ))}
        </NavGroup>

        <NavGroup title="Flavour">
            {flavourNavItems.map(item => (
              <NavItem key={item.mode} item={item} activeMode={activeMode} setMode={setMode} colorClass="text-indigo-300"/>
            ))}
        </NavGroup>
        
        <div className="mt-4 border-t border-slate-800/50 pt-4">
            <NavItem item={voiceItem} activeMode={activeMode} setMode={setMode} colorClass={isFlavourActive ? 'text-indigo-300' : 'text-cyan-300'}/>
        </div>

      </div>
    </nav>
  );
};


const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 font-sans relative overflow-hidden">
      <TopBar activeMode={mode} />
      <ControlRail activeMode={mode} setMode={setMode} />

      <main className="pl-20 lg:pl-64 pt-16 h-screen overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 relative z-10">
          {mode === AppMode.DASHBOARD && <DashboardView />}
          {mode === AppMode.COMPONENT_DATABASE && <ComponentDatabaseView />}
          {mode === AppMode.SYNTHESIS_LAB && <SynthesisLabView />}
          {mode === AppMode.VOICE_ASSISTANT && <VoiceAssistantView />}
          {mode === AppMode.FLAVOUR_LAB && <FlavourBuilderView />}
          {mode === AppMode.INGREDIENT_DATABASE && <IngredientDNAView />}
        </div>
      </main>
    </div>
  );
};

export default App;