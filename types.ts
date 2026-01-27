
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  COMPONENT_DATABASE = 'COMPONENT_DATABASE',
  SYNTHESIS_LAB = 'SYNTHESIS_LAB',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  FLAVOUR_LAB = 'FLAVOUR_LAB',
  INGREDIENT_DATABASE = 'INGREDIENT_DATABASE',
  CORDIAL_ENGINEER = 'CORDIAL_ENGINEER',
  GASTRONOMY_LAB = 'GASTRONOMY_LAB',
  RAW_MATERIALS_GUIDE = 'RAW_MATERIALS_GUIDE',
  CROP_LIBRARY = 'CROP_LIBRARY',
  ANIMAL_PRODUCTS_GUIDE = 'ANIMAL_PRODUCTS_GUIDE',
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
  key_compounds: string[];
  potential_contaminants: string[];
  preservatives: string[];
  culinary_applications: string[];
}

export interface FlavourBlendProfile {
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

export interface SavedFlavourBlend {
    id: string;
    name: string;
    profile: FlavourBlendProfile;
    composition: { ingredientId: string; weight: number }[];
    analysis: string; // The generated markdown
    savedAt: string; // ISO date string
}

export interface CordialSpecificationProfile {
    base_identity: string;
    objective: string;
    volume_ml: number;
    sharpness: number;
    juiciness: number;
    dryness: number;
    sweet_body: number;
    texture: number;
    flavour_pop: number;
    fresh_cut: number;
    aroma_bias: number;
    target_pH: number;
    constraints: string[];
    explain_for_training: boolean;
}

export interface SavedCordialProduct {
    id: string;
    name: string;
    profile: CordialSpecificationProfile;
    composition: { ingredientId: string; weight: number }[];
    recipe: string; // The generated markdown
    savedAt: string; // ISO date string
}

export interface TechniqueParameter {
  name: string;
  unit: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  defaultValue: string | number;
  value?: string | number; // To hold the current value in the UI state
}

export interface Technique {
  id: string;
  name: string;
  category: string;
  description: string;
  parameters: TechniqueParameter[];
}

export interface RawMaterial {
  id: string;
  category: string;
  ingredient: string;
  form: string;
  sourceType: string;
  primaryFunction: string;
  secondaryFunction: string;
  storage: string;
  allergen: string;
  notes: string;
}

export interface Crop {
  primaryCategory: string;
  subCategory: string;
  cropName: string;
  variety: string;
  ediblePart: string;
  growthSystem: string;
}

export interface AnimalProduct {
  id: string;
  category: string;
  ingredient: string;
  form: string;
  sourceType: string;
  primaryFunction: string;
  secondaryFunction: string;
  storage: string;
  allergen: string;
  notes: string;
}
