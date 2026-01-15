
import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: `LiveSession` is not an exported member of `@google/genai`.
// The session object will be handled via an inferred type from the promise resolution.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { VoiceIcon, StopIcon } from '../constants';

// --- Audio Helper Functions (as per @google/genai guidelines) ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Component ---

const VoiceAssistantView: React.FC = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState('Idle. Press the button to start.');
    const [transcript, setTranscript] = useState<{ speaker: 'user' | 'model', text: string, isFinal: boolean }[]>([]);

    // FIX: Changed type from `Promise<LiveSession>` to `Promise<any>` because `LiveSession` is not exported.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [transcript]);

    const stopSession = useCallback(() => {
        setStatus('Closing session...');
        sessionPromiseRef.current?.then(session => session.close());
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();

        sessionPromiseRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        scriptProcessorRef.current = null;
        mediaStreamRef.current = null;
        mediaStreamSourceRef.current = null;
        nextStartTimeRef.current = 0;
        audioSourcesRef.current.clear();
        
        setIsSessionActive(false);
        setStatus('Idle. Press the button to start.');
    }, []);
    
    const startSession = async () => {
        setTranscript([]);
        setStatus('Requesting permissions...');
        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
            console.error("Microphone access denied:", error);
            setStatus('Microphone access denied. Please enable it in your browser settings.');
            return;
        }

        setStatus('Initializing...');
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: 'You are a helpful R&D assistant for the Research DNA platform. Answer questions about research components, scientific concepts, and synthesis methodologies. Keep your responses concise and informative.',
            },
            callbacks: {
                onopen: () => {
                    setStatus('Listening...');
                    setIsSessionActive(true);

                    mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                    scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    
                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // --- Handle Transcription ---
                    if (message.serverContent?.inputTranscription) {
                        // FIX: Property 'isFinal' does not exist on type 'Transcription'. Using `turnComplete` instead to manage finality.
                        const text = message.serverContent.inputTranscription.text;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.speaker === 'user' && !last.isFinal) {
                                return [...prev.slice(0, -1), { speaker: 'user', text, isFinal: false }];
                            }
                            return [...prev, { speaker: 'user', text, isFinal: false }];
                        });
                    }
                    if (message.serverContent?.outputTranscription) {
                        // FIX: Property 'isFinal' does not exist on type 'Transcription'. Using `turnComplete` instead to manage finality.
                        const text = message.serverContent.outputTranscription.text;
                         setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.speaker === 'model' && !last.isFinal) {
                                return [...prev.slice(0, -1), { speaker: 'model', text, isFinal: false }];
                            }
                            return [...prev, { speaker: 'model', text, isFinal: false }];
                        });
                    }

                    // FIX: Added logic to handle `turnComplete` to mark transcripts as final.
                    if (message.serverContent?.turnComplete) {
                        setTranscript(prev => prev.map(t => ({ ...t, isFinal: true })));
                    }

                    // --- Handle Audio Playback ---
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        setStatus('Speaking...');
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        
                        source.addEventListener('ended', () => {
                            audioSourcesRef.current.delete(source);
                            if (audioSourcesRef.current.size === 0) {
                                setStatus('Listening...');
                            }
                        });

                        const currentTime = outputAudioContextRef.current.currentTime;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);
                        
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    const errorMessage = e.message.toLowerCase();
                    let userFriendlyError = 'A session error occurred.';

                    if (errorMessage.includes('api key')) {
                        userFriendlyError = 'API Key Error. Please check your configuration.';
                    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                        userFriendlyError = 'Network connection lost. Please check your internet.';
                    } else if (errorMessage.includes('microphone')) {
                        userFriendlyError = 'Microphone error. Please ensure it is connected and permissions are granted.';
                    } else {
                        userFriendlyError = `An unexpected error occurred.`;
                    }
                    setStatus(`Error: ${userFriendlyError}`);
                    stopSession();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Session closed.');
                    stopSession();
                },
            },
        });
    };

    const handleButtonClick = () => {
        if (isSessionActive) {
            stopSession();
        } else {
            startSession();
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isSessionActive) {
                stopSession();
            }
        };
    }, [isSessionActive, stopSession]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-100 mb-2 font-sans">Voice Assistant</h2>
            <p className="text-gray-400 mb-6">Have a real-time conversation with the Research DNA assistant.</p>
            
            <GlassmorphicCard className="p-6 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
                <button 
                    onClick={handleButtonClick} 
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                        isSessionActive 
                        ? 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30' 
                        : 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 animate-subtle-glow'
                    }`}
                    aria-label={isSessionActive ? 'Stop Session' : 'Start Session'}
                >
                    {isSessionActive ? <StopIcon className="w-12 h-12" /> : <VoiceIcon className="w-12 h-12" />}
                </button>
                <p className="font-mono text-gray-400 tracking-wider h-5">{status}</p>

                <div className="w-full h-64 bg-slate-900/50 rounded-lg p-4 overflow-y-auto border border-slate-700/50">
                    {transcript.map((entry, index) => (
                        <div key={index} className={`mb-2 ${entry.speaker === 'user' ? 'text-right' : 'text-left'}`}>
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-sm ${
                                entry.speaker === 'user' 
                                ? 'bg-cyan-500/20 text-cyan-200' 
                                : 'bg-slate-700/50 text-gray-300'
                            }`}>
                                {entry.text}
                            </span>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
            </GlassmorphicCard>
        </div>
    );
};

export default VoiceAssistantView;
