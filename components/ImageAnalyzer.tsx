
import React, { useState, useRef } from 'react';
import { analyzeImageVocabulary, generateSpeech } from '../services/gemini';
import { User } from '../types';

interface ImageAnalyzerProps {
  user: User;
  onNavigate: (view: string) => void;
}

// IMPORTANTE: Ruta local a la imagen real de la Profe Jemi
const PROFE_JEMI_REAL = "./profe_jemi.jpg";

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

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ user }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [playingAudioIdx, setPlayingAudioIdx] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setSelectedImage(reader.result as string); setResult(null); };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      const analysis = await analyzeImageVocabulary(base64Data, mimeType, user.accent, user.nativeLanguage);
      setResult(analysis);
    } catch (error: any) {
      console.error('[ImageAnalyzer] Catch error:', error);
      alert(`Error al analizar: ${error?.message || error}. ¡Reintenta!`);
    } finally { setIsAnalyzing(false); }
  };

  const playSpeech = async (text: string, id: string) => {
    if (playingAudioIdx !== null) return;
    setPlayingAudioIdx(id);
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioData = await generateSpeech(text, user.accent);
      if (audioData) {
        const bytes = decodeBase64(audioData);
        const buffer = await decodeAudioData(bytes, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackSpeed;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlayingAudioIdx(null);
        source.start();
      } else { setPlayingAudioIdx(null); }
    } catch (e) { setPlayingAudioIdx(null); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full text-gray-900">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-outfit font-black text-gray-900 mb-2">¿Qué es esto en español? 📸</h2>
        <p className="text-gray-600">Saca una foto y la Profe Jemi te enseñará vocabulario. ✨</p>
      </div>

      {!selectedImage ? (
        <div onClick={() => fileInputRef.current?.click()} className="bg-white border-4 border-dashed border-red-100 rounded-[3rem] p-16 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 transition-all min-h-[400px]">
          <span className="text-6xl mb-4">📸</span>
          <p className="text-2xl font-black text-gray-700">Toca para tomar una foto</p>
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8">
            <img src={selectedImage} alt="Preview" className="w-full h-80 object-cover rounded-2xl mb-8" />
            {!result && (
              <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl disabled:bg-gray-300">
                {isAnalyzing ? "Analizando... 👀" : "Analizar con Profe Jemi ✨"}
              </button>
            )}
            {result && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="bg-red-50 p-6 rounded-2xl border-l-8 border-red-500 flex items-start space-x-4 flex-grow">
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-red-500 aspect-square shadow-sm">
                      <img src={PROFE_JEMI_REAL} alt="Jemi" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-red-900 font-bold italic">"{result.intro}"</p>
                  </div>

                  {/* Controles de Velocidad */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center shrink-0 min-w-[140px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Velocidad</span>
                    <div className="flex space-x-2">
                      {[0.75, 1.0, 1.25].map(speed => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${playbackSpeed === speed ? 'bg-red-500 text-white shadow-md scale-110' : 'bg-gray-50 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col group">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-2xl font-black">{item.word}</h4>
                        <button
                          onClick={() => playSpeech(item.word, `w-${idx}`)}
                          className={`p-2.5 rounded-full transition-all ${playingAudioIdx === `w-${idx}` ? 'bg-red-500 text-white scale-110' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                          title="Escuchar palabra"
                        >
                          🔊
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-start justify-between group-hover:bg-red-50/30 transition-colors">
                        <p className="text-sm text-gray-700 italic leading-relaxed pr-2">"{item.example}"</p>
                        <button
                          onClick={() => playSpeech(item.example, `ex-${idx}`)}
                          className={`shrink-0 p-1.5 rounded-full transition-all ${playingAudioIdx === `ex-${idx}` ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-red-500 hover:bg-white'}`}
                          title="Escuchar frase de ejemplo"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.explanation}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setSelectedImage(null); setResult(null); }} className="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors">Analizar otra foto</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
