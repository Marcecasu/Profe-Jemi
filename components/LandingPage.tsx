import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Lang = 'pt' | 'es' | 'en';

const TRANSLATIONS = {
  pt: {
    nav: {
      benefits: 'Por que a Profe Jemi?',
      howItWorks: 'Como Funciona',
      features: 'Recursos IA',
      testimonials: 'Depoimentos',
      pricing: 'Planos',
      login: 'Entrar',
      cta: 'Começar Grátis ➔',
      app: 'Ir para o App 🚀'
    },
    hero: {
      badge: '✨ Método Oficial Hablemos en Español • +15 Anos de Sucesso',
      titleHighlight: 'Fale Espanhol Real com IA',
      titleRest: 'Sem Medo de Passar Vergonha',
      subtitle: 'Pratique conversação por voz 24/7 com a Profe Jemi, elimine o portunhol de vez e viaje ou trabalhe com total confiança em mais de 20 países.',
      ctaPrimary: 'Começar Agora Grátis ➔',
      ctaSecondary: 'Conheça a Profe Jemima ↓',
      riskFree: '100% Grátis para começar • Sem cartão de crédito • 15 min de voz + Intérprete inclusos todo mês',
      ratingText: 'Nota 4.9/5 por mais de 1.500 alunos particulares e online',
      jemiTitle: 'Professora Jemima Leguizamón',
      jemiBadge: 'Nativa Uruguaia • Vivendo no Brasil desde 2001',
      jemiCert: 'Certificada ELE & EFE (Instituto Cervantes / Tía Tula)',
      quote: '"Diga adeus ao portunhol. Aqui você fala espanhol de verdade desde o primeiro minuto."'
    },
    stats: [
      { number: '17+', label: 'Anos de experiência no ensino de espanhol' },
      { number: '1.500+', label: 'Alunos que destravaram a fluência' },
      { number: '20+', label: 'Países e sotaques hispanos cobertos' },
      { number: '24/7', label: 'Disponibilidade para praticar no seu ritmo' }
    ],
    problem: {
      badge: 'O Choque do Portunhol 🛑',
      title: 'Por Que Decorar Regrinhas em Aplicativos Tradicionais Não Te Faz Falar?',
      subtitle: 'Você já tentou outros apps e cursos, mas na hora H a voz simplesmente não sai. Veja se você se identifica com uma destas 3 situações:',
      cards: [
        {
          icon: '🧳',
          title: 'O Turista Travado',
          desc: 'Você chega em Buenos Aires, Santiago ou Madri e na hora de pedir um café ou pegar um táxi gela na barriga. Fica gesticulando ou apelando para o inglês por vergonha do portunhol.'
        },
        {
          icon: '🏠',
          title: 'O Perrengue de Quem se Mudou',
          desc: 'Mudou-se para um país hispânico ou faz intercâmbio, mas tem vergonha de ir à padaria, à farmácia ou abrir conta no banco. Entende o que dizem, mas na hora de responder dá um nó.'
        },
        {
          icon: '💼',
          title: 'O Profissional que Só Acena',
          desc: 'Precisa participar de reuniões de trabalho em espanhol, mas passa a chamada inteira mudo, sorrindo e concordando com a cabeça com medo de cometer erros na frente da equipe.'
        }
      ],
      vsTitle: 'A Diferença Entre Outros Apps e a Profe Jemi AI',
      traditional: 'Apps Tradicionais (Tipo Duolingo)',
      traditionalPoints: [
        'Exercícios repetitivos de ligar palavras na tela',
        'Frases absurdas que ninguém fala na vida real ("O urso bebe leite")',
        'Zero prática de conversação falada sob pressão',
        'Não ensinam as gírias nem os sotaques locais (Argentina, México, Espanha)',
        'Você continua com medo de abrir a boca'
      ],
      jemiSolution: 'Com a Profe Jemi AI ✨',
      jemiPoints: [
        'Conversação real por voz como se fosse uma chamada telefônica',
        'Correção de pronúncia acolhedora e imediata em tempo real',
        'Intérprete simultâneo no bolso para quando você viaja',
        'Aprenda gírias autênticas do país de destino (che, vale, parce, po)',
        'Fluência prática e natural sem julgamentos'
      ]
    },
    features: {
      badge: 'Tecnologia com Alma de Professora Nativa 🧠',
      title: 'Tudo O Que Você Precisa Para Falar Espanhol Com Confiança',
      subtitle: 'Profe Jemi AI combina a experiência pedagógica de 17 anos da professora Jemima com inteligência artificial de voz ultrarrealista.',
      items: [
        {
          icon: '🎙️',
          badge: 'Destaque Principal',
          title: 'Live Conversation 24/7',
          desc: 'Converse por voz com a Profe Jemi a qualquer hora. Ela responde com áudio nativo natural, puxa assunto sobre temas do seu interesse e ajusta a dificuldade ao seu nível.'
        },
        {
          icon: '🗣️',
          badge: 'Exclusivo',
          title: 'Intérprete em Tempo Real',
          desc: 'Seu botão de emergência em viagens. Fale em português e a IA traduz imediatamente em espanhol com a pronúncia e os modismos do país que você escolher (e vice-versa!).'
        },
        {
          icon: '📸',
          badge: 'Inteligência Visual',
          title: 'Vision IA: Aprenda Com o Que Vê',
          desc: 'Aponte a câmera para cardápios, placas, rótulos de mercado ou documentos. A Profe Jemi lê, traduz e te ensina o vocabulário prático na hora.'
        },
        {
          icon: '🌎',
          badge: '6 Países',
          title: 'Sotaques Regionais Verdadeiros',
          desc: 'Escolha se quer aprender o espanhol da Espanha, Rioplatense (Argentina/Uruguai), México, Colômbia, Chile ou Paraguai. Sem sotaque robótico genérico.'
        },
        {
          icon: '📚',
          badge: 'Carreira & Negócios',
          title: 'Espanhol para Fins Específicos (EFE)',
          desc: 'Módulos profissionais desenhados para Medicina, Negócios, Turismo e Direito. Vocabulário técnico exato para sua carreira decolar.'
        },
        {
          icon: '🎧',
          badge: 'Imersão Auditiva',
          title: 'Podcasts Nativos & Tutor IA',
          desc: 'Treine o ouvido com episódios culturais narrados por nativos e tire dúvidas gramaticais no chat inteligente 24 horas por dia.'
        }
      ]
    },
    howItWorks: {
      badge: 'Passo a Passo Simples 🎯',
      title: 'Como Começar a Falar Espanhol em 3 Minutos',
      subtitle: 'Sem instalações complexas. A Profe Jemi roda direto no seu navegador ou como aplicativo no seu celular.',
      steps: [
        {
          step: '01',
          title: 'Crie sua conta gratuita',
          desc: 'Leva 30 segundos. Não precisa de cartão de crédito. Você ganha na hora 15 minutos de voz Live + 7 usos do Intérprete.'
        },
        {
          step: '02',
          title: 'Escolha seu objetivo e sotaque',
          desc: 'Diga se vai viajar, se mudar ou trabalhar, e selecione o país de sua preferência (Argentina, Espanha, México, etc.).'
        },
        {
          step: '03',
          title: 'Converse 15 minutos por dia',
          desc: 'Fale por voz com a Profe Jemi como se estivesse batendo papo no WhatsApp. Ganhe confiança e elimine o portunhol.'
        }
      ]
    },
    about: {
      badge: 'Conheça Sua Mentora 👩‍🏫',
      title: 'Olá, sou a Professora Jemima Leguizamón',
      role: 'Criadora do Hablemos en Español & Mentora Pedagógica da Profe Jemi AI',
      bio1: 'Sou uruguaia nativa, mas vivo no Brasil desde 2001. Por ser completamente bilíngue em espanhol e português, conheço na pele exatamente onde os brasileiros tropeçam: os falsos amigos (falsos cognatos), a vergonha de falar e a armadilha do portunhol.',
      bio2: 'Ensino espanhol como língua estrangeira desde 2007, sou certificada pelo Instituto Tía Tula (Centro Acreditado Instituto Cervantes) em níveis A1 a C2 e EFE (Espanhol para Fins Específicos). Já ensinei centenas de alunos no Brasil, Colômbia, Estados Unidos e Europa.',
      bio3: 'Criei a Profe Jemi AI para que você não precise esperar a hora da aula particular para praticar: agora você tem uma professora nativa no bolso 24 horas por dia para destravar sua fala.',
      certBadge: 'Certificação Oficial Instituto Cervantes / Tía Tula'
    },
    testimonials: {
      badge: 'Resultados Reais ⭐',
      title: 'O Que Dizem os Nossos Alunos',
      subtitle: 'Veja como quem começou do zero ou travado no portunhol conquistou a liberdade de falar.',
      list: [
        {
          name: 'Stephane M.',
          role: 'Executiva de Expansão • São Paulo',
          text: 'Eu participava de reuniões com equipes da América Latina e ficava muda com medo de falar errado. A metodologia da Jemima e a prática diária de voz mudaram tudo: hoje conduzo apresentações inteiras em espanhol sem suar frio!'
        },
        {
          name: 'Patricia Bovo',
          role: 'Estudante de Medicina • Argentina',
          text: 'Mudei para Rosário sem falar quase nada. O Intérprete e as conversas em espanhol Rioplatense me salvaram na faculdade e no dia a dia. A Profe Jemi entende perfeitamente a mente do brasileiro.'
        },
        {
          name: 'Amanda Silveira',
          role: 'Viajante & Designer • Florianópolis',
          text: 'Fiz um mochilão de 40 dias pelo Chile e Peru. Pratiquei 15 minutos por dia antes de viajar e foi a melhor coisa que fiz. Cheguei lá me virando nos restaurantes, hotéis e passeios sem passar nenhum aperto!'
        },
        {
          name: 'Mônica Dantas',
          role: 'Professora de Língua Espanhola',
          text: 'Como colega de profissão, recomendo de olhos fechados o trabalho da Jemima. A combinação da didática humana dela com a inteligência artificial da Profe Jemi é uma revolução para quem quer aprender rápido.'
        }
      ]
    },
    pricing: {
      badge: 'Investimento Acessível 💎',
      title: 'Planos Transparentes Para Destravar Sua Fluência',
      subtitle: 'Comece 100% grátis e faça upgrade quando quiser acelerar ainda mais.',
      currencyNotice: 'Valores regionalizados para o Brasil em Reais (R$)',
      freeCard: {
        badge: '🆓 Comece Grátis',
        title: 'Plano Gratuito',
        price: 'R$ 0',
        period: '/ para sempre',
        desc: 'Ideal para experimentar o poder da Profe Jemi e dar seus primeiros passos.',
        cta: 'Criar Conta Gratuita',
        features: [
          '15 minutos de Conversação Live por voz todo mês',
          '7 traduções com o Intérprete Simultâneo todo mês',
          '5 análises visuais com Vision IA todo mês',
          'Acesso a todas as lições básicas A1',
          'Sem necessidade de cartão de crédito'
        ]
      },
      annualCard: {
        badge: '🔥 MELHOR VALOR • ECONOMIZE 35%',
        title: 'Plano Anual Premium',
        price: 'R$ 599,00',
        period: '/ ano',
        subprice: 'Equivale a apenas R$ 49,92/mês (em até 12x no cartão)',
        desc: 'Para quem quer dominar o espanhol de vez com imersão completa e sem limites.',
        cta: 'Garantir Acesso Anual com 35% OFF ➔',
        features: [
          '30 Horas/mês de Conversação Live por voz (prática diária)',
          '🗣️ Intérprete Simultâneo em Tempo Real ILIMITADO',
          '📸 Vision IA Ilimitado (leia cardápios e placas à vontade)',
          'Todos os 6 sotaques liberados (Argentina, Espanha, México, etc.)',
          'Todos os Cursos + EFE (Medicina, Negócios, Turismo, Direito)',
          'Tutor IA 24/7 & Podcasts com áudio nativo completo',
          'Suporte prioritário e novidades em primeira mão'
        ]
      },
      monthlyCard: {
        badge: 'MENSAL',
        title: 'Plano Mensal',
        price: 'R$ 75,90',
        period: '/ mês',
        desc: 'Flexibilidade total para treinar mês a mês sem fidelidade contratual.',
        cta: 'Assinar Plano Mensal',
        features: [
          '30 Horas/mês de Conversação Live por voz',
          '🗣️ Intérprete em Tempo Real Ilimitado',
          '📸 Vision IA Ilimitado',
          'Todos os sotaques e cursos liberados',
          'Cancele a qualquer momento com 1 clique'
        ]
      }
    },
    faq: {
      badge: 'Tire Suas Dúvidas ❓',
      title: 'Perguntas Frequentes',
      subtitle: 'Tudo o que você precisa saber antes de começar.',
      items: [
        {
          q: 'Preciso ter algum conhecimento de espanhol para começar?',
          a: 'Não! O app é perfeito tanto para quem está saindo do zero absoluto quanto para quem já estuda há anos mas continua travado na hora de falar. A Profe Jemi adapta a velocidade e o vocabulário ao seu nível.'
        },
        {
          q: 'Por que a Profe Jemi AI é melhor do que o Duolingo ou cursos normais?',
          a: 'Em outros apps você passa meses apenas clicando em palavras na tela sem nunca abrir a boca. Com a Profe Jemi, você realmente conversa em voz alta, como numa ligação com uma nativa, recebendo correção de pronúncia e dicas culturais em tempo real.'
        },
        {
          q: 'Como funciona o Intérprete em Tempo Real?',
          a: 'Funciona como um walkie-talkie inteligente: você aperta um botão, fala em português e a IA fala em espanhol autêntico para a outra pessoa ouvir. Quando a pessoa responde em espanhol, a IA traduz de volta para o seu português com explicação das gírias locais.'
        },
        {
          q: 'O Plano Gratuito tem pegadinha ou cobra depois?',
          a: 'Não há pegadinhas. Não pedimos cartão de crédito para cadastrar. Você ganha seus 15 minutos de voz, 7 traduções e 5 análises visuais todo mês de forma gratuita para sempre.'
        },
        {
          q: 'Como funciona o pagamento parcelado no Brasil?',
          a: 'O pagamento é processado com 100% de segurança pelo Stripe (a maior processadora de pagamentos do mundo). Na tela de checkout do Plano Anual, você pode selecionar o pagamento em até 12x no cartão de crédito brasileiro.'
        },
        {
          q: 'Posso cancelar a qualquer momento?',
          a: 'Sim, você tem controle total. Pode cancelar sua assinatura com apenas um clique a qualquer momento no seu painel, sem burocracia, multas ou perguntas.'
        }
      ]
    },
    finalCta: {
      badge: 'Sua Hora de Falar Espanhol é Agora 🚀',
      title: 'Pronto Para Falar Espanhol de Verdade Sem Travar?',
      subtitle: 'Junte-se a mais de 1.500 alunos que perderam a vergonha do portunhol e conquistaram a liberdade de se comunicar em qualquer lugar do mundo.',
      button: 'Começar Agora Gratuitamente ➔',
      guarantee: 'Acesso imediato • Sem cartão de crédito • Cancele quando quiser'
    },
    footer: {
      about: 'Hablemos en Español é a plataforma de ensino de espanhol criada pela Professora Jemima Leguizamón, combinando metodologia comprovada com Inteligência Artificial conversacional.',
      rights: 'Todos os direitos reservados.',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
      contact: 'Contato & Suporte'
    }
  },
  es: {
    nav: {
      benefits: '¿Por qué la Profe Jemi?',
      howItWorks: 'Cómo Funciona',
      features: 'Herramientas IA',
      testimonials: 'Testimonios',
      pricing: 'Planes',
      login: 'Iniciar Sesión',
      cta: 'Empezar Gratis ➔',
      app: 'Ir a mi App 🚀'
    },
    hero: {
      badge: '✨ Método Oficial Hablemos en Español • +15 Años de Éxito',
      titleHighlight: 'Habla Español Auténtico con IA',
      titleRest: 'Sin Miedo a Equivocarte',
      subtitle: 'Practica conversación por voz 24/7 con la Profe Jemi, supera las trabas y comunícate con total soltura en viajes o trabajo en más de 20 países.',
      ctaPrimary: 'Empieza a Hablar Gratis ➔',
      ctaSecondary: 'Conoce a la Profe Jemima ↓',
      riskFree: '100% Gratis para comenzar • Sin tarjeta de crédito • 15 min de voz + Intérprete incluidos cada mes',
      ratingText: 'Calificación 4.9/5 por más de 1.500 alumnos particulares y online',
      jemiTitle: 'Profesora Jemima Leguizamón',
      jemiBadge: 'Nativa Uruguaya • Bilingüe Español / Portugués',
      jemiCert: 'Certificada ELE & EFE (Instituto Cervantes / Tía Tula)',
      quote: '"Dile adiós al miedo de hablar. Aquí practicas español real desde el primer minuto."'
    },
    stats: [
      { number: '17+', label: 'Años enseñando español como lengua extranjera' },
      { number: '1.500+', label: 'Alumnos que han alcanzado la fluidez' },
      { number: '20+', label: 'Países y variantes dialectales cubiertas' },
      { number: '24/7', label: 'Disponibilidad para practicar a tu propio ritmo' }
    ],
    problem: {
      badge: 'El Muro de la Conversación 🛑',
      title: '¿Por Qué Memorizar Reglas en Apps Tradicionales No Te Hace Hablar?',
      subtitle: '¿Entiendes cuando te hablan pero te cuesta expresarte? Mira si te identificas con una de estas 3 situaciones:',
      cards: [
        {
          icon: '🧳',
          title: 'El Viajero Bloqueado',
          desc: 'Llegas a Buenos Aires, Santiago, Madrid o Cancún y a la hora de pedir comida o pedir indicaciones te invade la vergüenza y terminas recurriendo a gestos o inglés.'
        },
        {
          icon: '🏠',
          title: 'El Recién Mudado',
          desc: 'Te mudaste a un país hispanohablante y te da pavor ir a la panadería, resolver trámites o abrir cuenta bancaria. Tienes miedo de no entender los modismos cotidianos.'
        },
        {
          icon: '💼',
          title: 'El Profesional en Silencio',
          desc: 'Trabajas con equipos hispanohablantes pero pasas la reunión completa asintiendo y sonriendo sin atreverte a opinar por miedo a trabarte delante de tus colegas.'
        }
      ],
      vsTitle: 'Diferencia Entre Otras Apps y Profe Jemi AI',
      traditional: 'Apps Tradicionales de Gramática',
      traditionalPoints: [
        'Ejercicios aburridos de unir palabras en pantalla',
        'Frases absurdas fuera de contexto ("La manzana es roja")',
        'Cero práctica de conversación oral interactiva',
        'No contemplan variantes locales (Argentina, México, España)',
        'Sigues con pánico a la hora de hablar'
      ],
      jemiSolution: 'Con Profe Jemi AI ✨',
      jemiPoints: [
        'Conversación real por voz como una llamada telefónica',
        'Corrección amable y precisa de pronunciación en tiempo real',
        'Intérprete simultáneo en el bolsillo para resolver urgencias',
        'Aprende modismos auténticos según tu destino (che, vale, parce)',
        'Fluidez natural y divertida sin juicios'
      ]
    },
    features: {
      badge: 'Tecnología con Corazón Pedagógico 🧠',
      title: 'Todo Lo Que Necesitas Para Hablar Español con Soltura',
      subtitle: 'Profe Jemi AI une la pedagogía probada de 17 años de la profesora Jemima con inteligencia artificial de voz de última generación.',
      items: [
        {
          icon: '🎙️',
          badge: 'Principal',
          title: 'Conversación Live 24/7',
          desc: 'Habla por voz con la Profe Jemi en cualquier momento. Responde con voz humana cálida, propone temas de tu interés y adapta su vocabulario a tu nivel.'
        },
        {
          icon: '🗣️',
          badge: 'Exclusivo',
          title: 'Intérprete Simultáneo en Vivo',
          desc: 'Tu salvavidas cuando viajas. Habla en tu idioma y la IA traduce al instante al español con el acento y modismos del país seleccionado.'
        },
        {
          icon: '📸',
          badge: 'Visión IA',
          title: 'Vision IA: Aprende con tu Cámara',
          desc: 'Toma fotos a menús, letreros, contratos o productos en el supermercado. La Profe Jemi analiza la imagen y te enseña el vocabulario con audio.'
        },
        {
          icon: '🌎',
          badge: '6 Regiones',
          title: 'Acentos Auténticos',
          desc: 'Elige entre Español de España, Rioplatense (Argentina/Uruguay), México, Colombia, Chile o Paraguay. Vocabulario real de la calle.'
        },
        {
          icon: '📚',
          badge: 'EFE Profesional',
          title: 'Español para Fines Específicos',
          desc: 'Cursos especializados para Medicina, Negocios, Turismo y Derecho. Domina las conversaciones técnicas que exige tu profesión.'
        },
        {
          icon: '🎧',
          badge: 'Inmersión',
          title: 'Podcasts Nativos & Tutor 24/7',
          desc: 'Afina tu oído con audios culturales y consulta dudas gramaticales o de vocabulario a cualquier hora.'
        }
      ]
    },
    howItWorks: {
      badge: 'Fácil y Rápido 🎯',
      title: 'Cómo Empezar a Hablar en 3 Pasos',
      subtitle: 'Sin descargas complicadas. Funciona directamente en tu navegador o celular.',
      steps: [
        {
          step: '01',
          title: 'Crea tu cuenta gratis',
          desc: 'En 30 segundos y sin tarjeta de crédito. Recibe de inmediato tus 15 minutos de voz Live y 7 usos de Intérprete cada mes.'
        },
        {
          step: '02',
          title: 'Elige tu objetivo y país',
          desc: 'Indica si tu meta es viaje, trabajo o vida diaria, y selecciona el acento hispano que deseas practicar.'
        },
        {
          step: '03',
          title: 'Habla 15 minutos al día',
          desc: 'Conversa por voz con la Profe Jemi. Gana seguridad, corrige errores y siente la libertad de hablar fluidamente.'
        }
      ]
    },
    about: {
      badge: 'Tu Mentora 👩‍🏫',
      title: 'Hola, soy la Profesora Jemima Leguizamón',
      role: 'Creadora de Hablemos en Español y Mentora de Profe Jemi AI',
      bio1: 'Nacida en Uruguay y residiendo en Brasil desde 2001, soy bilingüe español/portugués. Conozco de primera mano el choque cultural y las dudas exactas que surgen al aprender el idioma español.',
      bio2: 'Profesora particular desde 2007 y certificada por el Instituto Tía Tula (Centro Acreditado Instituto Cervantes) en ELE (A1-C2) y EFE (Español para Fines Específicos). He guiado a cientos de estudiantes de todo el mundo hacia la fluidez.',
      bio3: 'Diseñé la Profe Jemi AI para que la práctica de conversación no dependa de un horario: ahora puedes entrenar tu pronunciación y vocabulario en cualquier momento y lugar.',
      certBadge: 'Acreditación Oficial Instituto Cervantes / Tía Tula'
    },
    testimonials: {
      badge: 'Historias Reales ⭐',
      title: 'Lo Que Dicen Nuestros Estudiantes',
      subtitle: 'Personas reales que superaron el miedo y transformaron su español.',
      list: [
        {
          name: 'Stephane M.',
          role: 'Ejecutiva Internacional • São Paulo',
          text: 'Participaba en reuniones con equipos de toda Latinoamérica y me quedaba en silencio por vergüenza. La metodología de Jemima y la práctica de voz me dieron la seguridad que necesitaba para liderar en español.'
        },
        {
          name: 'Patricia Bovo',
          role: 'Estudiante de Medicina • Argentina',
          text: 'Llegué a estudiar medicina en Rosario sin hablar casi nada. El intérprete y la práctica con el acento rioplatense me salvaron en el hospital y en el supermercado.'
        },
        {
          name: 'Amanda Silveira',
          role: 'Diseñadora & Viajera • Florianópolis',
          text: 'Entrené 15 minutos al día antes de hacer un viaje por Chile y Perú. Llegué allá comunicándome con soltura en hoteles, taxis y restaurantes sin ningún estrés.'
        },
        {
          name: 'Mônica Dantas',
          role: 'Profesora Colega de Español',
          text: 'Recomiendo totalmente el trabajo de Jemima. La combinación de su calidez pedagógica con la inteligencia artificial es la forma más rápida y amena de volverse fluido.'
        }
      ]
    },
    pricing: {
      badge: 'Precios Claros 💎',
      title: 'Planes Diseñados Para Tu Éxito',
      subtitle: 'Comienza 100% gratis y sube de plan cuando desees acelerar tu aprendizaje.',
      currencyNotice: 'Tarifas internacionales en Dólares Estadounidenses (USD)',
      freeCard: {
        badge: '🆓 Empieza Gratis',
        title: 'Plan Gratuito',
        price: '$0',
        period: '/ para siempre',
        desc: 'Ideal para experimentar la conversación con IA y comenzar sin riesgos.',
        cta: 'Crear Cuenta Gratis',
        features: [
          '15 minutos de Conversación Live por voz cada mes',
          '7 traducciones con el Intérprete en Vivo cada mes',
          '5 análisis visuales con Vision IA cada mes',
          'Acceso a lecciones de nivel básico A1',
          'Sin requerir tarjeta de crédito'
        ]
      },
      annualCard: {
        badge: '🔥 MEJOR VALOR • AHORRA 35%',
        title: 'Plan Anual Premium',
        price: '$149.00',
        period: '/ año',
        subprice: 'Equivale a solo $12.41/mes (Ahorras $78.88 al año)',
        desc: 'Para quienes desean dominar el español este año con práctica intensiva sin límites.',
        cta: 'Obtener Plan Anual con 35% OFF ➔',
        features: [
          '30 Horas/mes de Conversación Live por voz',
          '🗣️ Intérprete Simultáneo en Tiempo Real ILIMITADO',
          '📸 Vision IA Ilimitado (escanea menús y documentos sin límite)',
          'Los 6 acentos y dialectos regionales liberados',
          'Todos los Cursos + EFE (Medicina, Negocios, Turismo, Derecho)',
          'Tutor IA 24/7 & Podcasts con audio nativo completo',
          'Soporte prioritario y actualizaciones continuas'
        ]
      },
      monthlyCard: {
        badge: 'MENSUAL',
        title: 'Plan Mensual',
        price: '$18.99',
        period: '/ mes',
        desc: 'Flexibilidad mes a mes para practicar a tu ritmo sin compromisos largos.',
        cta: 'Suscribirse al Plan Mensual',
        features: [
          '30 Horas/mes de Conversación Live por voz',
          '🗣️ Intérprete en Tiempo Real Ilimitado',
          '📸 Vision IA Ilimitado',
          'Todos los acentos y cursos incluidos',
          'Cancela cuando quieras con 1 clic'
        ]
      }
    },
    faq: {
      badge: 'Resolvemos tus Dudas ❓',
      title: 'Preguntas Frecuentes',
      subtitle: 'Todo lo que necesitas saber antes de dar el primer paso.',
      items: [
        {
          q: '¿Necesito tener conocimientos previos de español?',
          a: 'Para nada. La plataforma está pensada tanto para quienes empiezan desde cero absoluto como para quienes ya tienen nociones pero se traban al momento de hablar.'
        },
        {
          q: '¿Por qué la Profe Jemi es mejor que Duolingo o cursos tradicionales?',
          a: 'En lugar de rellenar letras en pantalla o traducir frases raras, aquí mantienes conversaciones orales en vivo como en una llamada con una amiga nativa, recibiendo feedback acústico y cultural inmediato.'
        },
        {
          q: '¿Qué es el Intérprete en Vivo?',
          a: 'Es una herramienta bidireccional que traduce de voz a voz en tiempo real adaptando la jerga al país que visites, ideal para resolver situaciones de viaje al instante.'
        },
        {
          q: '¿El Plan Gratuito exige ingresar tarjeta de crédito?',
          a: 'No. Creas tu cuenta solo con tu correo y disfrutas de tus 15 minutos de voz, 7 traducciones y 5 análisis de cámara gratis cada mes de por vida.'
        },
        {
          q: '¿Puedo cancelar mi suscripción cuando quiera?',
          a: 'Totalmente. Desde tu panel de usuario cancelas tu suscripción con 1 solo clic en cualquier momento sin penalizaciones.'
        }
      ]
    },
    finalCta: {
      badge: 'Tu Momento de Hablar es Hoy 🚀',
      title: '¿Listo Para Hablar Español con Orgullo?',
      subtitle: 'Únete a más de 1.500 alumnos que dejaron atrás el miedo y hoy se comunican con naturalidad en el mundo hispano.',
      button: 'Empieza a Hablar Gratis Ahora ➔',
      guarantee: 'Acceso inmediato • Sin tarjeta de crédito • Cancela cuando quieras'
    },
    footer: {
      about: 'Hablemos en Español es la plataforma de enseñanza de la Profesora Jemima Leguizamón, combinando pedagogía acreditada con Inteligencia Artificial conversacional de voz.',
      rights: 'Todos los derechos reservados.',
      privacy: 'Privacidad',
      terms: 'Términos de Servicio',
      contact: 'Contacto'
    }
  },
  en: {
    nav: {
      benefits: 'Why Profe Jemi?',
      howItWorks: 'How It Works',
      features: 'AI Features',
      testimonials: 'Stories',
      pricing: 'Pricing',
      login: 'Log In',
      cta: 'Start Free ➔',
      app: 'Open App 🚀'
    },
    hero: {
      badge: '✨ Official Hablemos en Español Method • 15+ Years Experience',
      titleHighlight: 'Speak Authentic Spanish with AI',
      titleRest: 'With Zero Fear of Judgment',
      subtitle: 'Practice 24/7 real voice conversations with Profe Jemi, eliminate hesitations, and master authentic Spanish for travel or work across 20+ countries.',
      ctaPrimary: 'Start Speaking Free ➔',
      ctaSecondary: 'Meet Profe Jemima ↓',
      riskFree: '100% Free to start • No credit card required • 15 min live voice + Interpreter included every month',
      ratingText: 'Rated 4.9/5 by 1,500+ private and online students',
      jemiTitle: 'Professor Jemima Leguizamón',
      jemiBadge: 'Native Uruguayan • Bilingual Spanish / Portuguese',
      jemiCert: 'Certified ELE & EFE (Instituto Cervantes / Tía Tula)',
      quote: '"Stop memorizing word lists. Start speaking real Spanish from minute one."'
    },
    stats: [
      { number: '17+', label: 'Years teaching Spanish as a foreign language' },
      { number: '1,500+', label: 'Students guided to real fluency' },
      { number: '20+', label: 'Spanish-speaking countries and accents covered' },
      { number: '24/7', label: 'Availability to practice on your own schedule' }
    ],
    problem: {
      badge: 'The Speaking Gap 🛑',
      title: 'Why Memorizing Words on Traditional Apps Never Gets You Speaking',
      subtitle: 'Do you understand Spanish when you read it, but freeze when trying to speak? See if you recognize yourself in these situations:',
      cards: [
        {
          icon: '🧳',
          title: 'The Frozen Traveler',
          desc: 'You land in Buenos Aires, Madrid or Mexico City and freeze when ordering at a restaurant or asking for directions, ending up gesturing or switching to English.'
        },
        {
          icon: '🏠',
          title: 'The Relocated Expat',
          desc: 'You moved to a Spanish-speaking country but dread everyday errands like the pharmacy, bakery, or opening a bank account because local slang sounds unfamiliar.'
        },
        {
          icon: '💼',
          title: 'The Silent Professional',
          desc: 'You collaborate with Spanish-speaking teammates, yet spend entire video calls just nodding and smiling, terrified of making mistakes in front of colleagues.'
        }
      ],
      vsTitle: 'Traditional Apps vs Profe Jemi AI',
      traditional: 'Traditional Apps (Like Duolingo)',
      traditionalPoints: [
        'Repetitive multiple-choice tapping on screen',
        'Nonsensical phrases out of context ("The bear drinks milk")',
        'Zero practice of real, unscripted oral conversation',
        'Ignores country-specific idioms and dialects (Spain vs Argentina)',
        'Leaves you paralyzed when face-to-face with a native'
      ],
      jemiSolution: 'With Profe Jemi AI ✨',
      jemiPoints: [
        'Natural spoken phone-call style conversation with live voice',
        'Warm, instant pronunciation corrections in real time',
        'Two-way walkie-talkie live interpreter in your pocket for travels',
        'Authentic slang tailored to your destination (che, vale, parce)',
        'Effortless confidence without judgment'
      ]
    },
    features: {
      badge: 'AI With a Real Teacher’s Soul 🧠',
      title: 'Everything You Need To Master Spoken Spanish',
      subtitle: 'Profe Jemi AI merges 17 years of proven teaching experience with state-of-the-art conversational voice AI.',
      items: [
        {
          icon: '🎙️',
          badge: 'Core Feature',
          title: '24/7 Live Voice Conversation',
          desc: 'Speak out loud with Profe Jemi whenever you want. She talks back with warm, natural native audio, picks engaging topics, and adapts to your skill level.'
        },
        {
          icon: '🗣️',
          badge: 'Exclusive',
          title: 'Live Real-Time Interpreter',
          desc: 'Your travel lifesaver. Speak in your native language and the AI speaks authentic localized Spanish on your behalf (and translates their reply back to you!).'
        },
        {
          icon: '📸',
          badge: 'Computer Vision',
          title: 'Vision AI: Learn From Your Camera',
          desc: 'Snap a photo of menus, signs, labels, or paperwork. Profe Jemi reads it, explains the context, and teaches you the pronunciation on the spot.'
        },
        {
          icon: '🌎',
          badge: '6 Regions',
          title: 'Authentic Local Accents',
          desc: 'Switch between Peninsular Spain, Rioplatense (Argentina/Uruguay), Mexico, Colombia, Chile, or Paraguay with genuine regional slang.'
        },
        {
          icon: '📚',
          badge: 'Career & ESP',
          title: 'Spanish for Specific Purposes (ESP)',
          desc: 'Curated professional tracks for Medicine, Business, Tourism, and Law so you master the exact terminology your career demands.'
        },
        {
          icon: '🎧',
          badge: 'Immersion',
          title: 'Native Podcasts & 24/7 AI Tutor',
          desc: 'Train your listening with native cultural episodes and get grammar explanations anytime via the built-in smart tutor.'
        }
      ]
    },
    howItWorks: {
      badge: 'Simple 3-Step Process 🎯',
      title: 'How To Start Speaking in 3 Minutes',
      subtitle: 'No complex setup. Runs seamlessly on your mobile phone or desktop browser.',
      steps: [
        {
          step: '01',
          title: 'Create your free account',
          desc: 'Takes 30 seconds. No credit card required. Receive 15 minutes of Live Voice and 7 Interpreter uses every month.'
        },
        {
          step: '02',
          title: 'Pick your goal and dialect',
          desc: 'Choose whether you are preparing for travel, career, or daily relocation, and pick your preferred regional accent.'
        },
        {
          step: '03',
          title: 'Speak 15 minutes a day',
          desc: 'Talk freely with Profe Jemi as if on a WhatsApp voice call. Overcome hesitation and gain natural fluency.'
        }
      ]
    },
    about: {
      badge: 'Meet Your Mentor 👩‍🏫',
      title: 'Hello! I am Professor Jemima Leguizamón',
      role: 'Founder of Hablemos en Español & Pedagogical Mentor of Profe Jemi AI',
      bio1: 'Born in Uruguay and living in Brazil since 2001, I am fully bilingual in Spanish and Portuguese. I intimately understand the exact hesitations, false friends, and psychological blocks that hold foreign speakers back.',
      bio2: 'I have been a dedicated Spanish instructor since 2007, certified by Instituto Tía Tula (Instituto Cervantes Accredited Center) across ELE levels A1 to C2 and ESP (Spanish for Specific Purposes). I have taught hundreds of students worldwide.',
      bio3: 'I designed Profe Jemi AI so you never have to wait for a weekly private class to practice. Now you have a native tutor in your pocket 24/7 to boost your spoken confidence.',
      certBadge: 'Official Instituto Cervantes / Tía Tula Accreditation'
    },
    testimonials: {
      badge: 'Real Stories ⭐',
      title: 'What Our Students Are Saying',
      subtitle: 'Real people who conquered hesitation and found their voice in Spanish.',
      list: [
        {
          name: 'Stephane M.',
          role: 'Expansion Lead • International',
          text: 'I used to freeze during video calls with Latin American partners. Practicing daily voice conversations with Profe Jemi gave me the exact vocabulary and confidence I needed to lead meetings effortlessly.'
        },
        {
          name: 'Patricia Bovo',
          role: 'Medical Student • Relocated to Argentina',
          text: 'I arrived in Rosario barely speaking basic Spanish. The live interpreter and Rioplatense dialect practice saved me in hospital rounds and daily grocery errands.'
        },
        {
          name: 'Amanda Silveira',
          role: 'Designer & Traveler',
          text: 'I practiced 15 minutes a day for a month before a trip across Chile and Peru. I navigated transport, hotels, and tours with zero awkwardness. Best decision ever!'
        },
        {
          name: 'Mônica Dantas',
          role: 'Spanish Language Instructor',
          text: 'As a fellow language teacher, I wholeheartedly praise Jemima’s methodology. Bringing her pedagogy into an interactive voice AI makes fluent Spanish accessible to anyone.'
        }
      ]
    },
    pricing: {
      badge: 'Transparent Pricing 💎',
      title: 'Plans Designed For Real Fluency',
      subtitle: 'Start 100% free and upgrade anytime when you are ready to accelerate.',
      currencyNotice: 'International rates in US Dollars (USD)',
      freeCard: {
        badge: '🆓 Start Free',
        title: 'Free Plan',
        price: '$0',
        period: '/ forever',
        desc: 'Ideal to experience conversational voice AI with zero risk.',
        cta: 'Create Free Account',
        features: [
          '15 minutes of Live Voice conversation every month',
          '7 translations with the Live Interpreter every month',
          '5 camera analyses with Vision AI every month',
          'Access to foundational A1 lessons',
          'No credit card required'
        ]
      },
      annualCard: {
        badge: '🔥 BEST VALUE • SAVE 35%',
        title: 'Annual Premium Plan',
        price: '$149.00',
        period: '/ year',
        subprice: 'Only $12.41/month (Save $78.88/year)',
        desc: 'For serious learners committed to effortless fluency this year.',
        cta: 'Get Annual Access with 35% OFF ➔',
        features: [
          '30 Hours/month of Live Voice conversation (daily practice)',
          '🗣️ UNLIMITED Real-Time Live Interpreter',
          '📸 UNLIMITED Vision AI (scan menus and documents freely)',
          'All 6 regional accents and slang unlocked',
          'All Courses + Specialized ESP (Medical, Business, Tourism, Law)',
          '24/7 AI Tutor & full native podcasts',
          'Priority support & continuous new content'
        ]
      },
      monthlyCard: {
        badge: 'MONTHLY',
        title: 'Monthly Plan',
        price: '$18.99',
        period: '/ month',
        desc: 'Maximum flexibility to train month-to-month with no long commitment.',
        cta: 'Start Monthly Plan',
        features: [
          '30 Hours/month of Live Voice conversation',
          '🗣️ Unlimited Live Interpreter',
          '📸 Unlimited Vision AI',
          'All accents and courses included',
          'Cancel anytime with 1 click'
        ]
      }
    },
    faq: {
      badge: 'Got Questions? ❓',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know before getting started.',
      items: [
        {
          q: 'Do I need previous Spanish experience?',
          a: 'Not at all! Profe Jemi AI accommodates complete beginners starting at A1 all the way to advanced learners polishing their accent. The AI dynamically calibrates speech pace and vocabulary to match your comfort level.'
        },
        {
          q: 'Why is Profe Jemi AI different from Duolingo or textbooks?',
          a: 'Instead of tapping on-screen multiple-choice bubbles, you speak out loud in real time just like a live voice call with a native friend. You receive immediate pronunciation guidance and practical colloquial context.'
        },
        {
          q: 'What is the Live Real-Time Interpreter?',
          a: 'It is a two-way pocket speech translator that bridges conversations between your native tongue and authentic localized Spanish, including real street idioms.'
        },
        {
          q: 'Does the Free Plan require a credit card?',
          a: 'No. You can sign up with just your email. You receive your free monthly quota of voice minutes, translations, and vision scans with no expiration.'
        },
        {
          q: 'Can I cancel my subscription anytime?',
          a: 'Yes, absolutely. You can manage or cancel your subscription with a single click inside your profile settings at any moment.'
        }
      ]
    },
    finalCta: {
      badge: 'Your Time To Speak Is Today 🚀',
      title: 'Ready To Speak Real Spanish With Pride?',
      subtitle: 'Join 1,500+ students who conquered hesitation and unlocked fluent communication across the Spanish-speaking world.',
      button: 'Start Speaking For Free Now ➔',
      guarantee: 'Instant access • No credit card required • Cancel anytime'
    },
    footer: {
      about: 'Hablemos en Español is the Spanish learning platform founded by Professor Jemima Leguizamón, blending accredited pedagogy with conversational voice AI.',
      rights: 'All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Support & Contact'
    }
  }
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Detección automática del idioma del navegador
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
      if (browserLang.startsWith('pt')) return 'pt';
      if (browserLang.startsWith('es')) return 'es';
      return 'en';
    } catch (e) {
      return 'pt'; // Default para público hispano / brasileño
    }
  });

  // Detección de región (Brasil vs Global) para fijar moneda
  const [isBR, setIsBR] = useState<boolean>(() => {
    try {
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      const brTimezones = ['sao_paulo', 'fortaleza', 'manaus', 'belem', 'cuiaba', 'recife', 'bahia', 'maceio', 'noronha'];
      const browserLang = (navigator.language || '').toLowerCase();
      return brTimezones.some(t => tz.includes(t)) || browserLang.includes('pt');
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    // Si cambia el idioma manualmente a pt, sugerir moneda BRL
    if (lang === 'pt') setIsBR(true);
    else if (lang === 'en') setIsBR(false);
  }, [lang]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = TRANSLATIONS[lang];

  const handleStartFree = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/signup');
    }
  };

  const handleGoLogin = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-red-500 selection:text-white">
      {/* ══════════════════════════════════════════════ */}
      {/* 1. NAVBAR SUPERIOR CON SELECTOR DE IDIOMA */}
      {/* ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo y Marca */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg shadow-red-500/20 font-black">
              PJ
            </div>
            <div>
              <span className="font-outfit font-black text-xl text-white tracking-tight flex items-center gap-1.5">
                Profe Jemi <span className="text-red-500 text-lg">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block -mt-1">
                Hablemos en Español
              </span>
            </div>
          </div>

          {/* Links de navegación (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#beneficios" className="hover:text-white transition-colors">{t.nav.benefits}</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">{t.nav.howItWorks}</a>
            <a href="#recursos" className="hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#depoimentos" className="hover:text-white transition-colors">{t.nav.testimonials}</a>
            <a href="#planos" className="hover:text-white transition-colors">{t.nav.pricing}</a>
          </nav>

          {/* Selector de Idioma & Botones CTA */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang('pt')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'pt' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title="Português"
              >
                🇧🇷 PT
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'es' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title="Español"
              >
                🇪🇸 ES
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title="English"
              >
                🇺🇸 EN
              </button>
            </div>

            {/* Login / App CTA */}
            {user ? (
              <button
                onClick={handleGoLogin}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>{t.nav.app}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoLogin}
                  className="hidden sm:inline-block text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={handleStartFree}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95"
                >
                  {t.nav.cta}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════ */}
      {/* 2. HERO SECTION (Above-the-fold formula)     */}
      {/* ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow de fondo decorativo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Columna Izquierda: Copy Persuasivo */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge Oficial */}
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-red-400">
                <span>{t.hero.badge}</span>
              </div>

              {/* Titular Principal (6-12 palabras según regla conversion) */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-outfit font-black tracking-tight text-white leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300">
                  {t.hero.titleHighlight}
                </span>{' '}
                {t.hero.titleRest}
              </h1>

              {/* Subheadline (15-25 palabras) */}
              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t.hero.subtitle}
              </p>

              {/* Botón CTA Primario y Secundario */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={handleStartFree}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  <span>{t.hero.ctaPrimary}</span>
                </button>

                <a
                  href="#profesora"
                  className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-sm px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <span>{t.hero.ctaSecondary}</span>
                </a>
              </div>

              {/* Micro-copia que elimina el riesgo (Risk Reversal) */}
              <p className="text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-2 pt-1">
                <span>🔒</span>
                <span>{t.hero.riskFree}</span>
              </p>

              {/* Social Proof Above the Fold */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 border-t border-slate-800/80">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-red-600 flex items-center justify-center font-bold text-xs text-white">S</div>
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-amber-600 flex items-center justify-center font-bold text-xs text-white">P</div>
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">A</div>
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-purple-600 flex items-center justify-center font-bold text-xs text-white">M</div>
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center font-bold text-xs text-white">H</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 text-sm">
                    ★★★★★
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    {t.hero.ratingText}
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Foto de la Profesora Jemima + UI Mockup Interactivo */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Marco de resplandor */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 rounded-3xl blur-lg opacity-40"></div>

                <div className="relative bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* Foto de la Profesora Jemima proporcionada por el usuario */}
                  <img
                    src="/jemima_landing.jpg"
                    alt="Profesora Jemima Leguizamón - Hablemos en Español"
                    className="w-full h-[420px] object-cover object-top"
                  />

                  {/* Tarjeta flotante inferior */}
                  <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/80 border-t border-slate-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-outfit font-black text-lg text-white">
                        {t.hero.jemiTitle}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Online 24/7
                      </span>
                    </div>

                    <p className="text-xs text-amber-300 font-bold mb-1">
                      {t.hero.jemiCert}
                    </p>
                    <p className="text-xs text-slate-300 italic">
                      {t.hero.quote}
                    </p>

                    {/* Simulación de audio interactivo */}
                    <div className="mt-4 bg-slate-800/90 rounded-2xl p-3 border border-slate-700 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                        🎙️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-200 truncate">
                          Conversación Live con IA Nativa
                        </p>
                        <p className="text-[10px] text-slate-400">
                          "¡Hola! ¿Cómo estás hoy? ¿De qué te gustaría hablar?"
                        </p>
                      </div>
                      <span className="text-xs text-red-400 font-black animate-pulse">
                        •••
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 3. BARRA DE AUTORIDAD Y NÚMEROS (Trust Strip) */}
      {/* ══════════════════════════════════════════════ */}
      <section className="bg-slate-950 border-y border-slate-800/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {t.stats.map((st, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-outfit font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                  {st.number}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-400">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 4. SECCIÓN DEL PROBLEMA (Agitar el dolor)   */}
      {/* ══════════════════════════════════════════════ */}
      <section id="beneficios" className="py-20 lg:py-28 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de la sección */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              {t.problem.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white leading-tight">
              {t.problem.title}
            </h2>
            <p className="text-base text-slate-300">
              {t.problem.subtitle}
            </p>
          </div>

          {/* 3 Tarjetas de dolor (Turista, Mudanza, Trabajo) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {t.problem.cards.map((card, i) => (
              <div key={i} className="bg-slate-800/60 rounded-3xl p-8 border border-slate-700/80 hover:border-red-500/40 transition-all shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-700/60 flex items-center justify-center text-3xl mb-6 shadow-inner">
                    {card.icon}
                  </div>
                  <h3 className="font-outfit font-bold text-xl text-white mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla Comparativa: Apps Tradicionales vs Profe Jemi AI */}
          <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 border border-slate-800 max-w-5xl mx-auto shadow-2xl">
            <h3 className="text-2xl font-outfit font-black text-center text-white mb-8">
              {t.problem.vsTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna Tradicional */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-red-500/20 space-y-4">
                <div className="flex items-center gap-2 text-red-400 font-bold text-base border-b border-slate-800 pb-3">
                  <span>❌</span>
                  <span>{t.problem.traditional}</span>
                </div>
                <ul className="space-y-3">
                  {t.problem.traditionalPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
                      <span className="text-red-500 font-bold shrink-0">✕</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Columna Profe Jemi AI */}
              <div className="bg-gradient-to-b from-red-950/40 to-slate-900 p-6 rounded-2xl border-2 border-red-500/50 space-y-4 relative shadow-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-red-500/20 pb-3">
                  <span>✨</span>
                  <span className="text-white">{t.problem.jemiSolution}</span>
                </div>
                <ul className="space-y-3">
                  {t.problem.jemiPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center pt-8">
              <button
                onClick={handleStartFree}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition-all"
              >
                {t.hero.ctaPrimary}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 5. CARACTERÍSTICAS / SOLUCIÓN TECNOLÓGICA   */}
      {/* ══════════════════════════════════════════════ */}
      <section id="recursos" className="py-20 lg:py-28 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              {t.features.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white leading-tight">
              {t.features.title}
            </h2>
            <p className="text-base text-slate-300">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feat, i) => (
              <div
                key={i}
                className="bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-red-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/20 to-orange-500/20 text-red-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-outfit font-bold text-xl text-white mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 6. CÓMO FUNCIONA (3 Pasos Sencillos)        */}
      {/* ══════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-20 lg:py-28 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              {t.howItWorks.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white leading-tight">
              {t.howItWorks.title}
            </h2>
            <p className="text-base text-slate-300">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {t.howItWorks.steps.map((st, i) => (
              <div key={i} className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700 relative">
                <span className="text-5xl font-black font-outfit text-red-500/20 block mb-4">
                  {st.step}
                </span>
                <h3 className="font-outfit font-bold text-xl text-white mb-3">
                  {st.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 7. SOBRE LA PROFESORA JEMIMA LEGUIZAMÓN      */}
      {/* ══════════════════════════════════════════════ */}
      <section id="profesora" className="py-20 lg:py-28 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl p-8 sm:p-14 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Foto Real de la Profesora */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-4 border-red-500/40 shadow-2xl">
                  <img
                    src="/jemima_landing.jpg"
                    alt="Profesora Jemima Leguizamón"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-lg border border-red-400">
                  {t.about.certBadge}
                </div>
              </div>
            </div>

            {/* Biografía y Filosofía de Enseñanza */}
            <div className="lg:col-span-7 space-y-5">
              <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                {t.about.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white">
                {t.about.title}
              </h2>
              <p className="text-sm font-bold text-orange-400">
                {t.about.role}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.about.bio1}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.about.bio2}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.about.bio3}
              </p>

              <div className="pt-2">
                <button
                  onClick={handleStartFree}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-black text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all"
                >
                  {t.hero.ctaPrimary}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 8. TESTIMONIOS REALES (Social Proof)         */}
      {/* ══════════════════════════════════════════════ */}
      <section id="depoimentos" className="py-20 lg:py-28 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              {t.testimonials.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white leading-tight">
              {t.testimonials.title}
            </h2>
            <p className="text-base text-slate-300">
              {t.testimonials.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.testimonials.list.map((item, i) => (
              <div key={i} className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
                    ★★★★★
                  </div>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic mb-6">
                    "{item.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-700/60 pt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center font-bold text-sm text-white">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 9. TABLA DE PRECIOS REGIONALIZADOS           */}
      {/* ══════════════════════════════════════════════ */}
      <section id="planos" className="py-20 lg:py-28 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              {t.pricing.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white leading-tight">
              {t.pricing.title}
            </h2>
            <p className="text-base text-slate-300">
              {t.pricing.subtitle}
            </p>
            <p className="text-xs font-semibold text-emerald-400">
              {t.pricing.currencyNotice}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
            {/* 1. Plan Gratuito */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 mb-4">
                  {t.pricing.freeCard.badge}
                </span>
                <h3 className="font-outfit font-black text-2xl text-white mb-2">
                  {t.pricing.freeCard.title}
                </h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-black text-white">{isBR ? 'R$ 0' : '$0'}</span>
                  <span className="text-xs text-slate-400">{t.pricing.freeCard.period}</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">{t.pricing.freeCard.desc}</p>

                <ul className="space-y-3 border-t border-slate-800 pt-6">
                  {t.pricing.freeCard.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleStartFree}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-3.5 rounded-xl border border-slate-700 transition-colors"
                >
                  {t.pricing.freeCard.cta}
                </button>
              </div>
            </div>

            {/* 2. Plan Anual (El más destacado) */}
            <div className="bg-gradient-to-b from-red-950/60 via-slate-900 to-slate-900 rounded-3xl p-8 border-2 border-red-500 shadow-2xl relative flex flex-col justify-between scale-105 z-10">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                {t.pricing.annualCard.badge}
              </span>

              <div>
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 mb-4">
                  RECOMENDADO
                </span>
                <h3 className="font-outfit font-black text-2xl text-white mb-2">
                  {t.pricing.annualCard.title}
                </h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-5xl font-black text-white tracking-tight">
                    {isBR ? 'R$ 599,00' : '$149.00'}
                  </span>
                  <span className="text-xs text-slate-400">{t.pricing.annualCard.period}</span>
                </div>
                {t.pricing.annualCard.subprice && (
                  <p className="text-xs font-bold text-emerald-400 mb-2">
                    {t.pricing.annualCard.subprice}
                  </p>
                )}
                <p className="text-xs text-slate-400 mb-6">{t.pricing.annualCard.desc}</p>

                <ul className="space-y-3 border-t border-red-500/20 pt-6">
                  {t.pricing.annualCard.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleStartFree}
                  className="w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm py-4 rounded-xl shadow-xl shadow-red-600/40 transition-all transform active:scale-95"
                >
                  {t.pricing.annualCard.cta}
                </button>
                {isBR && (
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Parcelamento disponível em até 12x no cartão de crédito.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Plan Mensual */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 mb-4">
                  {t.pricing.monthlyCard.badge}
                </span>
                <h3 className="font-outfit font-black text-2xl text-white mb-2">
                  {t.pricing.monthlyCard.title}
                </h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-black text-white">
                    {isBR ? 'R$ 75,90' : '$18.99'}
                  </span>
                  <span className="text-xs text-slate-400">{t.pricing.monthlyCard.period}</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">{t.pricing.monthlyCard.desc}</p>

                <ul className="space-y-3 border-t border-slate-800 pt-6">
                  {t.pricing.monthlyCard.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleStartFree}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-3.5 rounded-xl border border-slate-700 transition-colors"
                >
                  {t.pricing.monthlyCard.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 10. PREGUNTAS FRECUENTES (FAQ con objeciones) */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              {t.faq.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white leading-tight">
              {t.faq.title}
            </h2>
            <p className="text-base text-slate-300">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {t.faq.items.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full px-6 py-5 text-left font-outfit font-bold text-base text-white flex items-center justify-between gap-4"
                  >
                    <span>{item.q}</span>
                    <span className="text-red-400 font-mono text-lg shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-700/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 11. CTA FINAL CON REVERSIÓN TOTAL DE RIESGO   */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-red-400">
            <span>{t.finalCta.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-outfit font-black text-white max-w-3xl mx-auto leading-tight">
            {t.finalCta.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.finalCta.subtitle}
          </p>

          <div className="pt-4">
            <button
              onClick={handleStartFree}
              className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-lg sm:text-xl px-10 py-5 rounded-2xl shadow-2xl shadow-red-600/40 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              {t.finalCta.button}
            </button>
            <p className="text-xs text-slate-400 mt-4">
              {t.finalCta.guarantee}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* 12. FOOTER                                   */}
      {/* ══════════════════════════════════════════════ */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2 max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold font-outfit text-base">
              <span>Profe Jemi ✨</span>
              <span className="text-xs text-slate-400 font-normal">por Profesora Jemima Leguizamón</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              {t.footer.about}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <a href="https://hablemosenespanol.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              hablemosenespanol.com
            </a>
            <span className="text-slate-700">•</span>
            <span>{t.footer.rights} © {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
