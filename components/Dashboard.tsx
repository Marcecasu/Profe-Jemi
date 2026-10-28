import React from 'react';
import { User, SpanishLevel } from '../types';
import PricingModal from './Subscription/PricingModal';
import { useAuth } from '../contexts/AuthContext';

const PROFE_JEMI_REAL = "/profe_jemi.jpg";

// Sugerencias personalizadas según nivel
const SUGGESTIONS: Record<string, { icon: string; title: string; desc: string; action: string; view: string }[]> = {
  [SpanishLevel.BASIC]: [
    { icon: '🗣️', title: 'Comunícate al instante', desc: 'Usa el Intérprete en Vivo para traducir tu voz al español con modismos locales.', action: 'Ir a Intérprete', view: 'interpreter' },
    { icon: '🎙️', title: 'Practica tu pronunciación', desc: 'Habla con la Profe Jemi en vivo para ganar confianza desde el primer día.', action: 'Ir a Live', view: 'voice' },
    { icon: '📸', title: 'Aprende vocabulario visual', desc: 'Sube una foto de tu entorno y aprende los nombres en español.', action: 'Ir a Vision', view: 'vision' },
  ],
  [SpanishLevel.INTERMEDIATE]: [
    { icon: '🗣️', title: 'Aprende modismos de la calle', desc: 'El Intérprete te enseña las palabras coloquiales exactas de cada país.', action: 'Ir a Intérprete', view: 'interpreter' },
    { icon: '💬', title: 'Conversa sobre temas reales', desc: 'Practica situaciones del día a día con el Tutor IA.', action: 'Ir al Tutor', view: 'chat' },
    { icon: '🎙️', title: 'Mejora tu fluidez oral', desc: 'Las conversaciones en vivo te ayudarán a pensar en español.', action: 'Ir a Live', view: 'voice' },
  ],
  [SpanishLevel.ADVANCED]: [
    { icon: '🎙️', title: 'Debate en español', desc: 'Pon a prueba tu fluidez debatiendo temas complejos en vivo.', action: 'Ir a Live', view: 'voice' },
    { icon: '💬', title: 'Perfecciona tu escritura', desc: 'Escribe textos y deja que la Profe Jemi los corrija.', action: 'Ir al Tutor', view: 'chat' },
    { icon: '📸', title: 'Vocabulario especializado', desc: 'Sube fotos técnicas o artísticas para aprender vocabulario avanzado.', action: 'Ir a Vision', view: 'vision' },
  ],
};

// Títulos de herramientas
const TOOLS = [
  { id: 'interpreter', icon: '🗣️', name: 'Intérprete', desc: 'Traducción en vivo' },
  { id: 'chat', icon: '💬', name: 'Tutor IA', desc: 'Chat inteligente' },
  { id: 'voice', icon: '🎙️', name: 'Live', desc: 'Conversación en vivo' },
  { id: 'vision', icon: '📸', name: 'Vision', desc: 'Analizar imágenes' },
  { id: 'courses', icon: '📚', name: 'Cursos', desc: 'Lecciones guiadas' },
  { id: 'podcasts', icon: '🎧', name: 'Podcasts', desc: 'Aprende escuchando' },
];

