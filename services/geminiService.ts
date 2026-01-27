
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { SynthesisProfile, Component, Descriptor, Ingredient, FlavourBlendProfile, CordialSpecificationProfile, AiAnalysisMode, Technique } from '../types';

function formatSynthesisProfileToPrompt(profile: SynthesisProfile): string {
    return `
Here is the target Research DNA profile I have engineered:

- **Core Metrics**:
  - Impact: ${profile.targetImpact}/10
  - Novelty: ${profile.targetNovelty}/10
  - Feasibility: ${profile.targetFeasibility}/10
  - Complexity: ${profile.targetComplexity}/10

- **Conceptual Profile**:
  - Abstract/Concrete Bias: ${profile.targetAbstractConcreteBias}/5 (from -5 Abstract to +5 Concrete)
  - Theoretical/Applied Bias: ${profile.targetTheoreticalAppliedBias}/5 (from -5 Theoretical to +5 Applied)

- **Synthesis Parameters**:
  - Synergy Potential: ${profile.synergy}/10
  - Risk Factor: ${profile.risk}/10

My high-level research objective is: "${profile.researchObjective}".
`;
}

export async function* getSynthesisAnalysisStream(profile: SynthesisProfile, mode: AiAnalysisMode): AsyncGenerator<string, void, undefined> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = mode === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const prompt = formatSynthesisProfileToPrompt(profile);
    
    const response = await ai.models.generateContentStream({
        model: model,
        contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: "Acknowledged. I am ready to begin the synthesis analysis." }] },
            { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
            tools: mode === 'grounded' ? [{ googleSearch: {} }] : [],
        }
    });

    for await (const chunk of response) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
}

export async function generateComponentProfile(componentName: string, options: { fast: boolean }): Promise<Omit<Component, 'id'>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = options.fast ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
    
    const prompt = `
    Analyze the research component "${componentName}" and generate its Research DNA profile.
    Provide a concise, one-sentence abstract. Identify its primary category (e.g., 'AI Model', 'Bio-Technology', 'Philosophical Concept').
    Assign up to 4 relevant descriptors from this list: ${Object.values(Descriptor).join(', ')}.
    Rate the following on a 0-10 scale: impact, novelty, feasibility, complexity.
    Rate its conceptual biases on a 0-10 scale: abstractConcreteBias (0=Abstract, 10=Concrete) and theoreticalAppliedBias (0=Theoretical, 10=Applied).
    Provide a relevant source URL if possible (e.g., primary paper, Wikipedia).
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    impact: { type: Type.NUMBER },
                    novelty: { type: Type.NUMBER },
                    feasibility: { type: Type.NUMBER },
                    complexity: { type: Type.NUMBER },
                    descriptors: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    abstractConcreteBias: { type: Type.NUMBER },
                    theoreticalAppliedBias: { type: Type.NUMBER },
                    abstract: { type: Type.STRING },
                    sourceURL: { type: Type.STRING },
                },
                required: ['name', 'category', 'impact', 'novelty', 'feasibility', 'complexity', 'descriptors', 'abstractConcreteBias', 'theoreticalAppliedBias', 'abstract', 'sourceURL']
            }
        }
    });

    if (!response.text) {
        throw new Error("Received an empty response from the AI.");
    }
    
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("The AI returned data in an invalid format.");
    }
}


function formatFlavourProfileToPrompt(profile: FlavourBlendProfile, ingredients: Ingredient[]): string {
    const ingredientList = ingredients.length > 0
        ? ingredients.map(i => `- ${i.name}`).join('\n')
        : 'No ingredients provided.';

    return `
You are the Flavour DNA Perception Engine, an expert sensory analyst and R&D professional.
Your task is to analyze a given flavour blend based on its composition and target profile.

### Ingredient Composition
${ingredientList}

### Target Sensory Profile
- Acidity: ${profile.targetAcidity}/10
- Sweetness: ${profile.targetSweetness}/10
- Bitterness: ${profile.targetBitterness}/10
- Umami: ${profile.targetUmami}/10
- Aromatic Intensity: ${profile.targetAromaticIntensity}/10
- Texture: ${profile.targetTexture}/10
- Balance: ${profile.balance}/10
- Complexity: ${profile.complexity}/10

### High-Level Objective
"${profile.objective}"

### Your Analysis Task
Based on the provided ingredients and target profile, provide a professional sensory analysis. Use markdown for clear formatting.

