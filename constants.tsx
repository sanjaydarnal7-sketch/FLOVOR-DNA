
import React from 'react';
import { Component, Descriptor } from './types';

export const SYSTEM_PROMPT = `
You are the Research DNA Synthesis Engine.

Your role is to assist researchers in thinking clearly about complex topics, not to simply provide literature reviews.

You operate using principles of systems thinking, conceptual analysis, and explainable logic.

### Operating Rules

1.  Always start with the research objective, never the components.
2.  Translate the objective into a Research DNA profile.
3.  Treat research components as variables with defined properties, not just keywords.
4.  Predict the synthesized outcome before suggesting pathways.
5.  Explain *why the synthesis will lead to a particular insight or outcome*.
6.  Reduce redundant research by identifying core conceptual overlaps and gaps.
7.  Maintain a professional, scientific, and analytical tone.

### You must NEVER:

*   Default to just listing papers or facts.
*   Use vague, unanalytical language.
*   Skip the logical explanation.
*   Act like a casual chatbot or search engine.

### Your Output Structure

Use markdown for formatting.

1.  **Research Objective:** Briefly summarize the user's goal.
2.  **Research DNA Analysis:** Analyze the provided DNA values and what they imply for the research direction.
3.  **Component Pathways (optional):** Suggest *classes* of research components that could achieve this profile. Be abstract. For example, "a foundational machine learning model with high parallelization" or "a disruptive biotechnology for precise manipulation".
4.  **Predicted Synthesized Outcome:** Describe the holistic insight or potential discovery from combining these components.
5.  **Scientific Explanation:** Explain the logical and conceptual reasons for the predicted outcome. Refer to concepts like emergent properties, interdisciplinary bridges, and methodological strengths/weaknesses.
6.  **Risks & Opportunities:** Point out potential challenges, logical fallacies, or novel areas for exploration.
`;

export const INITIAL_COMPONENTS: Component[] = [
  {
    id: 'COMP_001',
    name: 'Transformer Architecture',
    category: 'AI Model',
    impact: 9,
    novelty: 8,
    feasibility: 6,
    complexity: 9,
    descriptors: [Descriptor.FOUNDATIONAL, Descriptor.DATA_DRIVEN, Descriptor.ESTABLISHED],
    abstractConcreteBias: 8, // More concrete
    theoreticalAppliedBias: 9, // More applied
    abstract: 'Attention-based model excelling at parallel processing of sequential data, revolutionizing NLP.',
    sourceURL: 'https://arxiv.org/abs/1706.03762'
  },
  {
    id: 'COMP_002',
    name: 'Reinforcement Learning',
    category: 'AI Paradigm',
    impact: 8,
    novelty: 7,
    feasibility: 5,
    complexity: 8,
    descriptors: [Descriptor.THEORETICAL, Descriptor.APPLIED, Descriptor.EMERGING],
    abstractConcreteBias: 5, // Neutral
    theoreticalAppliedBias: 6, // Leans applied
    abstract: 'A paradigm for training agents to make decisions by rewarding desired behaviors and punishing undesired ones.',
    sourceURL: 'https://en.wikipedia.org/wiki/Reinforcement_learning'
  },
  {
    id: 'COMP_003',
    name: 'CRISPR-Cas9',
    category: 'Bio-Technology',
    impact: 10,
    novelty: 9,
    feasibility: 7,
    complexity: 7,
    descriptors: [Descriptor.DISRUPTIVE, Descriptor.APPLIED, Descriptor.INTERDISCIPLINARY],
    abstractConcreteBias: 9, // Very concrete
    theoreticalAppliedBias: 8, // Very applied
    abstract: 'A gene-editing tool that allows for precise modification of DNA sequences in living organisms.',
    sourceURL: 'https://en.wikipedia.org/wiki/CRISPR'
  }
];

// ICON STYLE: Thin line, technical, stroke-width 1.5
export const ResearchDnaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5c1.883 0 3.5-1.554 3.5-3.465S9.383.565 7.5.565 4 2.12 4 4.035 5.617 7.5 7.5 7.5zM16.5 23.435c-1.883 0-3.5-1.554-3.5-3.465s1.617-3.465 3.5-3.465 3.5 1.554 3.5 3.465-1.617 3.465-3.5 3.465z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5S10 12 12 12s4.5 4.5 4.5 4.5M7.5 16.5S10 12 12 12s4.5-4.5 4.5-4.5" />
    </svg>
);


export const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);


