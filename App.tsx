
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import { ResearchDnaIcon, DatabaseIcon, SynthesisIcon, DashboardIcon, VoiceIcon, FlavourIcon, MoleculeIcon, BeakerIcon, FlaskIcon, ClipboardListIcon, ListBulletIcon, FishIcon } from './constants';
import ComponentDatabaseView from './components/ComponentDatabaseView';
import SynthesisLabView from './components/SynthesisLabView';
import DashboardView from './components/DashboardView';
import VoiceAssistantView from './components/VoiceAssistantView';
import FlavourBuilderView from './components/FlavourBuilderView';
import IngredientDNAView from './components/IngredientDNAView';
import CordialEngineerView from './components/CordialEngineerView';
import GastronomyLabView from './components/GastronomyLabView';
import OnboardingGuide from './components/OnboardingGuide';
import RawMaterialsView from './components/RawMaterialsView';
import CropLibraryView from './components/CropLibraryView';
import AnimalProductsView from './components/AnimalProductsView';

const RESEARCH_MODES = [AppMode.SYNTHESIS_LAB, AppMode.COMPONENT_DATABASE];
const FLAVOUR_MODES = [AppMode.FLAVOUR_LAB, AppMode.INGREDIENT_DATABASE, AppMode.CORDIAL_ENGINEER, AppMode.GASTRONOMY_LAB, AppMode.RAW_MATERIALS_GUIDE, AppMode.CROP_LIBRARY, AppMode.ANIMAL_PRODUCTS_GUIDE];

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
    subtitle = activeMode.replace(/_/g, ' ');
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-slate-800 z-30 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <h1 className="text-xl font-bold text-gray-200 tracking-wider uppercase font-display">
          {title}
        </h1>
      </div>
      <div className="font-mono text-sm text-gray-500 tracking-widest uppercase">
        {subtitle}
      </div>
    </header>
  );
};

const NavItem: React.FC<{
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
    { mode: AppMode.FLAVOUR_LAB, label: 'Flavour Blender', icon: <FlavourIcon className="w-6 h-6" /> },
    { mode: AppMode.CORDIAL_ENGINEER, label: 'Cordial Engineer', icon: <BeakerIcon className="w-6 h-6" /> },
    { mode: AppMode.GASTRONOMY_LAB, label: 'Gastronomy Lab', icon: <FlaskIcon className="w-6 h-6" /> },
    { mode: AppMode.INGREDIENT_DATABASE, label: 'Ingredient DB', icon: <MoleculeIcon className="w-6 h-6" /> },
    { mode: AppMode.RAW_MATERIALS_GUIDE, label: 'Raw Materials', icon: <ClipboardListIcon className="w-6 h-6" /> },
    { mode: AppMode.ANIMAL_PRODUCTS_GUIDE, label: 'Animal Products', icon: <FishIcon className="w-6 h-6" /> },
    { mode: AppMode.CROP_LIBRARY, label: 'Crop Library', icon: <ListBulletIcon className="w-6 h-6" /> },
  ];

  const voiceItem = { mode: AppMode.VOICE_ASSISTANT, label: 'Voice Assistant', icon: <VoiceIcon className="w-6 h-6" /> };

  return (
    <nav className="fixed top-16 left-0 w-20 lg:w-64 h-[calc(100vh-4rem)] bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 z-20 flex flex-col items-center lg:items-start pt-6">
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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    try {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding');
        if (hasCompleted !== 'true') {
            setIsOnboardingOpen(true);
        }
    } catch (error) {
        console.error("Could not access localStorage:", error);
        // If localStorage is blocked, just show the onboarding
        setIsOnboardingOpen(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    try {
        localStorage.setItem('hasCompletedOnboarding', 'true');
    } catch (error) {
        console.error("Could not write to localStorage:", error);
    }
    setIsOnboardingOpen(false);
  };


  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 font-sans relative overflow-hidden">
      <OnboardingGuide isOpen={isOnboardingOpen} onClose={handleCloseOnboarding} />
      
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
          {mode === AppMode.CORDIAL_ENGINEER && <CordialEngineerView />}
          {mode === AppMode.GASTRONOMY_LAB && <GastronomyLabView />}
          {mode === AppMode.RAW_MATERIALS_GUIDE && <RawMaterialsView />}
          {mode === AppMode.CROP_LIBRARY && <CropLibraryView />}
          {mode === AppMode.ANIMAL_PRODUCTS_GUIDE && <AnimalProductsView />}
        </div>
      </main>
    </div>
  );
};

export default App;
