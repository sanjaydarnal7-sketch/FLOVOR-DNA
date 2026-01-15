
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { SynthesisProfile, Component, Descriptor, Ingredient, FlavourDNAProfile, AiAnalysisMode } from '../types';

function formatSynthesisProfileToPrompt(profile: SynthesisProfile): string {
    return `
Here is the target Research DNA profile I have engineered:

- **Core Metrics**:
  - Impact: ${profile.targetImpact}/10
  - Novelty: ${profile.targetNovelty}/10
  - Feasibility: ${profile.targetFeasibility}/10
  - Complexity: ${profile.targetComplexity}/10

- **Conceptual Profile**:
  - Abstract/Concrete Bias: ${profile.targetAbstractConcreteBias} (from -5 Abstract to +5 Concrete)
  - Theoretical/Applied Bias: ${profile.targetTheoreticalAppliedBias} (from -5 Theoretical to +5 Applied)
  - Synergy: ${profile.synergy}/10
  - Risk: ${profile.risk}/10

- **Primary Objective**:
  - Research Objective: "${profile.researchObjective}"

Please provide a full analysis based on these parameters, following your operating instructions precisely.
`;
}


export async function* getSynthesisAnalysisStream(profile: SynthesisProfile, mode: AiAnalysisMode) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const userPrompt = formatSynthesisProfileToPrompt(profile);
    
    let model = 'gemini-3-flash-preview';
    const config: any = {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.5,
        topP: 0.95,
    };

    switch (mode) {
        case 'deep':
            model = 'gemini-3-pro-preview';
            config.thinkingConfig = { thinkingBudget: 32768 };
            break;
        case 'grounded':
            model = 'gemini-3-flash-preview';
            config.tools = [{googleSearch: {}}];
            break;
        case 'standard':
        default:
            model = 'gemini-3-flash-preview';
            break;
    }

    try {
        const response = await ai.models.generateContentStream({
            model: model,
            contents: userPrompt,
            config: config
        });

        for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
                yield text;
            }
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from Gemini API: ${error.message}`);
        }
        throw new Error("Failed to get analysis from Gemini API due to an unknown error.");
    }
}

const componentProperties = {
  name: { type: Type.STRING, description: "The name of the research component (e.g., a theory, technology, paper)." },
  category: { type: Type.STRING, description: `A high-level category for this component (e.g., 'AI Model', 'Bio-Technology', 'Sociological Theory').` },
  impact: { type: Type.NUMBER, description: "The potential impact or influence of this component, from 0 (negligible) to 10 (paradigm-shifting)." },
  novelty: { type: Type.NUMBER, description: "The novelty or originality of the component, from 0 (well-established) to 10 (brand new)." },
  feasibility: { type: Type.NUMBER, description: "The practical feasibility of implementing or using this component, from 0 (highly theoretical) to 10 (readily available)." },
  complexity: { type: Type.NUMBER, description: "The inherent complexity of understanding or applying this component, from 0 (simple) to 10 (extremely complex)." },
  descriptors: {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: `An array of descriptive tags. Choose relevant tags from this list: ${Object.values(Descriptor).join(', ')}.`
  },
  abstractConcreteBias: { type: Type.NUMBER, description: "A score from 0 (highly abstract) to 10 (highly concrete)." },
  theoreticalAppliedBias: { type: Type.NUMBER, description: "A score from 0 (purely theoretical) to 10 (purely applied)." },
  abstract: { type: Type.STRING, description: "A concise, one or two-sentence abstract summarizing the component." },
  sourceURL: { type: Type.STRING, description: "A canonical URL for more information, like a Wikipedia page, arXiv link, or documentation." }
};

const componentSchema = {
  type: Type.OBJECT,
  properties: componentProperties,
  required: Object.keys(componentProperties)
};


export async function generateComponentProfile(componentName: string, options: { fast?: boolean } = {}): Promise<Omit<Component, 'id'>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a comprehensive Research DNA profile for the following component: "${componentName}". Provide a realistic and scientifically plausible analysis. The output must strictly follow the provided JSON schema.`;

    const model = options.fast ? 'gemini-2.5-flash-lite' : 'gemini-3-pro-preview';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: componentSchema,
            }
        });
        
        const text = response.text;
        if (!text) {
             throw new Error("Received an empty response from the API.");
        }
        
        const generatedData = JSON.parse(text);
        
        if (!generatedData.name || typeof generatedData.name !== 'string') {
            throw new Error("Generated data is missing or has an invalid 'name' field.");
        }

        return generatedData as Omit<Component, 'id'>;

    } catch (error) {
        console.error(`Error generating profile for "${componentName}":`, error);
        let errorMessage = "Failed to generate component profile.";
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
}