export const SynthesisIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 18.25C15.25 17.56 15.81 17 16.5 17s1.25.56 1.25 1.25-.56 1.25-1.25 1.25-.75-.56-.75-1.25zM7.75 6.75C7.75 6.06 8.31 5.5 9 5.5s1.25.56 1.25 1.25S9.69 8 9 8s-.75-.56-.75-1.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.5C16.5 5.672 15.828 5 15 5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zM9 19c.828 0 1.5-.672 1.5-1.5S9.828 16 9 16s-1.5.672-1.5 1.5.672 1.5 1.5 1.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8s1 2.5 3 2.5 3-2.5 3-2.5M9 16s1 2.5 3 2.5 3-2.5 3-2.5" />
    </svg>
);


export const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 3v1.5M12 3v1.5m-3.75 0H12m-3.75 0H8.25m9.75 0h3.375c.621 0 1.125-.504 1.125-1.125V3.545M12.75 3v1.5m0 0h4.5m-4.5 0h-3.75m-3.75 0H12m-6.375 0H12m-6.375 0H8.25" />
    </svg>
);


export const WaveformIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2.25l2.25-6L12 18l3.75-9L21 12H18" />
    </svg>
);

export const VoiceIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

export const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
);

export const GenerateIcon = (props: React.SVGProps<SVGSVGElement>) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
);


export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.5a2.25 2.25 0 01-1.06.632L6.38 21.75l1.62-3.151a2.25 2.25 0 01.632-1.06L16.862 4.487z" />
    </svg>
);

export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 4.8108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export const FlavourIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v11.142c0 .897.446 1.733 1.186 2.246l2.128 1.596a3.75 3.75 0 004.472 0l2.128-1.596A2.625 2.625 0 0021 16.246V3.104m-11.25 0c0-.897-.446-1.733-1.186-2.246L6.436.262a3.75 3.75 0 00-4.472 0L.836 1.858A2.625 2.625 0 000 3.104v13.142c0 .897.446 1.733 1.186 2.246l1.128.846" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75h11.25M3.75 7.5h7.5" />
    </svg>
);

export const BeakerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25h13.5m-13.5 0a2.25 2.25 0 012.25-2.25h9a2.25 2.25 0 012.25 2.25m-13.5 0v11.25a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25V5.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12.75h13.5" />
    </svg>
);


export const MoleculeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5c0-1.242.986-2.25 2.25-2.25s2.25.958 2.25 2.25c0 1.242-.986 2.25-2.25 2.25S11.25 5.742 11.25 4.5zM15.75 12c0-1.242.986-2.25 2.25-2.25s2.25.958 2.25 2.25c0 1.242-.986 2.25-2.25 2.25s-2.25-.958-2.25-2.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 19.5c0-1.242.986-2.25 2.25-2.25s2.25.958 2.25 2.25c0 1.242-.986 2.25-2.25 2.25S6 20.742 6 19.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 17.25L13.5 9M15.75 6.75l-2.25 2.25" />
    </svg>
);

export const FlaskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l-.94-2.821a3.75 3.75 0 01-.14-1.402V8.25a3.75 3.75 0 013.75-3.75h.038a3.75 3.75 0 013.712 3.712v8.527a3.75 3.75 0 01-.14 1.402L13.5 21m-3 0h3m-3.75-6.75h4.5" />
    </svg>
);

export const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const FishIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 12.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.19 14.898c-.463.38-1.002.66-1.59.832L17.5 19.5h-1.5L13.12 16.5A6.98 6.98 0 0112 16.5c-1.39 0-2.686-.39-3.79-1.07l-2.88 2.97h-1.5l2.892-3.77a7.023 7.023 0 01-1.59-.832C3.12 13.684 2.25 12.03 2.25 10.125c0-3.313 4.36-6 9.75-6s9.75 2.687 9.75 6c0 1.905-.87 3.559-2.31 4.773z" />
    </svg>
);

export const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

export const NetworkIntelligenceIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25c-2.488 0-4.5 2.012-4.5 4.5s2.012 4.5 4.5 4.5 4.5-2.012 4.5-4.5-2.012-4.5-4.5-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v.75m0 15v.75m-6.364-4.864l-.53.53m12.728 0l-.53-.53M3.75 12h.75m15 0h.75m-15.53-6.364l.53.53m12.728 0l.53-.53" />
    </svg>
);

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21.35,11.1H12.18V13.83H18.67C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.18,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.18,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.18,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.9 21.45,11.49 21.35,11.1Z" />
    </svg>
);

export const LoadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.696L7.985 5.28m-4.992 0h4.992m-4.993 0l3.181-3.183a8.25 8.25 0 011.667 0l3.181 3.183" />
    </svg>
);

export const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

export const ListBulletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-1.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
