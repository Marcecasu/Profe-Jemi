
import React, { useState, useEffect } from 'react';
import { User, SpanishLevel, UserGender, SpanishAccent } from '../types';

interface OnboardingProps {
  onComplete: (userData: Partial<User>) => void;
}

// IMPORTANTE: Ruta local a la imagen real de la Profe Jemi
const PROFE_JEMI_REAL = "./profe_jemi.jpg";

const COMMON_LANGUAGES = [
  'Inglés 🇺🇸', 'Español 🇪🇸', 'Portugués 🇧🇷', 'Francés 🇫🇷', 'Alemán 🇩🇪', 'Italiano 🇮🇹'
];

const GENDERS: UserGender[] = ['Hombre', 'Mujer', 'No Identificarme'];

const ACCENTS: { name: SpanishAccent, icon: string }[] = [
  { name: 'Español de España', icon: '🇪🇸' },
  { name: 'Español de México', icon: '🇲🇽' },
  { name: 'Español del Rio de la Plata (Argentina y Uruguay)', icon: '🇦🇷' },
  { name: 'Español de Chile', icon: '🇨🇱' },
  { name: 'Español de Colombia', icon: '🇨🇴' },
  { name: 'Español de Paraguay', icon: '🇵🇾' }
];

const TRANSLATIONS: Record<string, any> = {
  'Español': {
    welcome: '¡Bienvenido! 👋',
    detecting: 'Detecto que hablas español. ¿Es correcto? ✨',
    nameTitle: '¿Cómo te llamas? ✍️',
    nameDesc: 'Para que la Profe Jemi pueda saludarte en cada clase.',
    namePlaceholder: 'Escribe tu nombre...',
    genderTitle: '¿Cuál es tu género? 👤',
    genderDesc: 'Esto ayudará a la Profe Jemi a dirigirse a ti de forma correcta.',
    accentTitle: '¿Qué acento quieres aprender? 📍',
    accentDesc: 'La Profe Jemi adaptará su vocabulario a la región que elijas.',
    goalTitle: 'Quiero conocerte... 🤝',
    goalDesc: '¿Cuál es el objetivo que tienes al aprender español?',
    goals: [
      { id: 'turismo', icon: '✈️', label: 'Para viajar como turista' },
      { id: 'trabajo', icon: '💼', label: 'Para trabajar' },
      { id: 'estudio', icon: '🎓', label: 'Para estudiar' },
      { id: 'cultura', icon: '🥘', label: 'Amo la cultura, la música y la comida' }
    ],
    situationTitle: 'Prioridades 🎯',
    situationDesc: '¿Para cuál de estas situaciones quieres aprender primero?',
    situations: [
      { icon: '🏠', label: 'Alquiler de casa/apartamento' },
      { icon: '🛒', label: 'Compras en supermercados' },
      { icon: '📄', label: 'Comunicación oficial' },
      { icon: '💰', label: 'Cuestiones financieras' },
      { icon: '🧹', label: 'Cuestiones del hogar' },
      { icon: '🏥', label: 'Salud' },
      { icon: '🎉', label: 'Tiempo libre' },
      { icon: '🚌', label: 'Utilizar servicios públicos' },
      { icon: '🚗', label: 'Transporte y movilidad' },
      { icon: '🍽️', label: 'Restaurantes y gastronomía' },
      { icon: '🚨', label: 'Emergencias y seguridad' }
    ],
    levelTitle: '¿Cuál es tu nivel? 📈',
    levelDesc: 'Adaptaremos las lecciones a tu capacidad actual.',
    levelBasic: 'Empezando mi aventura. 🌱',
    levelInt: 'Ya puedo comunicarme. 🌿',
    levelAdv: 'Busco perfeccionamiento total. 🌳',
    continue: 'Continuar ➡️',
    start: '¡Empezar mi viaje! 🚀',
    detectConfirm: '¡Sí, es correcto! ✅',
    detectChange: 'No, elegir otro idioma 🌍',
    langSelect: '¿Cuál es tu idioma nativo?',
    genderOptions: ['Hombre', 'Mujer', 'No Identificarme']
  },
  'Inglés': {
    welcome: 'Welcome! 👋',
    detecting: 'I detect your language is English. Is that correct? ✨',
    nameTitle: 'What is your name? ✍️',
    nameDesc: 'So Profe Jemi can greet you in every class.',
    namePlaceholder: 'Enter your name...',
    genderTitle: 'What is your gender? 👤',
    genderDesc: 'This helps Profe Jemi address you correctly.',
    accentTitle: 'Which accent do you want to learn? 📍',
    accentDesc: 'Profe Jemi will adapt her vocabulary to your chosen region.',
    goalTitle: 'I want to get to know you... 🤝',
    goalDesc: 'What is your goal for learning Spanish?',
    goals: [
      { id: 'turismo', icon: '✈️', label: 'For traveling as a tourist' },
      { id: 'trabajo', icon: '💼', label: 'For work/business' },
      { id: 'estudio', icon: '🎓', label: 'For studying' },
      { id: 'cultura', icon: '🥘', label: 'I love Hispanic culture and food' }
    ],
    situationTitle: 'Priorities 🎯',
    situationDesc: 'Which situation do you want to learn first?',
    situations: [
      { icon: '🏠', label: 'Renting a home/apartment' },
      { icon: '🛒', label: 'Supermarket shopping' },
      { icon: '📄', label: 'Official communication' },
      { icon: '💰', label: 'Financial matters' },
      { icon: '🧹', label: 'Household issues' },
      { icon: '🏥', label: 'Healthcare' },
      { icon: '🎉', label: 'Leisure time' },
      { icon: '🚌', label: 'Using public services' },
      { icon: '🚗', label: 'Transportation & getting around' },
      { icon: '🍽️', label: 'Restaurants & food culture' },
      { icon: '🚨', label: 'Emergencies & safety' }
    ],
    levelTitle: 'What is your level? 📈',
    levelDesc: 'We will adapt lessons to your current ability.',
    levelBasic: 'Starting my adventure. 🌱',
    levelInt: 'I can already communicate. 🌿',
    levelAdv: 'Seeking total perfection. 🌳',
    continue: 'Continue ➡️',
    start: 'Start my journey! 🚀',
    detectConfirm: 'Yes, that is correct! ✅',
    detectChange: 'No, choose another language 🌍',
    langSelect: 'What is your native language?',
    genderOptions: ['Man', 'Woman', 'Do not identify']
  },
  'Portugués': {
    welcome: 'Bem-vindo! 👋',
    detecting: 'Detecto que você fala português. Está correto? ✨',
    nameTitle: 'Qual é o seu nome? ✍️',
    nameDesc: 'Para que a Profe Jemi possa cumprimentá-lo em cada aula.',
    namePlaceholder: 'Escreva seu nome...',
    genderTitle: 'Qual é o seu gênero? 👤',
    genderDesc: 'Isso ajudará a Profe Jemi a se dirigir a você corretamente.',
    accentTitle: 'Qual sotaque você quer aprender? 📍',
    accentDesc: 'A Profe Jemi adaptará seu vocabulário à região escolhida.',
    goalTitle: 'Quero te conhecer... 🤝',
    goalDesc: 'Qual é o seu objetivo ao aprender espanhol?',
    goals: [
      { id: 'turismo', icon: '✈️', label: 'Para viajar como turista' },
      { id: 'trabajo', icon: '💼', label: 'Para trabalhar' },
      { id: 'estudio', icon: '🎓', label: 'Para estudar' },
      { id: 'cultura', icon: '🥘', label: 'Amo a cultura e a comida' }
    ],
    situationTitle: 'Prioridades 🎯',
    situationDesc: 'Para qual destas situações você quer aprender primeiro?',
    situations: [
      { icon: '🏠', label: 'Aluguel de casa/apartamento' },
      { icon: '🛒', label: 'Compras no supermercado' },
      { icon: '📄', label: 'Comunicação oficial' },
      { icon: '💰', label: 'Questões financeiras' },
      { icon: '🧹', label: 'Questões domésticas' },
      { icon: '🏥', label: 'Saúde' },
      { icon: '🎉', label: 'Tempo livre' },
      { icon: '🚌', label: 'Serviços públicos' },
      { icon: '🚗', label: 'Transporte e mobilidade' },
      { icon: '🍽️', label: 'Restaurantes e gastronomia' },
      { icon: '🚨', label: 'Emergências e segurança' }
    ],
    levelTitle: 'Qual é o seu nível? 📈',
    levelDesc: 'Adaptaremos as lições à sua capacidade atual.',
    levelBasic: 'Começando minha aventura. 🌱',
    levelInt: 'Já consigo me comunicar. 🌿',
    levelAdv: 'Busco aperfeiçoamento total. 🌳',
    continue: 'Continuar ➡️',
    start: 'Começar minha jornada! 🚀',
    detectConfirm: 'Sim, está correto! ✅',
    detectChange: 'Não, escolher outro idioma 🌍',
    langSelect: 'Qual é o seu idioma nativo?',
    genderOptions: ['Homem', 'Mulher', 'Não identificar']
  },
  'Francés': {
    welcome: 'Bienvenue ! 👋',
    detecting: 'Je détecte que vous parlez français. Est-ce correct ? ✨',
    nameTitle: 'Quel est votre nom ? ✍️',
    nameDesc: 'Pour que Profe Jemi puisse vous saluer à chaque cours.',
    namePlaceholder: 'Entrez votre nom...',
    genderTitle: 'Quel est votre genre ? 👤',
    genderDesc: 'Cela aidera Profe Jemi à s\'adresser à vous correctement.',
    accentTitle: 'Quel accent voulez-vous apprendre ? 📍',
    accentDesc: 'Profe Jemi adaptera son vocabulaire à la région choisie.',
    goalTitle: 'Je veux vous connaître... 🤝',
    goalDesc: 'Quel est votre objectif en apprenant l\'espagnol ?',
    goals: [
      { id: 'turismo', icon: '✈️', label: 'Pour voyager en touriste' },
      { id: 'trabajo', icon: '💼', label: 'Pour le travail' },
      { id: 'estudio', icon: '🎓', label: 'Pour étudier' },
      { id: 'cultura', icon: '🥘', label: 'J\'aime la culture et la cuisine' }
    ],
    situationTitle: 'Priorités 🎯',
    situationDesc: 'Laquelle de ces situations voulez-vous apprendre en premier ?',
    situations: [
      { icon: '🏠', label: 'Location de maison/appartement' },
      { icon: '🛒', label: 'Courses au supermarché' },
      { icon: '📄', label: 'Communication officielle' },
      { icon: '💰', label: 'Questions financières' },
      { icon: '🧹', label: 'Tâches ménagères' },
      { icon: '🏥', label: 'Santé' },
      { icon: '🎉', label: 'Temps libre' },
      { icon: '🚌', label: 'Services publics' },
      { icon: '🚗', label: 'Transport et déplacements' },
      { icon: '🍽️', label: 'Restaurants et gastronomie' },
      { icon: '🚨', label: 'Urgences et sécurité' }
    ],
    levelTitle: 'Quel est votre niveau ? 📈',
    levelDesc: 'Nous adapterons les leçons à votre capacité actuelle.',
    levelBasic: 'Je commence mon aventure. 🌱',
    levelInt: 'Je peux déjà communiquer. 🌿',
    levelAdv: 'Je recherche le perfectionnement total. 🌳',
    continue: 'Continuer ➡️',
    start: 'Commencer mon voyage ! 🚀',
    detectConfirm: 'Oui, c\'est correct ! ✅',
    detectChange: 'Non, choisir une autre langue 🌍',
    langSelect: 'Quelle est votre langue maternelle ?',
    genderOptions: ['Homme', 'Femme', 'Non identifié']
  }
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<'detection' | 'selection'>('detection');
  const [loadingDetection, setLoadingDetection] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    level: SpanishLevel.BASIC,
    gender: 'No Identificarme' as UserGender,
    accent: 'Español de España' as SpanishAccent,
    learningGoal: '',
    prioritySituation: '',
    nativeLanguage: 'Inglés'
  });

  useEffect(() => {
    const detectUser = async () => {
      let detectedLanguage = 'Inglés';
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const map: Record<string, string> = { es: 'Español', pt: 'Portugués', it: 'Italiano', fr: 'Francés', de: 'Alemán', en: 'Inglés' };
      if (map[browserLang]) detectedLanguage = map[browserLang];
      setFormData(prev => ({ ...prev, nativeLanguage: detectedLanguage }));
      setTimeout(() => setLoadingDetection(false), 800);
    };
    detectUser();
  }, []);

  const t = TRANSLATIONS[formData.nativeLanguage] || TRANSLATIONS['Inglés'];
  const nextStep = () => setStep(prev => prev + 1);

  const handleSubmit = () => {
    onComplete({ ...formData, hasCompletedOnboarding: true, progress: 0, isSubscribed: false });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row items-stretch">
      {/* Sidebar con imagen circulada de la Profe Jemi */}
      <div className="hidden md:flex md:w-5/12 bg-red-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 text-white text-center">
          <div className="mb-8 inline-block bg-white p-2 rounded-full shadow-2xl">
            <div className="w-56 h-56 rounded-full overflow-hidden border-8 border-white shadow-2xl aspect-square">
              <img src={PROFE_JEMI_REAL} alt="Profe Jemi" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-6xl font-outfit font-black mb-4 leading-tight">Profe Jemi</h1>
          <p className="text-2xl font-light opacity-80 italic">"¡Aprender español nunca fue tan divertido!" ✨</p>
        </div>
      </div>

      <div className="w-full md:w-7/12 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="max-w-lg w-full py-8">

          {/* Cabecera móvil con la Profe Jemi */}
          <div className="flex md:hidden items-center space-x-4 mb-8 p-4 bg-red-50 rounded-3xl border border-red-100 animate-in fade-in slide-in-from-top duration-500">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0 aspect-square">
              <img src={PROFE_JEMI_REAL} alt="Profe Jemi" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-outfit font-black text-red-600 text-xl">Profe Jemi ✨</h2>
              <p className="text-sm text-red-400 font-medium">¡Te ayudo a configurar todo!</p>
            </div>
          </div>

          {step === 1 && (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-8 text-4xl shadow-sm">🌍</div>
              {subStep === 'detection' ? (
                loadingDetection ? (
                  <h2 className="text-3xl font-outfit font-bold text-gray-900">Configurando tu entorno... ⚙️</h2>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-4xl font-outfit font-bold text-gray-900 leading-tight">{t.welcome}</h2>
                    <p className="text-gray-600 text-lg">{t.detecting}</p>
                    <div className="space-y-3 pt-4">
                      <button onClick={nextStep} className="w-full bg-red-500 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95">{t.detectConfirm}</button>
                      <button onClick={() => setSubStep('selection')} className="w-full text-gray-400 font-medium py-2 hover:text-gray-600 transition-colors underline">{t.detectChange}</button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <h2 className="text-3xl font-outfit font-bold text-gray-900 leading-tight">{t.langSelect}</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_LANGUAGES.map(lang => {
                      const langName = lang.split(' ')[0];
                      return (
                        <button key={lang} onClick={() => { setFormData({ ...formData, nativeLanguage: langName }); setSubStep('detection'); }} className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.nativeLanguage === langName ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>{lang}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right duration-500">
              <h2 className="text-4xl font-outfit font-bold text-gray-900 mb-4 leading-tight">{t.nameTitle}</h2>
              <p className="text-gray-500 mb-6">{t.nameDesc}</p>
              <input autoFocus type="text" placeholder={t.namePlaceholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && formData.name.trim() && nextStep()} className="w-full border-b-4 border-red-500 bg-transparent py-4 text-4xl font-bold focus:outline-none placeholder-gray-100" />
              <button disabled={!formData.name.trim()} onClick={nextStep} className="mt-16 w-full bg-red-500 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-red-600 disabled:bg-gray-200 transition-all active:scale-95">{t.continue}</button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-500">
              <h2 className="text-4xl font-outfit font-bold text-gray-900 mb-4 leading-tight">{t.genderTitle}</h2>
              <p className="text-gray-500 mb-6">{t.genderDesc}</p>
              <div className="space-y-4">
                {GENDERS.map((gender, idx) => (
                  <button key={gender} onClick={() => { setFormData({ ...formData, gender }); nextStep(); }} className={`w-full flex items-center p-6 rounded-3xl border-2 transition-all ${formData.gender === gender ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
                    <span className="text-3xl mr-6">{idx === 1 ? '👩' : idx === 0 ? '👨' : '👤'}</span>
                    <span className="font-bold text-xl">{t.genderOptions[idx]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in slide-in-from-right duration-500">
              <h2 className="text-4xl font-outfit font-bold text-gray-900 mb-4 leading-tight">{t.accentTitle}</h2>
              <p className="text-gray-500 mb-6">{t.accentDesc}</p>
              <div className="grid grid-cols-1 gap-3">
                {ACCENTS.map((acc) => (
                  <button key={acc.name} onClick={() => { setFormData({ ...formData, accent: acc.name }); nextStep(); }} className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all ${formData.accent === acc.name ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
                    <span className="text-2xl mr-4">{acc.icon}</span>
                    <span className="font-bold text-base">{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in slide-in-from-right duration-500">
              <h2 className="text-4xl font-outfit font-bold text-gray-900 mb-4 leading-tight">{t.goalTitle}</h2>
              <p className="text-gray-500 mb-8">{t.goalDesc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {t.goals.map((goal: any) => (
                  <button key={goal.id} onClick={() => { setFormData({ ...formData, learningGoal: goal.label }); nextStep(); }} className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all hover:border-red-300 ${formData.learningGoal === goal.label ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
                    <span className="text-4xl mb-3">{goal.icon}</span>
                    <span className="font-bold text-center text-sm leading-tight text-gray-800">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-outfit font-bold text-gray-900 mb-4 leading-tight">{t.situationTitle}</h2>
              <p className="text-gray-500 mb-6">{t.situationDesc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {t.situations.map((sit: any) => (
                  <button key={sit.label} onClick={() => { setFormData({ ...formData, prioritySituation: sit.label }); nextStep(); }} className={`flex items-center p-4 rounded-2xl border-2 transition-all ${formData.prioritySituation === sit.label ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
                    <span className="text-2xl mr-3">{sit.icon}</span>
                    <span className="font-bold text-left text-xs text-gray-700">{sit.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="animate-in slide-in-from-right duration-500 text-center">
              <h2 className="text-4xl font-outfit font-bold text-gray-900 mb-4 leading-tight">{t.levelTitle}</h2>
              <p className="text-gray-500 mb-8 text-left">{t.levelDesc}</p>
              <div className="space-y-4 text-left">
                {Object.values(SpanishLevel).map((level) => (
                  <button key={level} onClick={() => setFormData({ ...formData, level })} className={`w-full p-6 rounded-3xl border-2 transition-all ${formData.level === level ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
                    <span className="font-black block text-2xl mb-1">{level}</span>
                    <span className="text-sm text-gray-500">{level === SpanishLevel.BASIC ? t.levelBasic : level === SpanishLevel.INTERMEDIATE ? t.levelInt : t.levelAdv}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleSubmit} className="mt-12 w-full bg-red-500 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95">{t.start}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