1.  **### Overall Sensory Prediction:** Briefly describe the likely overall taste and aroma profile of this blend.
2.  **### Harmony & Dissonance:** Analyze how well the ingredients will work together. Point out potential positive synergies and negative clashes.
3.  **### Profile Alignment:** Assess how well the ingredient blend achieves the target sensory profile sliders. Is it likely to be more or less acidic, sweet, etc., than desired?
4.  **### R&D Recommendations:** Suggest specific adjustments. For example, "Increase the proportion of X to boost Y," or "Consider adding Z to introduce complexity."
`;
}

export async function* getFlavourBlendAnalysisStream(profile: FlavourBlendProfile, ingredients: Ingredient[], mode: AiAnalysisMode): AsyncGenerator<string, void, undefined> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = mode === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const prompt = formatFlavourProfileToPrompt(profile, ingredients);
    
    const response = await ai.models.generateContentStream({
        model: model,
        contents: prompt,
        config: {
            tools: mode === 'grounded' ? [{ googleSearch: {} }] : [],
        }
    });

    for await (const chunk of response) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
}

export async function generateIngredientProfile(ingredientName: string, options: { fast: boolean }): Promise<Omit<Ingredient, 'id'>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = options.fast ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
    
    const prompt = `
    Analyze the sensory profile of the ingredient "${ingredientName}" and generate its Flavour DNA profile.

    - Provide a primary 'type' (e.g., fruit, herb, spice, vegetable, alcohol, sugar, fat).
    - Provide a 'subcategory' (e.g., citrus, root, spirit).
    - Provide a sensory 'archetype' (e.g., Citrus Zest, Tropical Musk, Pungent Aromatic, Roasted Bitter).
    - Rate its core DNA on a 0-10 scale: acids, sugars, bitterness, aromatics, aldehydes, esters, umami, texture, water_content.
    - Provide brief sensory 'notes' (e.g., "Fruity, Green, Zesty. Sour, Bitter (Rind).").
    - Provide typical 'origin' and 'seasonality'.
    - Provide its typical 'state' (e.g., fresh, dried, processed).
    - Provide a list of common 'culinary_applications' (e.g., Cocktails, Sauces, Desserts).

    Return this information in a strict JSON format.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: `The common name of the ingredient, formatted as "${ingredientName}".` },
                    type: { type: Type.STRING },
                    subcategory: { type: Type.STRING },
                    archetype: { type: Type.STRING },
                    dna: {
                        type: Type.OBJECT,
                        properties: {
                            acids: { type: Type.NUMBER },
                            sugars: { type: Type.NUMBER },
                            bitterness: { type: Type.NUMBER },
                            aromatics: { type: Type.NUMBER },
                            aldehydes: { type: Type.NUMBER },
                            esters: { type: Type.NUMBER },
                            umami: { type: Type.NUMBER },
                            texture: { type: Type.NUMBER },
                            water_content: { type: Type.NUMBER }
                        },
                        required: ['acids', 'sugars', 'bitterness', 'aromatics', 'aldehydes', 'esters', 'umami', 'texture', 'water_content']
                    },
                    notes: { type: Type.STRING },
                    origin: { type: Type.STRING },
                    seasonality: { type: Type.STRING },
                    state: { type: Type.STRING },
                    culinary_applications: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                },
                required: ['name', 'type', 'subcategory', 'archetype', 'dna', 'notes', 'origin', 'seasonality', 'state', 'culinary_applications']
            }
        }
    });

    if (!response.text) {
        throw new Error("Received an empty response from the AI.");
    }
    
    try {
        const parsed = JSON.parse(response.text);
        parsed.name = ingredientName;
        return parsed;
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("The AI returned data in an invalid format.");
    }
}

function formatCordialProfileToPrompt(profile: CordialSpecificationProfile, ingredients: Ingredient[]): string {
    const ingredientList = ingredients.length > 0
        ? `The recipe MUST be built around the following core ingredients:\n` + ingredients.map(i => `- ${i.name}`).join('\n')
        : 'The recipe can be built from scratch, but should align with the base identity.';

    return `
You are a master "Liquid Engineer" and R&D professional specializing in beverage formulation.
Your task is to generate a professional, production-ready recipe for a cordial based on a detailed specification.

### Product Specification
- **Base Identity:** ${profile.base_identity}
- **High-Level Objective:** ${profile.objective}
- **Target Volume:** ${profile.volume_ml} mL
- **Target pH:** ${profile.target_pH}

### Sensory DNA Profile
- Sharpness (Malic Acid feel): ${profile.sharpness}/100
- Juiciness (Citric Acid feel): ${profile.juiciness}/100
- Dryness (Tartaric Acid feel): ${profile.dryness}/30
- Sweet Body: ${profile.sweet_body}/100
- Texture/Mouthfeel: ${profile.texture}/100
- Flavour Pop (Salt perception): ${profile.flavour_pop}/20
- Fresh Cut Illusion (Aldehydes/Esters): ${profile.fresh_cut}/15
- Aroma Bias: ${profile.aroma_bias} (from -50 Herbal to +50 Fruity)

### Core Ingredients & Constraints
${ingredientList}
- **Constraints:** ${profile.constraints.join(', ')}

### Your Task
Generate a complete recipe. Adhere to the following professional markdown structure strictly.

**### Recipe Summary**
A brief, one-paragraph overview of the cordial's flavour profile and character.

**### Ingredients**
A precise list of all ingredients with quantities in grams (g) or milliliters (mL). Calculate percentages based on the total final weight/volume.

**### Equipment**
A list of necessary professional equipment.

**### Method**
A step-by-step production method. Be precise and clear.

${profile.explain_for_training ? `
**### R&D Explanation**
Explain the "why" behind your choices.
- How does the ingredient combination achieve the target Sensory DNA?
- Why were specific acids (malic, citric, etc.) chosen?
- How is the target pH achieved and why is it important?
` : ''}
`;
}

