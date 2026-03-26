
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import LiveConversation from './components/LiveConversation';
import Onboarding from './components/Onboarding';
import LessonInterface from './components/LessonInterface';
import PodcastInterface from './components/PodcastInterface';
import ImageAnalyzer from './components/ImageAnalyzer';
import ProfileSettings from './components/ProfileSettings';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './services/supabase';
import { User, SpanishLevel, Lesson } from './types';

const LESSONS: Lesson[] = [
  // ══════════════════════════════════════════════
  // FASE 1: ESPAÑOL GENERAL - Vida Cotidiana
  // ══════════════════════════════════════════════

  // ── 1. Alquiler de Casa/Apartamento ──
  {
    id: 'alq-b1', title: '🏠 Buscando Piso: Primer Contacto',
    level: SpanishLevel.BASIC, category: 'Alquiler',
    description: 'Aprende a buscar un piso, leer anuncios y contactar al propietario. 🔑',
    systemPrompt: 'Eres la Profe Jemi. Lección: Alquiler básico. 1. Vocabulario de vivienda (piso, habitación, baño, cocina, salón). 2. Leer anuncios de alquiler (amueblado, gastos incluidos, fianza). 3. Simula una llamada al propietario para preguntar por el piso. Practica con diálogos.',
    isCompleted: false
  },
  {
    id: 'alq-i1', title: '🏠 Negociando el Contrato',
    level: SpanishLevel.INTERMEDIATE, category: 'Alquiler',
    description: 'Entiende contratos de alquiler, negocia condiciones y resuelve problemas con el casero. 📝',
    systemPrompt: 'Eres la Profe Jemi. Lección: Contrato de alquiler. 1. Vocabulario legal básico (cláusula, fianza, preaviso, rescisión). 2. Cómo negociar condiciones (precio, duración, mascotas). 3. Reportar problemas (goteras, calefacción rota). Simula una negociación con el propietario.',
    isCompleted: false
  },

  // ── 2. Compras en el Supermercado ──
  {
    id: 'sup-b1', title: '🛒 Primeras Compras',
    level: SpanishLevel.BASIC, category: 'Supermercado',
    description: 'Vocabulario esencial para hacer tus compras diarias sin estrés. 🍎',
    systemPrompt: 'Eres la Profe Jemi. Lección: Supermercado básico. 1. Secciones del supermercado (frutería, carnicería, panadería, lácteos, limpieza). 2. Preguntar precios y ofertas. 3. En la caja: "¿Quiere bolsa?", "¿Paga con tarjeta?". 4. Práctica: haz la lista de la compra con el alumno.',
    isCompleted: false
  },
  {
    id: 'sup-i1', title: '🛒 Mercados Locales y Regateo',
    level: SpanishLevel.INTERMEDIATE, category: 'Supermercado',
    description: 'Domina los mercados locales, ferias y cómo pedir productos frescos. 🥩',
    systemPrompt: 'Eres la Profe Jemi. Lección: Mercados y compras avanzadas. 1. Vocabulario de mercado local (puesto, kilo, docena, atado, manojo). 2. Pedir cortes de carne, pescado fresco, frutas de temporada. 3. Comparar precios, pedir descuento. 4. Simula un diálogo en un mercado callejero.',
    isCompleted: false
  },

  // ── 3. Comunicación Oficial ──
  {
    id: 'ofi-b1', title: '📋 En la Oficina Pública',
    level: SpanishLevel.BASIC, category: 'Comunicación Oficial',
    description: 'Aprende a hablar en oficinas públicas, bancos y organismos. 🏛️',
    systemPrompt: 'Eres la Profe Jemi. Lección: Comunicación oficial básica. 1. Frases formales (Buenos días, quisiera información sobre...). 2. Vocabulario de trámites (formulario, fotocopia, turno, ventanilla). 3. Dar datos personales de forma clara. 4. Simula una visita a una oficina pública.',
    isCompleted: false
  },
  {
    id: 'ofi-i1', title: '📋 Cartas, Emails y Reclamos Formales',
    level: SpanishLevel.INTERMEDIATE, category: 'Comunicación Oficial',
    description: 'Redacta emails formales, cartas de reclamo y solicitudes oficiales. ✉️',
    systemPrompt: 'Eres la Profe Jemi. Lección: Comunicación escrita formal. 1. Estructura de un email formal (Estimado/a, Le saluda atentamente). 2. Vocabulario de reclamos (queja, incidencia, resolución). 3. Escribir una carta de solicitud. 4. Practica redactando un email de reclamo.',
    isCompleted: false
  },

  // ── 4. Cuestiones Financieras ──
  {
    id: 'fin-b1', title: '💰 El Banco y tu Dinero',
    level: SpanishLevel.BASIC, category: 'Finanzas',
    description: 'Abre una cuenta bancaria, maneja cajeros y entiende comisiones. 🏦',
    systemPrompt: 'Eres la Profe Jemi. Lección: Finanzas básicas. 1. Vocabulario bancario (cuenta corriente, ahorro, transferencia, cajero automático). 2. Abrir una cuenta: documentos necesarios. 3. En el cajero: sacar dinero, consultar saldo. 4. Simula un diálogo en el banco.',
    isCompleted: false
  },
  {
    id: 'fin-i1', title: '💰 Impuestos, Facturas y Presupuestos',
    level: SpanishLevel.INTERMEDIATE, category: 'Finanzas',
    description: 'Entiende facturas, habla de impuestos y maneja tu presupuesto en español. 📊',
    systemPrompt: 'Eres la Profe Jemi. Lección: Finanzas intermedias. 1. Leer una factura (IVA, subtotal, vencimiento). 2. Vocabulario de impuestos (declaración, deducciones, retención). 3. Hablar de presupuestos personales. 4. Practica pidiendo una explicación de una factura.',
    isCompleted: false
  },

  // ── 5. Cuestiones Domésticas ──
  {
    id: 'dom-b1', title: '🧹 La Casa y las Tareas',
    level: SpanishLevel.BASIC, category: 'Hogar',
    description: 'Vocabulario del hogar, electrodomésticos y tareas domésticas. 🏡',
    systemPrompt: 'Eres la Profe Jemi. Lección: Hogar básico. 1. Partes de la casa (cocina, baño, dormitorio, terraza, garaje). 2. Electrodomésticos (lavadora, lavavajillas, horno, aspiradora). 3. Tareas domésticas (barrer, fregar, planchar, tender la ropa). 4. Practica describiendo tu casa.',
    isCompleted: false
  },
  {
    id: 'dom-i1', title: '🔧 Reparaciones y Servicios del Hogar',
    level: SpanishLevel.INTERMEDIATE, category: 'Hogar',
    description: 'Llama al plomero, electricista o técnico sin problemas. 🔨',
    systemPrompt: 'Eres la Profe Jemi. Lección: Reparaciones del hogar. 1. Profesionales (fontanero/plomero, electricista, cerrajero, pintor). 2. Describir problemas (se rompió, no funciona, gotea, hace ruido). 3. Pedir presupuesto. 4. Simula una llamada al técnico para reportar un problema.',
    isCompleted: false
  },

  // ── 6. Salud ──
  {
    id: 'sal-b1', title: '🏥 En el Médico',
    level: SpanishLevel.BASIC, category: 'Salud',
    description: 'Describe síntomas, entiende al doctor y pide cita médica. 💊',
    systemPrompt: 'Eres la Profe Jemi. Lección: Salud básica. 1. Partes del cuerpo. 2. Síntomas comunes (me duele, tengo fiebre, estoy mareado). 3. Pedir cita médica por teléfono. 4. En la consulta: describir qué te pasa. 5. Simula una visita al médico.',
    isCompleted: false
  },
  {
    id: 'sal-i1', title: '🏥 Farmacia, Urgencias y Seguros',
    level: SpanishLevel.INTERMEDIATE, category: 'Salud',
    description: 'Compra medicamentos, explica alergias y entiende tu seguro médico. 🩺',
    systemPrompt: 'Eres la Profe Jemi. Lección: Salud intermedia. 1. En la farmacia (receta, sin receta, genérico, posología). 2. Alergias e intolerancias. 3. Vocabulario de urgencias. 4. Entender una póliza de seguro médico. 5. Practica una situación en la farmacia.',
    isCompleted: false
  },

  // ── 7. Tiempo Libre ──
  {
    id: 'ocio-b1', title: '🎉 ¿Qué Hacemos Hoy?',
    level: SpanishLevel.BASIC, category: 'Tiempo Libre',
    description: 'Habla de tus hobbies, haz planes y acepta o rechaza invitaciones. 🎬',
    systemPrompt: 'Eres la Profe Jemi. Lección: Tiempo libre básico. 1. Hobbies y actividades (leer, correr, cocinar, ver series). 2. Hacer planes ("¿Quieres ir al cine?", "¿Quedamos el sábado?"). 3. Aceptar/rechazar invitaciones. 4. Practica haciendo un plan para el fin de semana.',
    isCompleted: false
  },
  {
    id: 'ocio-i1', title: '🎉 Eventos, Fiestas y Cultura Local',
    level: SpanishLevel.INTERMEDIATE, category: 'Tiempo Libre',
    description: 'Participa en eventos culturales, fiestas populares y vida social. 🥳',
    systemPrompt: 'Eres la Profe Jemi. Lección: Cultura y eventos. 1. Tipos de eventos (fiesta, concierto, exposición, festival). 2. Comprar entradas, reservar. 3. Vocabulario de fiestas populares. 4. Contar experiencias en pasado. 5. Practica invitando a alguien a un evento.',
    isCompleted: false
  },

  // ── 8. Servicios Públicos ──
  {
    id: 'serv-b1', title: '📞 Contratar Servicios Básicos',
    level: SpanishLevel.BASIC, category: 'Servicios',
    description: 'Aprende a contratar luz, agua, gas e internet en tu nuevo hogar. ⚡',
    systemPrompt: 'Eres la Profe Jemi. Lección: Servicios públicos básicos. 1. Tipos de servicios (electricidad, agua, gas, internet, telefonía). 2. Cómo dar de alta un servicio. 3. Vocabulario (contrato, contador/medidor, consumo, factura). 4. Simula una llamada para contratar internet.',
    isCompleted: false
  },
  {
    id: 'serv-i1', title: '📞 Reclamos y Cambio de Proveedor',
    level: SpanishLevel.INTERMEDIATE, category: 'Servicios',
    description: 'Reclama facturas incorrectas y cambia de compañía sin complicaciones. 📱',
    systemPrompt: 'Eres la Profe Jemi. Lección: Servicios avanzados. 1. Reclamar una factura incorrecta. 2. Vocabulario de atención al cliente (número de referencia, incidencia, portabilidad). 3. Comparar planes y ofertas. 4. Simula un reclamo telefónico.',
    isCompleted: false
  },

  // ── 9. Transporte y Movilidad ──
  {
    id: 'trans-b1', title: '🚗 Moverse por la Ciudad',
    level: SpanishLevel.BASIC, category: 'Transporte',
    description: 'Toma taxi, metro o autobús y da direcciones sin perderte. 🗺️',
    systemPrompt: 'Eres la Profe Jemi. Lección: Transporte básico. 1. Medios de transporte (taxi, autobús, metro, tren, bicicleta). 2. Comprar boletos/billetes. 3. Pedir indicaciones ("¿Cómo llego a...?", "Gire a la derecha"). 4. Simula un viaje en taxi: da tu dirección al conductor.',
    isCompleted: false
  },
  {
    id: 'trans-i1', title: '🚗 Alquilar Auto y Vocabulario Vial',
    level: SpanishLevel.INTERMEDIATE, category: 'Transporte',
    description: 'Alquila un auto, entiende señales de tránsito y maneja situaciones viales. 🚦',
    systemPrompt: 'Eres la Profe Jemi. Lección: Transporte intermedio. 1. Alquilar un auto (seguro, gasolina, km incluidos). 2. Señales de tránsito (pare, ceda el paso, velocidad máxima). 3. Problemas en la carretera (pinchazo, grúa, multa). 4. Simula un diálogo en la agencia de alquiler.',
    isCompleted: false
  },

  // ── 10. Restaurantes y Gastronomía ──
  {
    id: 'rest-b1', title: '🍽️ Pidiendo en el Restaurante',
    level: SpanishLevel.BASIC, category: 'Restaurantes',
    description: 'Vocabulario esencial para pedir comida y bebida como un local. 🥘',
    systemPrompt: 'Eres la Profe Jemi. Lección: Restaurante básico. 1. Leer el menú (entrantes, plato principal, postre, bebidas). 2. Pedir comida ("Querría...", "Para mí..."). 3. Alergias e intolerancias. 4. Pedir la cuenta. 5. Simula una cena: actúa como camarera.',
    isCompleted: false
  },
  {
    id: 'rest-i1', title: '🍽️ Cultura Gastronómica y Opiniones',
    level: SpanishLevel.INTERMEDIATE, category: 'Restaurantes',
    description: 'Habla de platos típicos, da opiniones y haz recomendaciones culinarias. 🧑‍🍳',
    systemPrompt: 'Eres la Profe Jemi. Lección: Gastronomía intermedia. 1. Platos típicos de diferentes países hispanohablantes. 2. Dar opiniones ("Está riquísimo", "Le falta sal"). 3. Recomendar restaurantes. 4. Escribir una reseña. 5. Practica describiendo tu plato favorito.',
    isCompleted: false
  },

  // ── 11. Emergencias y Seguridad ──
  {
    id: 'emer-b1', title: '🚨 ¡Emergencia! Frases Clave',
    level: SpanishLevel.BASIC, category: 'Emergencias',
    description: 'Frases vitales para emergencias: policía, bomberos, ambulancia. 🆘',
    systemPrompt: 'Eres la Profe Jemi. Lección: Emergencias básicas. 1. Números de emergencia. 2. Frases clave ("¡Ayuda!", "Necesito una ambulancia", "Ha habido un accidente"). 3. Describir una emergencia por teléfono. 4. Vocabulario de seguridad. 5. Simula una llamada al 911/112.',
    isCompleted: false
  },
  {
    id: 'emer-i1', title: '🚨 Denuncias y Situaciones Complejas',
    level: SpanishLevel.INTERMEDIATE, category: 'Emergencias',
    description: 'Denuncia un robo, reporta un accidente o habla con la policía. 🚔',
    systemPrompt: 'Eres la Profe Jemi. Lección: Emergencias intermedias. 1. Denunciar un robo (me robaron, me asaltaron). 2. Describir personas y objetos perdidos. 3. En la comisaría: dar declaración. 4. Vocabulario legal básico. 5. Simula la denuncia de un robo.',
    isCompleted: false
  },

  // ══════════════════════════════════════════════
  // GRAMÁTICA ESENCIAL (Transversal)
  // ══════════════════════════════════════════════
  {
    id: 'gram-b1', title: '👋 ¡Hola! Presentaciones y Saludos',
    level: SpanishLevel.BASIC, category: 'Gramática',
    description: 'Lo primero: saludar, presentarte y hacer preguntas básicas. ✨',
    systemPrompt: 'Eres la Profe Jemi. Lección 1: Presentaciones. Enseña saludos (Hola, buenos días, buenas tardes), presentaciones (Me llamo..., Soy de...) y preguntas básicas (¿Cómo estás?, ¿De dónde eres?). Haz que el alumno practique estas frases en un diálogo.',
    isCompleted: false
  },
  {
    id: 'gram-i1', title: '⏳ Pasados: Indefinido vs Imperfecto',
    level: SpanishLevel.INTERMEDIATE, category: 'Gramática',
    description: 'Domina los tiempos del pasado con ejemplos prácticos y anécdotas. 📖',
    systemPrompt: 'Eres la Profe Jemi. Lección de gramática: Pasados. Ayuda al estudiante a diferenciar entre pretérito indefinido e imperfecto. Pídele que cuente una historia corta del pasado y corrígelo.',
    isCompleted: false
  },
  {
    id: 'gram-i2', title: '🔗 Pronombres Relativos',
    level: SpanishLevel.INTERMEDIATE, category: 'Gramática',
    description: 'Domina "que", "quien", "cual" y "cuyo" para conectar ideas con fluidez. 🗣️',
    systemPrompt: 'Eres la Profe Jemi. Lección de gramática: pronombres relativos. 1. Cuando usar "que", "quien", "cual" y "cuyo". 2. Ejercicios de unir frases. 3. Corrige errores con explicaciones claras.',
    isCompleted: false
  },
  {
    id: 'gram-a1', title: '🎭 Subjuntivo: Expresar Deseos y Dudas',
    level: SpanishLevel.ADVANCED, category: 'Gramática',
    description: 'El gran reto del español: domina el subjuntivo en todos sus contextos. 🧩',
    systemPrompt: 'Eres la Profe Jemi. Lección avanzada: Subjuntivo. 1. Usos del subjuntivo (deseos, dudas, emociones, hipótesis). 2. Indicativo vs Subjuntivo. 3. Estructuras complejas ("Ojalá que...", "Es posible que...", "Aunque + subjuntivo"). 4. Practica con situaciones reales.',
    isCompleted: false
  },

  // ══════════════════════════════════════════════
  // NIVEL AVANZADO - Debates y Fluidez
  // ══════════════════════════════════════════════
  {
    id: 'avz-a1', title: '💻 Debate: Impacto de la Tecnología',
    level: SpanishLevel.ADVANCED, category: 'Debates',
    description: 'Mejora tu fluidez debatiendo temas de actualidad y dilemas éticos. 🤖',
    systemPrompt: 'Eres la Profe Jemi. Sesión de debate avanzado sobre tecnología. Plantea dilemas éticos (IA, privacidad, redes sociales) y usa vocabulario complejo. Corrige errores sutiles de gramática y registro.',
    isCompleted: false
  },
  {
    id: 'avz-a2', title: '🌍 Debate: Cultura e Identidad',
    level: SpanishLevel.ADVANCED, category: 'Debates',
    description: 'Discute temas de identidad cultural, migración y diversidad en español. 🤝',
    systemPrompt: 'Eres la Profe Jemi. Sesión de debate avanzado sobre cultura e identidad. Temas: integración cultural, choque cultural, identidad bilingüe, diversidad. Fomenta el uso de conectores discursivos avanzados y expresiones idiomáticas.',
    isCompleted: false
  },

  // ══════════════════════════════════════════════
  // EFE PREMIUM - Español para Fines Específicos
  // ══════════════════════════════════════════════
  {
    id: 'efe-med-b1', title: '🩺 Medicina: Vocabulario Básico',
    level: SpanishLevel.BASIC, category: 'EFE: Medicina',
    description: 'Terminología médica esencial para profesionales de la salud. 💉',
    systemPrompt: 'Eres la Profe Jemi. Lección EFE Medicina - Nivel Básico. 1. Vocabulario anatómico esencial. 2. Síntomas y diagnósticos comunes. 3. Comunicación médico-paciente básica. 4. Practica tomando una historia clínica simple.',
    isCompleted: false
  },
  {
    id: 'efe-med-i1', title: '🩺 Medicina: Consulta y Diagnóstico',
    level: SpanishLevel.INTERMEDIATE, category: 'EFE: Medicina',
    description: 'Realiza consultas médicas completas, explica diagnósticos y tratamientos. 🏥',
    systemPrompt: 'Eres la Profe Jemi. Lección EFE Medicina - Intermedio. 1. Historia clínica completa. 2. Explicar diagnósticos al paciente. 3. Prescribir tratamientos. 4. Vocabulario de especialidades. 5. Simula una consulta médica completa.',
    isCompleted: false
  },
  {
    id: 'efe-neg-b1', title: '💼 Negocios: Reuniones y Presentaciones',
    level: SpanishLevel.BASIC, category: 'EFE: Negocios',
    description: 'Vocabulario empresarial para reuniones, emails y presentaciones. 📈',
    systemPrompt: 'Eres la Profe Jemi. Lección EFE Negocios - Básico. 1. Vocabulario de oficina y empresa. 2. Presentarse en contexto profesional. 3. Estructura de una reunión. 4. Redactar un email profesional. 5. Simula una presentación breve.',
    isCompleted: false
  },
  {
    id: 'efe-neg-i1', title: '💼 Negocios: Negociación y Contratos',
    level: SpanishLevel.INTERMEDIATE, category: 'EFE: Negocios',
    description: 'Negocia acuerdos, presenta propuestas y entiende contratos comerciales. 🤝',
    systemPrompt: 'Eres la Profe Jemi. Lección EFE Negocios - Intermedio. 1. Vocabulario de negociación (propuesta, condiciones, acuerdo). 2. Presentar una propuesta comercial. 3. Vocabulario de contratos. 4. Simula una negociación comercial.',
    isCompleted: false
  },
  {
    id: 'efe-tur-b1', title: '🧳 Turismo: Atención al Cliente',
    level: SpanishLevel.BASIC, category: 'EFE: Turismo',
    description: 'Vocabulario hotelero y de atención al turista hispanohablante. 🏨',
    systemPrompt: 'Eres la Profe Jemi. Lección EFE Turismo - Básico. 1. Check-in/check-out. 2. Describir habitaciones y servicios. 3. Resolver quejas de huéspedes. 4. Recomendar lugares turísticos. 5. Simula la recepción de un hotel.',
    isCompleted: false
  },
  {
    id: 'efe-der-b1', title: '⚖️ Derecho: Vocabulario Legal Básico',
    level: SpanishLevel.BASIC, category: 'EFE: Derecho',
    description: 'Terminología jurídica esencial para el ámbito legal hispanohablante. 📜',
    systemPrompt: 'Eres la Profe Jemi. Lección EFE Derecho - Básico. 1. Vocabulario legal fundamental (demanda, juicio, sentencia, abogado, juez). 2. Tipos de documentos legales. 3. Cómo describir una situación legal. 4. Practica con un caso simple.',
    isCompleted: false
  },
];

