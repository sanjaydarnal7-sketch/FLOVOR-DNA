
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  COMPONENT_DATABASE = 'COMPONENT_DATABASE',
  SYNTHESIS_LAB = 'SYNTHESIS_LAB',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  FLAVOUR_LAB = 'FLAVOUR_LAB',
  INGREDIENT_DATABASE = 'INGREDIENT_DATABASE',
}

// A set of example descriptors for components. In a real app, this could be user-configurable.
export enum Descriptor {
    FOUNDATIONAL = 'foundational',
    INCREMENTAL = 'incremental',
    DISRUPTIVE = 'disruptive',
    THEORETICAL = 'theoretical',
    APPLIED = 'applied',
    DATA_DRIVEN = 'data-driven',
    QUALITATIVE = 'qualitative',
    EMERGING = 'emerging',
    ESTABLISHED = 'established',
    INTERDISCIPLINARY = 'interdisciplinary',
}

export type AiAnalysisMode = 'standard' | 'deep' | 'grounded';

export interface Component {
  id: string;
  name: string;
  category: string;
  
  // Core quantifiable metrics (generic, 0-10 scale)
  impact: number;
  novelty: number;
  feasibility: number;
  complexity: number;

  descriptors: Descriptor[];
  
  // Bias sliders (0-10 scale for components)
  abstractConcreteBias: number; // 0=Abstract, 10=Concrete
  theoreticalAppliedBias: number; // 0=Theoretical, 10=Applied
  
  // Other info
  abstract: string;
  sourceURL: string;
}

export interface SynthesisProfile {
    // Target metrics (0-10 scale)
    targetImpact: number;
    targetNovelty: number;
    targetFeasibility: number;
    targetComplexity: number;
    
    // Target biases (-5 to +5 scale)
    targetAbstractConcreteBias: number; // -5 (Abstract) to 5 (Concrete)
    targetTheoreticalAppliedBias: number; // -5 (Theoretical) to 5 (Applied)
    
    // Additional conceptual dimensions (0-10 scale)
    synergy: number;
    risk: number;
    
    // High-level goal
    researchObjective: string;
}

export interface IngredientDNA {
    acids: number;
    sugars: number;
    bitterness: number;
    aromatics: number;
    aldehydes: number;
    esters: number;
    umami: number;
    texture: number;
    water_content: number;
}

export interface Ingredient {
  id: string;
  name: string;
  type: string;
  subcategory: string;
  archetype: string;
  dna: IngredientDNA;
  notes: string;
  origin: string;
  seasonality: string;
  state: string;
}


export interface FlavourDNAProfile {
    targetAcidity: number;
    targetSweetness: number;
    targetBitterness: number;
    targetUmami: number;
    targetAromaticIntensity: number;
    targetTexture: number;
    balance: number;
    complexity: number;
    objective: string;
}