export async function* getCordialRecipeStream(profile: CordialSpecificationProfile, ingredients: Ingredient[], mode: AiAnalysisMode): AsyncGenerator<string, void, undefined> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = mode === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-pro-preview';
    
    const prompt = formatCordialProfileToPrompt(profile, ingredients);
    
    const response = await ai.models.generateContentStream({
        model: model,
        contents: prompt,
        config: {
            tools: mode === 'grounded' ? [{ googleSearch: {} }] : [],
        }
    });

    for await (const chunk of response) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
}

export async function generateCordialProfileFromObjective(objective: string, ingredients: Ingredient[]): Promise<{ profile: Partial<CordialSpecificationProfile>, rationale: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const ingredientList = ingredients.length > 0
        ? `The profile MUST be suitable for these core ingredients: ${ingredients.map(i => i.name).join(', ')}.`
        : 'The profile can be designed from a blank slate.';

    const prompt = `
    Analyze the following beverage objective and translate it into a technical Cordial Specification Profile.
    Objective: "${objective}".
    ${ingredientList}

    Synthesize the sensory DNA sliders and technical parameters based on the objective.
    - Rate from 0-100: sharpness, juiciness, sweet_body, texture.
    - Rate from 0-30: dryness.
    - Rate from 0-20: flavour_pop.
    - Rate from 0-15: fresh_cut.
    - Rate from -50 (Herbal) to +50 (Fruity): aroma_bias.
    - Estimate a suitable target_pH (typically between 2.6 and 3.4).
    - Provide a short 'rationale' explaining how you translated the objective into these specific numbers.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    profile: {
                        type: Type.OBJECT,
                        properties: {
                            sharpness: { type: Type.NUMBER },
                            juiciness: { type: Type.NUMBER },
                            dryness: { type: Type.NUMBER },
                            sweet_body: { type: Type.NUMBER },
                            texture: { type: Type.NUMBER },
                            flavour_pop: { type: Type.NUMBER },
                            fresh_cut: { type: Type.NUMBER },
                            aroma_bias: { type: Type.NUMBER },
                            target_pH: { type: Type.NUMBER },
                        },
                        required: ['sharpness', 'juiciness', 'dryness', 'sweet_body', 'texture', 'flavour_pop', 'fresh_cut', 'aroma_bias', 'target_pH']
                    },
                    rationale: {
                        type: Type.STRING,
                        description: 'A brief explanation of the choices made for the profile values, formatted with markdown (e.g., using ### for a header).'
                    }
                },
                required: ['profile', 'rationale']
            }
        }
    });

    if (!response.text) {
        throw new Error("Received an empty response from the AI.");
    }

    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("The AI returned data in an invalid format.");
    }
}


function formatGastronomyExperimentToPrompt(objective: string, ingredient: Ingredient | null, technique: Technique | null): string {
    const parameterList = technique?.parameters.map(p => `- ${p.name}: ${p.value} ${p.unit}`).join('\n') || 'N/A';

    return `
You are a professional Food Scientist and R&D Chef working in an advanced culinary laboratory.
Your task is to generate a detailed, professional experimental protocol based on the user's objective and selected parameters.

### High-Level R&D Objective
"${objective}"

### Primary Subject
- **Ingredient:** ${ingredient?.name || 'Not specified'}
- **Core Profile:** ${ingredient?.notes || 'N/A'}

### Primary Technique
- **Technique:** ${technique?.name || 'Not specified'}
- **Description:** ${technique?.description || 'N/A'}
- **Parameters:**
${parameterList}

### Your Task
Generate a complete experimental protocol. Use markdown for clear formatting and adopt a scientific, professional tone. Structure your response as follows:

**### Experiment Objective**
A concise, one-sentence summary of the goal, translated into scientific terms.

**### Predicted Outcome**
Describe the expected sensory (taste, aroma, texture) and physical (appearance, stability) properties of the result. Be specific.

**### Scientific Rationale**
Explain the key chemical and physical principles at play. Why will this combination of ingredient, technique, and parameters produce the predicted outcome? Refer to concepts like Maillard reaction, protein denaturation, gelation, etc.

**### Required Equipment**
A precise list of necessary laboratory or professional kitchen equipment.

**### Step-by-Step Procedure**
A detailed, clear, and repeatable method for conducting the experiment. Include precise measurements, temperatures, timings, and actions.

**### Control Variables & Safety**
List the most important variables to keep constant for repeatability. Note any necessary safety precautions (e.g., handling specific chemicals, high temperatures).
`;
}

export async function* getGastronomyExperimentStream(objective: string, ingredient: Ingredient | null, technique: Technique | null, mode: AiAnalysisMode): AsyncGenerator<string, void, undefined> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = mode === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const prompt = formatGastronomyExperimentToPrompt(objective, ingredient, technique);
    
    const response = await ai.models.generateContentStream({
        model: model,
        contents: prompt,
        config: {
            tools: mode === 'grounded' ? [{ googleSearch: {} }] : [],
        }
    });

    for await (const chunk of response) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
}
