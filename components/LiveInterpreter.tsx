import React, { useState, useEffect, useRef } from 'react';
import { User, SpanishAccent } from '../types';
import { translateLive, generateSpeech, TranslationResult } from '../services/gemini';

interface LiveInterpreterProps {
  user: User;
  isPremium?: boolean;
  translationsCountUsed?: number;
  onIncrementTranslation?: () => void;
  onOpenPricing?: () => void;
}

interface MessageHistoryItem {
  id: string;
  sender: 'user' | 'native'; // 'user' = speaks native lang, 'native' = speaks Spanish
  originalText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  accent: SpanishAccent;
  culturalTip?: string;
  timestamp: Date;
}

const FREE_TRANSLATIONS_LIMIT = 7;

const ACCENT_FLAG_MAP: Record<SpanishAccent, { flag: string; label: string; code: string }> = {
  'Español de España': { flag: '🇪🇸', label: 'España', code: 'es-ES' },
  'Español de México': { flag: '🇲🇽', label: 'México', code: 'es-MX' },
  'Español del Rio de la Plata (Argentina y Uruguay)': { flag: '🇦🇷', label: 'Argentina / Uruguay', code: 'es-AR' },
  'Español de Chile': { flag: '🇨🇱', label: 'Chile', code: 'es-CL' },
  'Español de Colombia': { flag: '🇨🇴', label: 'Colombia', code: 'es-CO' },
  'Español de Paraguay': { flag: '🇵🇾', label: 'Paraguay', code: 'es-PY' }
};

const NATIVE_LANG_CODES: Record<string, string> = {
  'Portugués': 'pt-BR',
  'Inglés': 'en-US',
  'Francés': 'fr-FR',
  'Italiano': 'it-IT',
  'Alemán': 'de-DE',
};

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