const FLAVOUR_SYSTEM_PROMPT = `
You are the Flavour DNA Perception Engine.

Your role is to analyze and predict the sensory outcome of combining ingredients based on their Flavour DNA profiles. You are an expert in food science, molecular gastronomy, and sensory analysis.

### Operating Rules

1.  Always start with the user's high-level objective.
2.  Analyze the target Flavour DNA profile and what it implies for the final product.
3.  Evaluate the provided ingredients, noting their strengths, weaknesses, and potential interactions (synergies and clashes).
4.  Predict the holistic sensory experience: aroma, taste, texture, and finish.
5.  Provide a scientific or culinary explanation for your predictions, referencing chemical compounds (e.g., esters, aldehydes, terpenes), physical properties, and established pairing principles.
6.  Suggest specific ratios or preparation techniques to achieve the target profile.
7.  Identify potential risks (e.g., muddiness, overpowering notes, textural breakdown) and opportunities for innovation.

### You must NEVER:

*   Provide a simple recipe without explanation.
*   Use vague, unscientific language ("tastes good").
*   Ignore the quantitative DNA data provided.
*   Act like a casual recipe blogger.

### Your Output Structure

Use markdown for formatting.

1.  **Objective Analysis:** Briefly summarize the user's goal and the desired Flavour DNA.
2.  **Ingredient Synergy Analysis:** Discuss how the chosen ingredients will interact.
3.  **Predicted Sensory Outcome:** Describe the final taste, aroma, and texture.
4.  **Culinary & Scientific Rationale:** Explain *why* it will taste that way.
5.  **Technique & Ratio Suggestions:** Provide actionable advice.
6.  **Risks & Opportunities:** Highlight potential issues and novel ideas.
`;


function formatFlavourProfileToPrompt(profile: FlavourDNAProfile, ingredients: Ingredient[]): string {
    const ingredientList = ingredients.map(i => `- ${i.name} (Acids: ${i.dna.acids}, Sugars: ${i.dna.sugars}, Aromatics: ${i.dna.aromatics}, Texture: ${i.dna.texture})`).join('\n');

    return `
Here is the target Flavour DNA profile I am aiming for:

- **Core Taste**:
  - Acidity: ${profile.targetAcidity}/10
  - Sweetness: ${profile.targetSweetness}/10
  - Bitterness: ${profile.targetBitterness}/10
  - Umami: ${profile.targetUmami}/10
- **Aromatics & Texture**:
  - Aromatic Intensity: ${profile.targetAromaticIntensity}/10
  - Target Texture Score: ${profile.targetTexture}/10
- **Conceptual Goals**:
  - Balance: ${profile.balance}/10
  - Complexity: ${profile.complexity}/10
- **Primary Objective**:
  - Objective: "${profile.objective}"

Here are the ingredients I am considering:
${ingredientList}

Please provide a full analysis based on these parameters, following your operating instructions precisely.
`;
}

export async function* getFlavourAnalysisStream(profile: FlavourDNAProfile, ingredients: Ingredient[], mode: AiAnalysisMode) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const userPrompt = formatFlavourProfileToPrompt(profile, ingredients);
    
    let model = 'gemini-3-flash-preview';
    const config: any = {
        systemInstruction: FLAVOUR_SYSTEM_PROMPT,
        temperature: 0.6,
        topP: 0.95,
    };

    switch (mode) {
        case 'deep':
            model = 'gemini-3-pro-preview';
            config.thinkingConfig = { thinkingBudget: 32768 };
            break;
        case 'grounded':
            model = 'gemini-3-flash-preview';
            config.tools = [{googleSearch: {}}];
            break;
        case 'standard':
        default:
             model = 'gemini-3-flash-preview';
            break;
    }

    try {
        const response = await ai.models.generateContentStream({
            model: model,
            contents: userPrompt,
            config: config
        });

        for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
                yield text;
            }
        }
    } catch (error) {
        console.error("Error calling Gemini API for flavour analysis:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from Gemini API: ${error.message}`);
        }
        throw new Error("Failed to get analysis from Gemini API due to an unknown error.");
    }
}