interface DashboardProps {
  user: User;
  onLevelChange: (level: SpanishLevel) => void;
  onNavigate: (view: string) => void;
  liveMinutesUsed?: number;
  visionCountUsed?: number;
  translationsCountUsed?: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigate,
  liveMinutesUsed = 0,
  visionCountUsed = 0,
  translationsCountUsed = 0
}) => {
  const [showPricing, setShowPricing] = React.useState(false);
  const { profile, isAdmin } = useAuth();

  const isPremium = profile?.subscription_status === 'active' || isAdmin;
  const liveMinutesLeft = Math.max(0, 15 - liveMinutesUsed);
  const visionLeft = Math.max(0, 5 - visionCountUsed);
  const translationsLeft = Math.max(0, 7 - translationsCountUsed);

  // Scoring system based on user data
  const lessonsScore = Math.min(40, Math.floor(user.progress * 0.4)); // Max 40 pts
  const onboardingScore = user.hasCompletedOnboarding ? 10 : 0; // 10 pts
  const goalScore = user.learningGoal ? 10 : 0; // 10 pts
  const accentScore = user.accent ? 10 : 0; // 10 pts
  const levelBonus = user.level === SpanishLevel.INTERMEDIATE ? 15 : user.level === SpanishLevel.ADVANCED ? 30 : 0;
  const totalScore = lessonsScore + onboardingScore + goalScore + accentScore + levelBonus;

  const suggestions = SUGGESTIONS[user.level] || SUGGESTIONS[SpanishLevel.BASIC];

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  let greeting = '¡Buenos días';
  if (hour >= 19 || hour < 5) greeting = '¡Buenas noches';
  else if (hour >= 12 && hour < 19) greeting = '¡Buenas tardes';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full text-gray-900">
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />

      {/* Hero Section */}
      <div className="relative mb-10 rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-red-600 to-red-400 min-h-[380px] flex flex-col md:flex-row items-center">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="relative z-10 p-8 md:p-14 text-white flex-grow md:max-w-[60%] text-center md:text-left">
          <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border border-white/20">
            ✨ {greeting}, {user.name}! ✨
          </span>
          <h2 className="text-3xl md:text-5xl font-outfit font-extrabold mb-5 leading-tight">
            ¿Listo para tu clase de hoy? 🧠
          </h2>
          <p className="text-base text-red-50 mb-8 opacity-90 leading-relaxed max-w-xl italic">
            "Tu progreso es mi mayor alegría. ¡Sigamos practicando!" 🌟
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => onNavigate('interpreter')}
              className="bg-white text-red-600 font-bold py-3 px-6 rounded-2xl hover:bg-red-50 transition-all shadow-xl active:scale-95 text-sm flex items-center gap-1.5"
            >
              <span>🗣️</span> Intérprete en Vivo
            </button>
            <button
              onClick={() => onNavigate('courses')}
              className="bg-red-700/40 backdrop-blur-md text-white border border-white/30 font-bold py-3 px-6 rounded-2xl hover:bg-red-700/60 transition-all active:scale-95 text-sm"
            >
              Ver mis cursos 📚
            </button>
            <button
              onClick={() => onNavigate('voice')}
              className="bg-red-700/40 backdrop-blur-md text-white border border-white/30 font-bold py-3 px-6 rounded-2xl hover:bg-red-700/60 transition-all active:scale-95 text-sm"
            >
              Conversación Live 🎙️
            </button>
            {!isPremium && (
              <button
                onClick={() => setShowPricing(true)}
                className="bg-amber-400 text-amber-900 font-bold py-3 px-6 rounded-2xl hover:bg-amber-300 transition-all shadow-xl active:scale-95 text-sm border border-amber-200"
              >
                🚀 Hacerse Premium
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 p-6 md:p-10 flex items-center justify-center flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="w-52 h-52 md:w-72 md:h-72 rounded-full border-8 border-white shadow-2xl overflow-hidden relative aspect-square">
              <img src={PROFE_JEMI_REAL} alt="Profe Jemi" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -right-3 bg-green-500 border-4 border-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Estado: Freemium vs Premium */}
      {!isPremium ? (
        <div className="bg-gradient-to-r from-red-50 via-white to-amber-50 border border-red-100 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <span>🎁</span> Plan Gratuito Activo (Sin caducidad)
              </div>
              <h3 className="text-xl font-outfit font-black text-gray-900">
                Tus Créditos Mensuales de Práctica
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Disfrutas de acceso libre a la gramática básica y una cuota mensual gratuita de IA.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Cupo Intérprete */}
              <div className="bg-white px-3.5 py-3 rounded-2xl border border-gray-200 shadow-sm flex-1 sm:flex-initial min-w-[130px]">
                <div className="flex items-center justify-between text-xs text-gray-500 font-bold mb-1">
                  <span>🗣️ Intérprete</span>
                  <span className="text-red-600 font-extrabold">{translationsLeft} frases</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (translationsCountUsed / 7) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">de 7 al mes</p>
              </div>

              {/* Cupo Live */}
              <div className="bg-white px-3.5 py-3 rounded-2xl border border-gray-200 shadow-sm flex-1 sm:flex-initial min-w-[130px]">
                <div className="flex items-center justify-between text-xs text-gray-500 font-bold mb-1">
                  <span>🎙️ Voz Live</span>
                  <span className="text-red-600 font-extrabold">{liveMinutesLeft} min</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (liveMinutesUsed / 15) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">de 15 min al mes</p>
              </div>

              {/* Cupo Vision */}
              <div className="bg-white px-3.5 py-3 rounded-2xl border border-gray-200 shadow-sm flex-1 sm:flex-initial min-w-[130px]">
                <div className="flex items-center justify-between text-xs text-gray-500 font-bold mb-1">
                  <span>📸 Vision IA</span>
                  <span className="text-red-600 font-extrabold">{visionLeft} fotos</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (visionCountUsed / 5) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">de 5 al mes</p>
              </div>

              {/* Botón Upgrade */}
              <button
                onClick={() => setShowPricing(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black py-3 px-5 rounded-2xl transition-all shadow-lg active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <span>Hacerse Premium</span>
                <span>💎</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">👑</span>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider mb-1">
                Miembro Premium Activo
              </div>
              <h3 className="text-lg font-outfit font-black text-gray-900">
                Acceso Ilimitado Desbloqueado ✨
              </h3>
              <p className="text-xs text-gray-600">
                Traducción simultánea ilimitada, 30h de Live, todos los acentos regionales, Vision ilimitada y cursos EFE.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Puntuación Total */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-2xl shadow-lg text-white col-span-2 md:col-span-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 opacity-80">Puntuación 🏆</h3>
          <div className="flex items-end space-x-1">
            <span className="text-5xl font-black">{totalScore}</span>
            <span className="text-lg opacity-70 pb-1">/ 100</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${totalScore}%` }}></div>
          </div>
        </div>

        {/* Progreso */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Progreso 📈</h3>
          <div className="flex items-end space-x-1 text-gray-900">
            <span className="text-4xl font-bold">{user.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${user.progress}%` }}></div>
          </div>
        </div>

        {/* Racha */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Racha 🔥</h3>
          <div className="flex items-center space-x-2 text-gray-900">
            <span className="text-4xl font-bold">1</span>
            <span className="text-orange-500 text-lg font-semibold">día</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">¡Sigue así!</p>
        </div>

        {/* Nivel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Nivel ⚙️</h3>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm">{user.level}</span>
          <p className="text-xs text-gray-400 mt-3">{user.accent}</p>
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="mb-8">
        <h3 className="text-lg font-outfit font-bold text-gray-800 mb-4">Herramientas 🛠️</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-left group"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{tool.icon}</span>
              <h4 className="font-bold text-gray-900 text-sm">{tool.name}</h4>
              <p className="text-xs text-gray-400">{tool.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions for Improvement */}
      <div className="mb-8">
        <h3 className="text-lg font-outfit font-bold text-gray-800 mb-4">Sugerencias para mejorar 💡</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((sug, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all">
              <span className="text-3xl mb-3">{sug.icon}</span>
              <h4 className="font-bold text-gray-900 mb-2">{sug.title}</h4>
              <p className="text-sm text-gray-500 flex-grow mb-4">{sug.desc}</p>
              <button
                onClick={() => onNavigate(sug.view)}
                className="bg-red-50 text-red-600 font-bold py-2 px-4 rounded-xl hover:bg-red-100 transition-colors text-sm self-start"
              >
                {sug.action} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-outfit font-bold text-gray-800 mb-4">Desglose de puntuación 🎯</h3>
        <div className="space-y-3">
          {[
            { label: 'Lecciones completadas', score: lessonsScore, max: 40, icon: '📚' },
            { label: 'Onboarding completado', score: onboardingScore, max: 10, icon: '✅' },
            { label: 'Objetivo definido', score: goalScore, max: 10, icon: '🎯' },
            { label: 'Acento elegido', score: accentScore, max: 10, icon: '📍' },
            { label: 'Bonus por nivel', score: levelBonus, max: 30, icon: '🏅' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-lg w-8">{item.icon}</span>
              <span className="text-sm text-gray-700 flex-grow">{item.label}</span>
              <span className="text-sm font-bold text-gray-900">{item.score}/{item.max}</span>
              <div className="w-24 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${item.score === item.max ? 'bg-green-500' : 'bg-red-400'}`}
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