const MainApp: React.FC = () => {
  const { user: authUser, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  useEffect(() => {
    // Sync with local storage for existing session persistence logic
    const savedUser = localStorage.getItem('profe_jemi_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedCompleted = localStorage.getItem('profe_jemi_completed_lessons');
    if (savedCompleted) setCompletedLessonIds(JSON.parse(savedCompleted));
  }, []);

  // Effect to sync Auth User with App User state if needed
  useEffect(() => {
    if (authUser && !user) {
      // Intentar recuperar el perfil de user_metadata de Supabase Auth
      if (authUser.user_metadata?.hasCompletedOnboarding) {
        const recoveredUser: User = {
          name: authUser.user_metadata.name,
          level: authUser.user_metadata.level,
          gender: authUser.user_metadata.gender,
          accent: authUser.user_metadata.accent,
          avatar: authUser.user_metadata.avatar,
          nativeLanguage: authUser.user_metadata.nativeLanguage,
          learningGoal: authUser.user_metadata.learningGoal,
          progress: authUser.user_metadata.progress || 0,
          isSubscribed: false,
          hasCompletedOnboarding: true
        };
        setUser(recoveredUser);
        localStorage.setItem('profe_jemi_user', JSON.stringify(recoveredUser));
      }
    }
  }, [authUser, user]);


  const handleLevelChange = async (level: SpanishLevel) => {
    if (!user) return;
    const updatedUser = { ...user, level };
    setUser(updatedUser);
    localStorage.setItem('profe_jemi_user', JSON.stringify(updatedUser));
    if (authUser) {
      await supabase.auth.updateUser({ data: { level } });
    }
  };

  const handleOnboardingComplete = async (userData: Partial<User>) => {
    const newUser = userData as User;
    setUser(newUser);
    localStorage.setItem('profe_jemi_user', JSON.stringify(newUser));

    // Guardar los datos en Supabase para que no se pierdan al cerrar sesión
    if (authUser) {
      await supabase.auth.updateUser({
        data: {
          name: newUser.name,
          level: newUser.level,
          gender: newUser.gender,
          accent: newUser.accent,
          avatar: newUser.avatar || '😎',
          nativeLanguage: newUser.nativeLanguage,
          learningGoal: newUser.learningGoal,
          progress: newUser.progress || 0,
          hasCompletedOnboarding: true
        }
      });
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    const newCompleted = [...new Set([...completedLessonIds, lessonId])];
    setCompletedLessonIds(newCompleted);
    localStorage.setItem('profe_jemi_completed_lessons', JSON.stringify(newCompleted));
    if (user) {
      const progress = Math.min(100, Math.floor((newCompleted.length / LESSONS.length) * 100));
      const updatedUser = { ...user, progress };
      setUser(updatedUser);
      localStorage.setItem('profe_jemi_user', JSON.stringify(updatedUser));
      if (authUser) {
        await supabase.auth.updateUser({ data: { progress } });
      }
    }
  };

  if (!user || !user.hasCompletedOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;

  if (activeLesson) {
    const currentIndex = LESSONS.findIndex(l => l.id === activeLesson.id);
    const hasNextLesson = currentIndex !== -1 && currentIndex < LESSONS.length - 1;
    const handleNavFromLesson = (view: string) => { setActiveLesson(null); setCurrentView(view); };
    return (
      <Layout user={user} currentView="courses" onNavigate={handleNavFromLesson} isAdmin={isAdmin}>
        <LessonInterface lesson={activeLesson} user={user} onExit={() => setActiveLesson(null)} onComplete={() => markLessonComplete(activeLesson.id)} onNextLesson={hasNextLesson ? () => setActiveLesson(LESSONS[currentIndex + 1]) : undefined} />
      </Layout>
    );
  }

  return (
    <Layout user={user} currentView={currentView} onNavigate={setCurrentView} isAdmin={isAdmin}>
      {currentView === 'home' && <Dashboard user={user} onLevelChange={handleLevelChange} onNavigate={setCurrentView} />}
      {currentView === 'profile' && (
        <ProfileSettings user={user} onUpdateUser={(updated) => {
          const newUser = { ...user, ...updated };
          setUser(newUser);
          localStorage.setItem('profe_jemi_user', JSON.stringify(newUser));
        }} />
      )}
      {currentView === 'chat' && <ChatInterface user={user} />}
      {currentView === 'vision' && <ImageAnalyzer user={user} onNavigate={setCurrentView} />}
      {currentView === 'voice' && <LiveConversation level={user.level} nativeLanguage={user.nativeLanguage || 'Inglés'} accent={user.accent || 'Español de España'} />}
      {currentView === 'podcasts' && <PodcastInterface />}
      {currentView === 'courses' && (() => {
        const userLessons = LESSONS.filter(l => l.level === user.level);
        const categories = [...new Set(userLessons.map(l => l.category || 'General'))];
        const isEFE = (cat: string) => cat.startsWith('EFE:');

        return (
          <div className="max-w-7xl mx-auto px-4 py-12 w-full">
            <h2 className="text-3xl font-outfit font-bold mb-2">Mis Cursos Personalizados 📚</h2>
            <p className="text-gray-500 mb-8">Nivel: <span className="font-bold text-red-600">{user.level}</span> • {userLessons.length} lecciones disponibles</p>

            {categories.filter(c => !isEFE(c)).length > 0 && (
              <>
                <h3 className="text-xl font-outfit font-bold mb-4 text-gray-800">🌍 Español General</h3>
                {categories.filter(c => !isEFE(c)).map(cat => (
                  <div key={cat} className="mb-8">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-2">{cat}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userLessons.filter(l => (l.category || 'General') === cat).map(lesson => (
                        <LessonCard key={lesson.id} lesson={lesson} isCompleted={completedLessonIds.includes(lesson.id)} onStart={() => setActiveLesson(lesson)} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {categories.filter(c => isEFE(c)).length > 0 && (
              <>
                <div className="flex items-center gap-3 mt-10 mb-4">
                  <h3 className="text-xl font-outfit font-bold text-gray-800">💎 Español para Fines Específicos (EFE)</h3>
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">PREMIUM</span>
                </div>
                {categories.filter(c => isEFE(c)).map(cat => (
                  <div key={cat} className="mb-8">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-2">{cat}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userLessons.filter(l => l.category === cat).map(lesson => (
                        <LessonCard key={lesson.id} lesson={lesson} isCompleted={completedLessonIds.includes(lesson.id)} onStart={() => setActiveLesson(lesson)} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })()}
      {currentView === 'admin' && isAdmin && <AdminDashboard />}
    </Layout>
  );
};

const LessonCard: React.FC<{ lesson: Lesson, isCompleted: boolean, onStart: () => void }> = ({ lesson, isCompleted, onStart }) => {
  // Normalizar el nombre de la categoría (ej: "Comunicación Oficial" -> "comunicacion_oficial")
  const normalizedCategory = (lesson.category || 'general')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-z0-9]/g, '_') // Cambiar espacios/signos por guiones bajos
    .replace(/_+/g, '_'); // Eliminar guiones bajos múltiples
  
  const imageUrl = `/images/cursos/${normalizedCategory}.jpg`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all hover:-translate-y-1">
      <div className="h-32 relative flex items-center justify-center overflow-hidden bg-gray-100">
        <img 
            src={imageUrl} 
            alt={lesson.title} 
            className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
                // Ocultar la imagen si no existe (404) y mostrar el fondo de color
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add(lesson.category?.startsWith('EFE') ? 'bg-amber-500' : 'bg-orange-500');
            }}
        />
        {/* Fallback de texto si la imagen no carga */}
        <span className="text-white text-5xl opacity-20 font-bold z-0 mix-blend-overlay">{lesson.title.split(' ')[1]?.[0] || lesson.title[0]}</span>
        
        {/* Overlay degradado para que el texto debajo siempre se lea bien */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0"></div>

        {isCompleted && <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg border-2 border-white z-10">✅</div>}
      </div>
      <div className="p-6 flex-grow relative z-10">
        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">{lesson.level}</span>
        <h3 className="text-xl font-outfit font-bold mb-2">{lesson.title}</h3>
        <p className="text-gray-500 text-sm">{lesson.description}</p>
      </div>
      <div className="p-6 mt-auto relative z-10"><button onClick={onStart} className="w-full font-bold py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all">{isCompleted ? 'Repetir' : 'Empezar'}</button></div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