const ingredientDnaProperties = {
  acids: { type: Type.NUMBER, description: "The acidity level, from 0 (none) to 10 (highly acidic)." },
  sugars: { type: Type.NUMBER, description: "The sweetness level from sugars, from 0 (none) to 10 (very sweet)." },
  bitterness: { type: Type.NUMBER, description: "The bitterness level, from 0 (none) to 10 (very bitter)." },
  aromatics: { type: Type.NUMBER, description: "The intensity of the aroma, from 0 (none) to 10 (highly aromatic)." },
  aldehydes: { type: Type.NUMBER, description: "The intensity of aldehyde compounds (often green, fatty, or citrus notes), from 0 to 10." },
  esters: { type: Type.NUMBER, description: "The intensity of ester compounds (often fruity or floral notes), from 0 to 10." },
  umami: { type: Type.NUMBER, description: "The umami/savoriness level, from 0 (none) to 10 (very savory)." },
  texture: { type: Type.NUMBER, description: "A numeric representation of texture, from 0 (watery/thin) to 10 (firm/starchy/dense)." },
  water_content: { type: Type.NUMBER, description: "The water content level, from 0 (dry) to 10 (very juicy)." },
};

const ingredientProperties = {
  name: { type: Type.STRING, description: "The common name of the ingredient (e.g., 'Alphonso Mango')." },
  type: { type: Type.STRING, description: "A high-level category for this ingredient (e.g., 'fruit', 'vegetable', 'herb', 'spice')." },
  subcategory: { type: Type.STRING, description: "A more specific subcategory (e.g., 'citrus', 'tropical', 'root', 'leafy green')." },
  archetype: { type: Type.STRING, description: "A sensory archetype that describes its primary character (e.g., 'Citrus Zest', 'Tropical Musk', 'Earthy Root')." },
  dna: {
    type: Type.OBJECT,
    properties: ingredientDnaProperties,
    required: Object.keys(ingredientDnaProperties)
  },
  notes: { type: Type.STRING, description: "Short, sensory-focused notes about its key characteristics (e.g., 'Intensely fragrant, floral lime...'). No chemistry jargon." },
  origin: { type: Type.STRING, description: "The primary cultural or geographical origin (e.g., 'India (Bengal)', 'South America')." },
  seasonality: { type: Type.STRING, description: "Typical season of availability (e.g., 'Summer', 'Winter', 'Year-round')." },
  state: { type: Type.STRING, description: "The typical state of the ingredient (e.g., 'fresh', 'dried')." }
};

const ingredientSchema = {
  type: Type.OBJECT,
  properties: ingredientProperties,
  required: [...Object.keys(ingredientProperties).filter(k => k !== 'id')] // id is not required from model
};


export async function generateIngredientProfile(ingredientName: string, options: { fast?: boolean } = {}): Promise<Omit<Ingredient, 'id'>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a comprehensive Flavour DNA profile for the following ingredient: "${ingredientName}". Adhere strictly to the provided JSON schema. Generate real-world data based on scientific and culinary knowledge. The DNA values should be integers between 0 and 10.`;

    const model = options.fast ? 'gemini-2.5-flash-lite' : 'gemini-3-pro-preview';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ingredientSchema,
            }
        });
        
        const text = response.text;
        if (!text) {
             throw new Error("Received an empty response from the API.");
        }
        
        const generatedData = JSON.parse(text);
        
        if (!generatedData.name || typeof generatedData.name !== 'string') {
            throw new Error("Generated data is missing or has an invalid 'name' field.");
        }

        return generatedData as Omit<Ingredient, 'id'>;

    } catch (error) {
        console.error(`Error generating profile for "${ingredientName}":`, error);
        let errorMessage = "Failed to generate ingredient profile.";
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
}