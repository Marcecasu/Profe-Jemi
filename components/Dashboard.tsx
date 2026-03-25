
import React from 'react';
import { User, SpanishLevel } from '../types';
import PricingModal from './Subscription/PricingModal';

interface DashboardProps {
  user: User;
  onLevelChange: (level: SpanishLevel) => void;
  onNavigate: (view: string) => void;
}

const PROFE_JEMI_REAL = "/profe_jemi.jpg";

// Sugerencias personalizadas según nivel
const SUGGESTIONS: Record<string, { icon: string; title: string; desc: string; action: string; view: string }[]> = {
  [SpanishLevel.BASIC]: [
    { icon: '🎙️', title: 'Practica tu pronunciación', desc: 'Habla con la Profe Jemi en vivo para ganar confianza desde el primer día.', action: 'Ir a Live', view: 'voice' },
    { icon: '📸', title: 'Aprende vocabulario visual', desc: 'Sube una foto de tu entorno y aprende los nombres en español.', action: 'Ir a Vision', view: 'vision' },
    { icon: '📚', title: 'Completa tu primera lección', desc: 'Empieza con saludos y presentaciones para romper el hielo.', action: 'Ver Cursos', view: 'courses' },
  ],
  [SpanishLevel.INTERMEDIATE]: [
    { icon: '💬', title: 'Conversa sobre temas reales', desc: 'Practica situaciones del día a día con el Tutor IA.', action: 'Ir al Tutor', view: 'chat' },
    { icon: '🎙️', title: 'Mejora tu fluidez oral', desc: 'Las conversaciones en vivo te ayudarán a pensar en español.', action: 'Ir a Live', view: 'voice' },
    { icon: '📚', title: 'Domina los tiempos verbales', desc: 'El pasado es tu próximo reto. ¡Atrévete!', action: 'Ver Cursos', view: 'courses' },
  ],
  [SpanishLevel.ADVANCED]: [
    { icon: '🎙️', title: 'Debate en español', desc: 'Pon a prueba tu fluidez debatiendo temas complejos en vivo.', action: 'Ir a Live', view: 'voice' },
    { icon: '💬', title: 'Perfecciona tu escritura', desc: 'Escribe textos y deja que la Profe Jemi los corrija.', action: 'Ir al Tutor', view: 'chat' },
    { icon: '📸', title: 'Vocabulario especializado', desc: 'Sube fotos técnicas o artísticas para aprender vocabulario avanzado.', action: 'Ir a Vision', view: 'vision' },
  ],
};

// Títulos de herramientas
const TOOLS = [
  { id: 'chat', icon: '💬', name: 'Tutor IA', desc: 'Chat inteligente' },
  { id: 'voice', icon: '🎙️', name: 'Live', desc: 'Conversación en vivo' },
  { id: 'vision', icon: '📸', name: 'Vision', desc: 'Analizar imágenes' },
  { id: 'courses', icon: '📚', name: 'Cursos', desc: 'Lecciones guiadas' },
];

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [showPricing, setShowPricing] = React.useState(false);

  // Safe access - these fields may not exist on the User type from localStorage
  const isPremium = (user as any).subscription_status === 'active' || (user as any).role === 'admin';
  const trialEndsAt = (user as any).trial_ends_at;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 14;

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
  const greeting = hour < 12 ? '¡Buenos días' : hour < 18 ? '¡Buenas tardes' : '¡Buenas noches';

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
              onClick={() => onNavigate('courses')}
              className="bg-white text-red-600 font-bold py-3 px-8 rounded-2xl hover:bg-red-50 transition-all shadow-xl active:scale-95 text-sm"
            >
              Ver mis cursos 📚
            </button>
            <button
              onClick={() => onNavigate('voice')}
              className="bg-red-700/40 backdrop-blur-md text-white border border-white/30 font-bold py-3 px-8 rounded-2xl hover:bg-red-700/60 transition-all active:scale-95 text-sm"
            >
              Conversación Live 🎙️
            </button>
            {!isPremium && (
              <button
                onClick={() => setShowPricing(true)}
                className="bg-amber-400 text-amber-900 font-bold py-3 px-8 rounded-2xl hover:bg-amber-300 transition-all shadow-xl active:scale-95 text-sm border border-amber-200"
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

      {/* Trial Warning */}
      {!isPremium && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="mb-3 md:mb-0">
            <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <span>⚠️</span> Tienes {daysLeft} días de prueba restante
            </h3>
            <p className="text-amber-800 text-sm">Suscríbete ahora para no perder acceso a tus clases y progreso.</p>
          </div>
          <button
            onClick={() => setShowPricing(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-md text-sm"
          >
            Actualizar Plan 💎
          </button>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-left group"
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
