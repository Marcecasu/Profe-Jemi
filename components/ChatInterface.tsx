
import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponse, generateSpeech } from '../services/gemini';
import { User, ChatMessage } from '../types';

interface ChatInterfaceProps {
  user: User;
}

const STORAGE_KEY = 'profe_jemi_chat_history';
// IMPORTANTE: Ruta local a la imagen real de la Profe Jemi
const PROFE_JEMI_REAL = "/profe_jemi.jpg";

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

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (error) { }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fallbackBrowserTTS = (text: string, key: string) => {
    const synth = window.speechSynthesis;
    const cleanedText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').replace(/`+/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F191}-\u{1F251}]/gu, '').trim();
    if (!cleanedText) { setPlayingAudioKey(null); return; }
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    const voices = synth.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
    if (spanishVoice) utterance.voice = spanishVoice;
    utterance.onstart = () => setPlayingAudioKey(key);
    utterance.onend = () => setPlayingAudioKey(null);
    utterance.onerror = () => setPlayingAudioKey(null);
    synth.speak(utterance);
  };

  const playSpeech = async (text: string, key: string) => {
    if (playingAudioKey !== null) return;
    setPlayingAudioKey(key);
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioData = await generateSpeech(text, user.accent);
      if (audioData) {
        const bytes = decodeBase64(audioData);
        const buffer = await decodeAudioData(bytes, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlayingAudioKey(null);
        source.start();
      } else {
        console.warn('[TTS] Gemini TTS failed, using browser fallback');
        fallbackBrowserTTS(text, key);
      }
    } catch (e) {
      console.error('[TTS] Error, falling back to browser TTS:', e);
      fallbackBrowserTTS(text, key);
    }
  };

  const getParagraphs = (text: string) => text.split(/\n\n+/).filter(p => p.trim() !== '');

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role === 'feedback' ? 'model' : m.role,
        parts: [{ text: m.text }]
      }));
      const aiResponse = await getTutorResponse(input, user, history);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse || '', timestamp: new Date() }]);
    } catch (error) {
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto w-full bg-white shadow-xl rounded-2xl overflow-hidden mt-4 text-gray-900">
      <div className="bg-red-500 p-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mr-3 aspect-square shadow-sm">
            <img src={PROFE_JEMI_REAL} alt="Profe Jemi" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-outfit font-bold">Chat con Jemi</h2>
            <p className="text-xs opacity-90">{user.level} • {user.accent}</p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg, i) => {
          const paragraphs = msg.role === 'model' ? getParagraphs(msg.text) : [msg.text];
          return (
            <div key={i} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              {msg.role !== 'user' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-200 overflow-hidden mt-1 aspect-square shadow-sm">
                  <img src={PROFE_JEMI_REAL} alt="Jemi" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="max-w-[80%] space-y-2">
                {paragraphs.map((p, pIdx) => {
                  const audioKey = `${i}-${pIdx}`;
                  return (
                    <div key={pIdx} className={`rounded-2xl p-4 shadow-sm relative ${msg.role === 'user' ? 'bg-red-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                      }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{p}</p>
                      {msg.role === 'model' && (
                        <button onClick={() => playSpeech(p, audioKey)} disabled={playingAudioKey !== null} className={`mt-2 flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${playingAudioKey === audioKey ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-red-50'}`}>
                          <span>🔊 Escuchar</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex space-x-1 p-4 bg-white rounded-2xl w-16">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t flex space-x-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Habla con la Profe Jemi...`} className="flex-grow border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
        <button type="submit" disabled={isLoading || !input.trim()} className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 disabled:bg-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
