
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { SpanishLevel } from '../types';

interface LiveConversationProps {
  level: SpanishLevel;
  nativeLanguage: string;
  accent: string;
}

// Utility functions for audio
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

const LiveConversation: React.FC<LiveConversationProps> = ({ level, nativeLanguage, accent }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const startSession = async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcriptions
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text || '';
              setTranscriptions(prev => [...prev, { role: 'model', text }]);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text || '';
              setTranscriptions(prev => [...prev, { role: 'user', text }]);
            }

            // Handle Audio
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const outCtx = outputAudioContextRef.current;
              if (outCtx && outCtx.state !== 'closed') {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);

                const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
                const source = outCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outCtx.destination);

                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try {
                  source.stop();
                } catch (e) {
                  // Ignore errors if source is already stopped
                }
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error", e),
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            // Usamos 'Zephyr' que es una voz femenina/suave ideal para la Profe Jemi.
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `Eres "Profe Jemi", una profesora de español como lengua extranjera (ELE) en una sesión de conversación en VIVO por voz.

TU ROL PRINCIPAL: Eres una PROFESORA, NO una compañera de charla. Tu objetivo es ENSEÑAR español activamente.

NIVEL DEL ESTUDIANTE: ${level}
IDIOMA NATIVO DEL ESTUDIANTE: ${nativeLanguage}
ACENTO QUE QUIERE APRENDER: ${accent}

REGLA CRÍTICA DE IDIOMA: Cuando necesites explicar algo, traducir una palabra, dar contexto gramatical o hacer aclaraciones, SIEMPRE hazlo en ${nativeLanguage} (el idioma nativo del estudiante). NUNCA uses inglés a menos que el idioma nativo del estudiante sea inglés. Por ejemplo, si el estudiante habla portugués, di "isso significa..." y no "this means...". Las preguntas de práctica y el contenido de la clase deben ser en español, pero las EXPLICACIONES y TRADUCCIONES siempre en ${nativeLanguage}.

REGLAS OBLIGATORIAS:
1. CORRECCIÓN DE PRONUNCIACIÓN: Si detectas que el estudiante pronuncia mal una palabra, corrígelo amablemente. Explica en ${nativeLanguage} cómo se pronuncia correctamente.
2. CORRECCIÓN GRAMATICAL: Si el estudiante comete un error gramatical, corrígelo de forma amable. Explica brevemente la regla EN ${nativeLanguage}.
3. VOCABULARIO: Cuando uses una palabra que el estudiante podría no conocer, tradúcela al ${nativeLanguage} y da ejemplos.
4. ESTRUCTURA DE LA CLASE:
   - Empieza saludando en español y preguntando cómo está el estudiante.
   - Propón un tema de conversación adaptado a su nivel.
   - Haz preguntas cortas y claras para que el estudiante practique.
   - Después de cada respuesta: primero EVALÚA, luego FELICITA, finalmente haz la siguiente pregunta.
5. HABLA PAUSADO Y CLARO. Usa frases cortas adaptadas al nivel ${level}. Adapta tu vocabulario al acento ${accent}.
6. Si el nivel es "Básico", habla MUY lento, usa palabras simples, y traduce palabras clave al ${nativeLanguage}.
7. Si el nivel es "Intermedio", habla a velocidad normal pero corrige todo error.
8. Si el nivel es "Avanzado", habla naturalmente, usa expresiones idiomáticas y pide explicaciones complejas.
9. SIEMPRE termina tu intervención con una pregunta para que el estudiante siga hablando.
10. Sé cálida, motivadora y paciente. Usa refuerzo positivo.
11. DINÁMICA DE REPETICIÓN OBLIGATORIA: Si el estudiante te habla en ${nativeLanguage}:
   a) Primero, respóndele brevemente en ${nativeLanguage} para que entienda.
   b) Luego, dile cómo se dice eso en español, pronunciando claro y pausado.
   c) Pídele que REPITA la frase en español. Di algo como: "Ahora dilo tú en español: [frase]".
   d) Escucha su intento. Si lo dice razonablemente bien (al menos 60% correcto), felicítalo con entusiasmo y continúa la conversación.
   e) Si lo dice mal o muy incompleto, corrige con paciencia, repite la frase modelo, y pídele que lo intente de nuevo. No avances hasta que lo diga aceptablemente bien.
   f) Máximo 3 intentos por frase. Al tercer intento, felicita el esfuerzo y sigue adelante.`,
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        console.error("Error closing session", e);
      }
      sessionRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(console.error);
      outputAudioContextRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    // Stop all active audio sources
    for (const source of sourcesRef.current.values()) {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full max-w-2xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-outfit font-bold text-gray-900 mb-2">Práctica de Pronunciación</h2>
        <p className="text-gray-600">Habla directamente con la Profe Jemi y mejora tu fluidez en tiempo real.</p>
      </div>

      <div className="relative mb-12">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl overflow-hidden ${isActive ? 'scale-110 ring-8 ring-red-100 bg-red-500' : 'bg-gray-200'
          }`}>
          {isActive ? (
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 bg-white rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          ) : (
            <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
        {isActive && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Escuchando...
          </div>
        )}
      </div>

      <div className="w-full space-y-4 mb-8">
        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 shadow-lg ${isActive
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-red-500 text-white hover:bg-red-600'
            }`}
        >
          {isConnecting ? 'Conectando...' : isActive ? 'Terminar Sesión' : 'Empezar a Hablar'}
        </button>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-4 h-48 overflow-y-auto shadow-inner text-sm space-y-2">
        {transcriptions.length === 0 ? (
          <p className="text-gray-400 text-center italic mt-12">Las transcripciones aparecerán aquí...</p>
        ) : (
          transcriptions.slice(-10).map((t, i) => (
            <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className={`px-3 py-1 rounded-lg ${t.role === 'user' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                <strong>{t.role === 'user' ? 'Tú' : 'Jemi'}:</strong> {t.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveConversation;