const LiveInterpreter: React.FC<LiveInterpreterProps> = ({
  user,
  isPremium = false,
  translationsCountUsed = 0,
  onIncrementTranslation,
  onOpenPricing
}) => {
  const [targetAccent, setTargetAccent] = useState<SpanishAccent>(user.accent || 'Español de España');
  const [history, setHistory] = useState<MessageHistoryItem[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState<'user' | 'native' | null>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualMode, setManualMode] = useState<'user' | 'native'>('user');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  const nativeLang = user.nativeLanguage || 'Portugués';
  const remainingFree = Math.max(0, FREE_TRANSLATIONS_LIMIT - translationsCountUsed);
  const isLimitReached = !isPremium && remainingFree <= 0;

  // Auto scroll al último mensaje
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTranslating]);

  // Reproducir audio con Gemini TTS o Web Speech fallback
  const playAudio = async (text: string, id: string, isSpanish: boolean) => {
    if (activeSpeechId) return;
    setActiveSpeechId(id);

    try {
      if (isSpanish) {
        // Usar Gemini TTS con acento
        const base64Audio = await generateSpeech(text, targetAccent);
        if (base64Audio) {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const bytes = decodeBase64(base64Audio);
          const buffer = await decodeAudioData(bytes, audioContextRef.current);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => setActiveSpeechId(null);
          source.start();
          return;
        }
      }

      // Fallback a speech synthesis nativo del navegador
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isSpanish ? (ACCENT_FLAG_MAP[targetAccent]?.code || 'es-ES') : (NATIVE_LANG_CODES[nativeLang] || 'pt-BR');
        utterance.rate = 0.95;
        utterance.onend = () => setActiveSpeechId(null);
        utterance.onerror = () => setActiveSpeechId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setActiveSpeechId(null);
      }
    } catch (e) {
      console.warn('Speech playback failed', e);
      setActiveSpeechId(null);
    }
  };

  const handleProcessTranslation = async (textToTranslate: string, sender: 'user' | 'native') => {
    if (!textToTranslate.trim()) return;

    if (isLimitReached) {
      if (onOpenPricing) onOpenPricing();
      return;
    }

    setIsTranslating(true);
    try {
      const isToSpanish = sender === 'user';
      const fromLang = isToSpanish ? nativeLang : 'Español';
      const toLang = isToSpanish ? 'Español' : nativeLang;

      const result: TranslationResult = await translateLive(
        textToTranslate,
        fromLang,
        toLang,
        targetAccent,
        isToSpanish
      );

      const newItem: MessageHistoryItem = {
        id: `msg-${Date.now()}`,
        sender,
        originalText: textToTranslate,
        translatedText: result.translatedText,
        fromLang,
        toLang,
        accent: targetAccent,
        culturalTip: result.culturalTip,
        timestamp: new Date()
      };

      setHistory(prev => [...prev, newItem]);

      // Incrementar contador de uso
      if (onIncrementTranslation) {
        onIncrementTranslation();
      }

      // Reproducir audio automáticamente si está activado
      if (autoSpeak) {
        playAudio(result.translatedText, newItem.id, isToSpanish);
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      alert('Error al traducir: ' + (err?.message || 'Intenta de nuevo'));
    } finally {
      setIsTranslating(false);
    }
  };

  // Iniciar reconocimiento de voz
  const startListening = (sender: 'user' | 'native') => {
    if (isLimitReached) {
      if (onOpenPricing) onOpenPricing();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz continuo. Puedes usar la opción de escribir texto abajo.');
      setShowTextInput(true);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      // Idioma del micrófono según quién habla
      if (sender === 'user') {
        recognition.lang = NATIVE_LANG_CODES[nativeLang] || 'pt-BR';
      } else {
        recognition.lang = ACCENT_FLAG_MAP[targetAccent]?.code || 'es-ES';
      }

      recognition.onstart = () => {
        setIsListening(sender);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          handleProcessTranslation(transcript, sender);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(null);
      };

      recognition.onend = () => {
        setIsListening(null);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition exception:', e);
      setIsListening(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    handleProcessTranslation(manualText, manualMode);
    setManualText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 w-full text-gray-900 flex flex-col h-[calc(100vh-5rem)]">
      {/* Barra de Estado y Créditos */}
      <div className="mb-4">
        {isPremium ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗣️</span>
              <div>
                <p className="text-xs font-black uppercase text-amber-800 tracking-wider">Intérprete Premium Activo</p>
                <p className="text-sm font-bold text-gray-800">Traducción simultánea y modismos ilimitados</p>
              </div>
            </div>
            <span className="text-xs bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded-full">ILIMITADO</span>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗣️</span>
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Traducciones Gratuitas del Mes
                </span>
              </div>
              <span className="text-xs font-extrabold text-red-600">
                {remainingFree} de {FREE_TRANSLATIONS_LIMIT} disponibles
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (translationsCountUsed / FREE_TRANSLATIONS_LIMIT) * 100)}%` }}
              ></div>
            </div>

            {isLimitReached && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs font-bold text-red-800">
                  Has completado tus 7 traducciones gratis de este mes.
                </p>
                {onOpenPricing && (
                  <button
                    onClick={onOpenPricing}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-4 py-2 rounded-lg shadow-sm transition-all"
                  >
                    Desbloquear Traducciones Ilimitadas 🚀
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selector de País de Destino / Acento y Configuración */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 uppercase">País de destino:</span>
          <select
            value={targetAccent}
            onChange={(e) => setTargetAccent(e.target.value as SpanishAccent)}
            className="bg-red-50 border border-red-200 text-red-900 font-extrabold text-xs sm:text-sm py-1.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
          >
            {(Object.keys(ACCENT_FLAG_MAP) as SpanishAccent[]).map((acc) => (
              <option key={acc} value={acc}>
                {ACCENT_FLAG_MAP[acc].flag} {ACCENT_FLAG_MAP[acc].label} ({acc.replace('Español de ', '').replace('Español del ', '')})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch de Auto-Voz */}
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              autoSpeak ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
            title="Reproducir traducción en voz alta automáticamente"
          >
            <span>{autoSpeak ? '🔊 Voz activa' : '🔇 Silencio'}</span>
          </button>

          {/* Toggle de Modo Texto manual */}
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1"
          >
            <span>⌨️</span> {showTextInput ? 'Ocultar teclado' : 'Escribir'}
          </button>
        </div>
      </div>

      {/* Feed de Conversación / Pantalla de Diálogo */}
      <div className="flex-1 bg-gradient-to-b from-gray-50/50 to-white rounded-3xl border border-gray-100 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <span className="text-5xl mb-3">🗣️</span>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Intérprete Simultáneo Cara a Cara</h3>
            <p className="text-xs sm:text-sm max-w-md text-gray-500">
              Presiona el botón azul para hablar en tu idioma (<strong>{nativeLang}</strong>) o el botón rojo para que la otra persona hable en <strong>Español ({ACCENT_FLAG_MAP[targetAccent].label})</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs text-gray-400">
              <span className="bg-white border px-3 py-1 rounded-full">🚕 Tomar un taxi</span>
              <span className="bg-white border px-3 py-1 rounded-full">🍽️ Pedir comida</span>
              <span className="bg-white border px-3 py-1 rounded-full">🏥 En la farmacia</span>
              <span className="bg-white border px-3 py-1 rounded-full">🛒 En el mercado</span>
            </div>
          </div>
        ) : (
          history.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeakingThis = activeSpeechId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 shadow-sm border ${
                    isUser
                      ? 'bg-white border-blue-100 text-left'
                      : 'bg-red-500 text-white border-red-600 text-left'
                  }`}
                >
                  {/* Badge de Idioma / Quién habla */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-black/5">
                    <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isUser ? 'text-blue-600' : 'text-red-100'
                    }`}>
                      {isUser ? (
                        <><span>🇧🇷</span> Tú ({nativeLang}) → {ACCENT_FLAG_MAP[msg.accent].flag} Español</>
                      ) : (
                        <>{ACCENT_FLAG_MAP[msg.accent].flag} Persona Local → 🇧🇷 {nativeLang}</>
                      )}
                    </span>
                    <button
                      onClick={() => playAudio(msg.translatedText, msg.id, isUser)}
                      className={`p-1.5 rounded-full transition-all ${
                        isSpeakingThis
                          ? 'bg-amber-400 text-amber-950 scale-110 shadow-md'
                          : isUser
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title="Escuchar pronunciación"
                    >
                      <span className="text-sm">{isSpeakingThis ? '🔊...' : '🔊'}</span>
                    </button>
                  </div>

                  {/* Frase Original en pequeño */}
                  <p className={`text-xs italic mb-2 ${isUser ? 'text-gray-400' : 'text-red-100/80'}`}>
                    "{msg.originalText}"
                  </p>

                  {/* Traducción Grande y Clara (para mostrar o leer fácil en la calle) */}
                  <h4 className={`text-lg sm:text-xl font-outfit font-black leading-snug ${
                    isUser ? 'text-gray-900' : 'text-white'
                  }`}>
                    {msg.translatedText}
                  </h4>

                  {/* Tip Cultural / Modismo Local */}
                  {msg.culturalTip && (
                    <div className={`mt-3 p-2.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                      isUser ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-black/20 text-white border border-white/20'
                    }`}>
                      <span>💡</span>
                      <p>{msg.culturalTip}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isTranslating && (
          <div className="flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-md flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
              <span className="text-xs font-bold text-gray-600">Traduciendo con IA local...</span>
            </div>
          </div>
        )}

        <div ref={feedEndRef} />
      </div>

      {/* Input de texto manual si está activo */}
      {showTextInput && (
        <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
          <select
            value={manualMode}
            onChange={(e) => setManualMode(e.target.value as 'user' | 'native')}
            className="bg-gray-100 text-xs font-bold px-3 py-2 rounded-xl outline-none"
          >
            <option value="user">Tú ({nativeLang})</option>
            <option value="native">Local (Español)</option>
          </select>
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={manualMode === 'user' ? `Escribe en ${nativeLang}...` : 'Escribe en Español...'}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500 font-medium"
          />
          <button
            type="submit"
            disabled={!manualText.trim() || isTranslating}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            Traducir
          </button>
        </form>
      )}

      {/* Dos Botones Grandes: Modo Cara a Cara */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Botón 1: Habla el Usuario */}
        <button
          type="button"
          onClick={() => startListening('user')}
          disabled={isTranslating || (isListening !== null && isListening !== 'user')}
          className={`py-4 sm:py-5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
            isListening === 'user'
              ? 'bg-blue-600 text-white ring-4 ring-blue-200 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <span className="text-2xl">{isListening === 'user' ? '🔴' : '🎙️'}</span>
          <div className="text-left">
            <p className="text-xs uppercase opacity-80 font-bold">Habla tú ({nativeLang})</p>
            <p className="font-extrabold text-sm sm:text-base">
              {isListening === 'user' ? 'Escuchando tu voz...' : 'Traducir al Español'}
            </p>
          </div>
        </button>

        {/* Botón 2: Habla el Nativo */}
        <button
          type="button"
          onClick={() => startListening('native')}
          disabled={isTranslating || (isListening !== null && isListening !== 'native')}
          className={`py-4 sm:py-5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
            isListening === 'native'
              ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <span className="text-2xl">{isListening === 'native' ? '🔴' : '🎙️'}</span>
          <div className="text-left">
            <p className="text-xs uppercase opacity-80 font-bold">Habla la persona ({ACCENT_FLAG_MAP[targetAccent].label})</p>
            <p className="font-extrabold text-sm sm:text-base">
              {isListening === 'native' ? 'Escuchando español...' : `Traducir al ${nativeLang}`}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LiveInterpreter;
