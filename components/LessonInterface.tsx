
import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponse, analyzeGrammar, generateSpeech } from '../services/gemini';
import { ChatMessage, Lesson, User } from '../types';

interface LessonInterfaceProps {
  lesson: Lesson;
  user: User;
  onExit: () => void;
  onComplete: () => void;
  onNextLesson?: () => void;
}

// IMPORTANTE: Ruta local a la imagen real de la Profe Jemi
const PROFE_JEMI_REAL = "./profe_jemi.jpg";

const getProgressKey = (id: string) => `profe_jemi_lesson_progress_${id}`;

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const LessonInterface: React.FC<LessonInterfaceProps> = ({ lesson, user, onExit, onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lessonImage, setLessonImage] = useState<string | null>(null);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [loadingAudioKey, setLoadingAudioKey] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  // Unused initialLoadDone removed

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const startLesson = async () => {
      const savedProgress = localStorage.getItem(getProgressKey(lesson.id));
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          setMessages(parsed.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
          setLessonImage(parsed.lessonImage);
          return;
        } catch (e) { }
      }
      setIsLoading(true);
      try {
        // Asignar imagen pre-establecida según la categoría (ahorrando tokens y tiempo)
        let presetImage = 'https://images.unsplash.com/photo-1546410531-bea404b67980?auto=format&fit=crop&q=80&w=800'; // Default: learning
        const cat = lesson.category || '';
        if (cat.includes('Alquiler')) presetImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Supermercado')) presetImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Oficial') || cat.includes('Finanzas') || cat.includes('Derecho')) presetImage = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Hogar')) presetImage = 'https://images.unsplash.com/photo-1556020685-e63193364161?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Salud') || cat.includes('Medicina')) presetImage = 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Tiempo Libre') || cat.includes('Debates')) presetImage = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Servicios') || cat.includes('Transporte')) presetImage = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Restaurantes')) presetImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Emergencias')) presetImage = 'https://images.unsplash.com/photo-1587570417937-29e1db7ff357?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Negocios')) presetImage = 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=800';
        else if (cat.includes('Turismo')) presetImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800';

        // Si hay una imagen representativa directa desde App.tsx, la usamos. Si no, el preset.
        setLessonImage(lesson.representativeImageUrl || presetImage);

        // Generar mensaje inicial del tutor de manera instantanea al cargar
        const response = await getTutorResponse(
          `Empieza la lección: "${lesson.title}". Salúdame y explícame brevemente qué vamos a practicar hoy considerando que mi objetivo es "${user.learningGoal}".`,
          user,
          [],
          lesson.systemPrompt
        );
        setMessages([{ role: 'model', text: response || '', timestamp: new Date() }]);
      } catch (error) { console.error('Error starting lesson:', error); } finally { setIsLoading(false); }
    };
    startLesson();
  }, [lesson.id]);

  const handleFinalize = () => { setIsFinished(true); localStorage.removeItem(getProgressKey(lesson.id)); onComplete(); };

  const fallbackBrowserTTS = (text: string, key: string) => {
    const synth = window.speechSynthesis;
    const cleanedText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').replace(/`+/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F191}-\u{1F251}]/gu, '').trim();
    if (!cleanedText) { setLoadingAudioKey(null); setPlayingAudioKey(null); return; }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;

    // Try to find a Spanish voice
    const voices = synth.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onstart = () => { setLoadingAudioKey(null); setPlayingAudioKey(key); };
    utterance.onend = () => setPlayingAudioKey(null);
    utterance.onerror = () => { setLoadingAudioKey(null); setPlayingAudioKey(null); };
    synth.speak(utterance);
  };

  const playSpeech = async (text: string, key: string) => {
    if (playingAudioKey !== null || loadingAudioKey !== null) return;
    setLoadingAudioKey(key);
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const audioData = await generateSpeech(text, user.accent);

      if (audioData) {
        setLoadingAudioKey(null);
        setPlayingAudioKey(key);
        const bytes = decodeBase64(audioData);
        const buffer = await decodeAudioData(bytes, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlayingAudioKey(null);
        source.start();
      } else {
        // Gemini TTS returned null — use browser fallback
        console.warn('[TTS] Gemini TTS failed, using browser SpeechSynthesis fallback');
        fallbackBrowserTTS(text, key);
      }
    } catch (e) {
      console.error('[TTS] Error, falling back to browser TTS:', e);
      fallbackBrowserTTS(text, key);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const userInput = input;
    const userMessage: ChatMessage = { role: 'user', text: userInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const grammarAnalysis = await analyzeGrammar(userInput, user.nativeLanguage);
      let currentTurnHistory = [...messages, userMessage];
      if (grammarAnalysis && grammarAnalysis.hasError) {
        const feedbackMsg: ChatMessage = { role: 'feedback', text: `📝 **Nota Pedagógica:**\n\n${grammarAnalysis.explanation}\n\n**Corrección:** "${grammarAnalysis.corrected}"`, timestamp: new Date() };
        setMessages(prev => [...prev, feedbackMsg]);
        currentTurnHistory.push(feedbackMsg);
      }
      const history = currentTurnHistory.map(m => ({ role: m.role === 'feedback' ? 'model' : m.role, parts: [{ text: m.text }] }));
      const aiResponse = await getTutorResponse(userInput, user, history, lesson.systemPrompt);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse || '', timestamp: new Date() }]);
    } catch (error) { } finally { setIsLoading(false); }
  };

  const getParagraphs = (text: string) => text.split(/\n\s*\n/).filter(p => {
    const trimmed = p.trim();
    return trimmed !== '' && !/^[\*\-_]{3,}$/.test(trimmed);
  });

  // Flag icon based on accent
  const getAccentFlag = () => {
    if (user.accent.includes('España')) return '🇪🇸';
    if (user.accent.includes('México')) return '🇲🇽';
    if (user.accent.includes('Argentina')) return '🇦🇷';
    if (user.accent.includes('Chile')) return '🇨🇱';
    if (user.accent.includes('Colombia')) return '🇨🇴';
    if (user.accent.includes('Paraguay')) return '🇵🇾';
    return '🏳️';
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full bg-white p-8 text-center animate-in zoom-in duration-500">
        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-xl mb-8"><span className="text-6xl">🏆</span></div>
        <h2 className="text-4xl font-outfit font-black text-gray-900 mb-4">¡Excelente trabajo, {user.name}!</h2>
        <p className="text-xl text-gray-600 mb-12">Has completado con éxito <strong>"{lesson.title}"</strong>.</p>
        <button onClick={onExit} className="flex-grow bg-gray-100 text-gray-700 font-bold py-5 rounded-2xl hover:bg-gray-200 transition-all text-lg px-12">Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full bg-white shadow-2xl md:rounded-t-2xl overflow-hidden text-gray-900">
      <div className="bg-gray-900 p-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={onExit} aria-label="Cerrar lección" title="Cerrar lección" className="hover:bg-gray-800 p-2 rounded-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <div><h2 className="text-lg font-outfit font-bold">{lesson.title}</h2><p className="text-[10px] text-gray-400 uppercase">{user.level} • {user.accent}</p></div>
        </div>
        <button onClick={handleFinalize} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full">Finalizar</button>
      </div>

      <div className="flex-grow overflow-y-auto bg-gray-50 pb-12">
        {/* Imagen Generada Representativa */}
        <div className="w-full px-4 pt-4 md:px-6 md:pt-6">
          {lessonImage && (
            <div className="relative group">
              <img src={lessonImage} alt="Contexto de la lección" className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-lg border-2 border-white" />
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md">
                Generada por IA ✨
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {messages.map((msg, i) => {
            if (msg.role === 'feedback') return (
              <div key={i} className="bg-indigo-50 border-l-8 border-indigo-600 rounded-r-2xl p-6 shadow-md flex space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-indigo-200 aspect-square shadow-sm">
                  <img src={PROFE_JEMI_REAL} alt="Jemi" className="w-full h-full object-cover" />
                </div>
                <div><span className="font-outfit font-black uppercase text-xs text-indigo-900">Profe Jemi dice ({user.nativeLanguage}):</span><p className="text-sm text-indigo-950 mt-2" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /></div>
              </div>
            );
            const paragraphs = msg.role === 'model' ? getParagraphs(msg.text) : [msg.text];
            return (
              <div key={i} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                {msg.role !== 'user' && <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 aspect-square shadow-sm"><img src={PROFE_JEMI_REAL} alt="Jemi" className="w-full h-full object-cover" /></div>}
                <div className="max-w-[85%] space-y-4">
                  {paragraphs.map((p, pIdx) => {
                    const audioKey = `${i}-${pIdx}`;
                    return (
                      <div key={pIdx} className={`rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-red-500 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none border-gray-200'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{p}</p>
                        {msg.role === 'model' && (
                          <button
                            onClick={() => playSpeech(p, audioKey)}
                            disabled={loadingAudioKey !== null || playingAudioKey !== null}
                            className={`mt-3 flex items-center space-x-2 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${playingAudioKey === audioKey
                              ? 'bg-red-500 text-white animate-pulse'
                              : loadingAudioKey === audioKey
                                ? 'bg-gray-100 text-gray-500 cursor-wait'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                          >
                            {loadingAudioKey === audioKey ? (
                              <span>⏳ Generando audio...</span>
                            ) : playingAudioKey === audioKey ? (
                              <span>🔊 Reproduciendo...</span>
                            ) : (
                              <span>🔊 Escuchar ({getAccentFlag()})</span>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex space-x-3"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Responde en español...`} className="flex-grow border rounded-2xl px-6 py-4" /><button type="submit" disabled={isLoading} className="bg-red-500 text-white rounded-2xl px-8 py-4 font-bold">Enviar</button></form>
    </div>
  );
};

export default LessonInterface;
