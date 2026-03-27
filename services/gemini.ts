
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SpanishAccent, User } from "../types";

const SYSTEM_INSTRUCTION = `Eres la Profe Jemi, una experta profesora de Español como Lengua Extranjera (ELE). 
Eres una mujer amable, paciente y muy motivadora. ✨🌟

REGLA DE ORO DEL IDIOMA:
- Debes hablar principalmente en español para fomentar la inmersión. 🇪🇸
- ES OBLIGATORIO: Todas las explicaciones gramaticales, correcciones, traducciones y notas culturales deben estar escritas ÚNICAMENTE en el IDIOMA NATIVO del estudiante. 🌉📚
- PROHIBICIÓN: No utilices inglés para las explicaciones a menos que el idioma nativo del alumno sea explícitamente el inglés.

METODOLOGÍA:
1. INMERSIÓN DINÁMICA: Mantén la conversación fluida en español.
2. PUENTE EDUCATIVO: Usa la LENGUA NATIVA para explicar conceptos técnicos y gramática. 
3. ADAPTACIÓN AL CONTEXTO: Usa ejemplos basados en el OBJETIVO del usuario (ej. Trabajo, Turismo) y su SITUACIÓN PRIORITARIA (ej. Salud, Alquiler). 🎯

NIVELES:
- Básico: Español muy simple y pausado. Explicaciones constantes en lengua nativa. 🌱
- Intermedio: Español natural con modismos. Lengua nativa para matices complejos. 🌿
- Avanzado: Español rico y complejo. Lengua nativa solo para precisiones abstractas. 🌳

USO DE EMOJIS: Es OBLIGATORIO usar emojis amigables. 🎈🎉`;

const cleanTextForTTS = (text: string) => {
  // Elimina markdown, emojis y caracteres especiales para que la voz suene natural
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/`+/g, '')
    // Regex expandido para eliminar la mayoría de emojis comunes y evitar pausas extrañas
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F191}-\u{1F251}]/gu, '')
    .trim();
};

export const getTutorResponse = async (
  prompt: string,
  user: User,
  history: { role: string, parts: { text: string }[] }[],
  customSystemPrompt?: string
) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  const nativeLang = user.nativeLanguage || 'Inglés';

  const genderInstruction = user.gender === 'Mujer'
    ? "El usuario es mujer. Usa adjetivos femeninos. 👩‍🎓"
    : user.gender === 'Hombre'
      ? "El usuario es hombre. Usa adjetivos masculinos. 👨‍🎓"
      : "El usuario es no binario o prefiere neutralidad. 👤";

  const accentInstruction = `Usa el "${user.accent}" con su vocabulario local. 📍`;
  const goalContext = `Objetivo: "${user.learningGoal}". Prioridad: "${user.prioritySituation}". 🎯`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history,
      ...(prompt.trim() ? [{ role: 'user', parts: [{ text: prompt }] }] : [])
    ],
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION} 
      ${customSystemPrompt ? `Contexto lección: ${customSystemPrompt}` : ""}
      Nivel actual del alumno: ${user.level}. 
      ⚠️ REGLA CRÍTICA ⚠️: El IDIOMA NATIVO del alumno para todas las explicaciones es: ${nativeLang}. DEBES usar ${nativeLang} para explicar gramática y errores.
      ${genderInstruction}
      ${accentInstruction}
      ${goalContext}
      💡 No asumas inglés por defecto. Usa estrictamente ${nativeLang}.`,
      temperature: 0.7,
    }
  });

  return response.text || '';
};

export const generateLessonImage = async (title: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `High quality, friendly, 3D style educational illustration for a Spanish lesson titled: "${title}". 
          Context: ${description}. 
          Bright, warm colors, inviting atmosphere, Pixar-style aesthetic. No text in the image. 🎨`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  const candidates = response.candidates;
  if (!candidates || !candidates[0] || !candidates[0].content || !candidates[0].content.parts) return null;

  for (const part of candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateSpeech = async (text: string, accent: SpanishAccent) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  const cleanedText = cleanTextForTTS(text);
  if (!cleanedText) {
    console.warn('[TTS] cleanTextForTTS returned empty string, skipping');
    return null;
  }

  // Mapa de voces para aproximar el acento deseado usando las voces disponibles de Gemini
  // 'Zephyr' y 'Kore' son las voces femeninas más naturales.
  const voiceMap: Record<string, string> = {
    'Español de España': 'Kore', // Voz clara, más estándar
    'Español de México': 'Zephyr', // Voz suave, funciona bien para latam
    'Español del Rio de la Plata (Argentina y Uruguay)': 'Zephyr',
    'Español de Chile': 'Zephyr',
    'Español de Colombia': 'Kore',
    'Español de Paraguay': 'Zephyr'
  };

  const voiceName = voiceMap[accent] || 'Kore';
  console.log(`[TTS] Generating speech: model=gemini-2.5-flash-preview-tts, voice=${voiceName}, textLength=${cleanedText.length}`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanedText }] }],
      config: {
        responseModalities: ['AUDIO' as Modality],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    console.log(`[TTS] Result: ${audioData ? `success (${audioData.length} bytes)` : 'no audio data returned'}`);
    return audioData || null;
  } catch (error) {
    console.error("[TTS] Error generating speech:", error);
    return null;
  }
};

export const analyzeGrammar = async (text: string, nativeLanguage: string = 'Inglés') => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza minuciosamente esta frase en español: "${text}". 
    Redacta una explicación pedagógica completa EXCLUSIVAMENTE en el idioma: ${nativeLanguage}.
    Explica la regla gramatical o el error cometido. ✨`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hasError: { type: Type.BOOLEAN },
          original: { type: Type.STRING },
          corrected: { type: Type.STRING },
          explanation: {
            type: Type.STRING,
            description: `Explicación didáctica escrita estrictamente en ${nativeLanguage}`
          },
          level: { type: Type.STRING }
        },
        required: ["hasError", "original", "corrected", "explanation"]
      }
    }
  });
  try {
    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (e) { return null; }
};

export const analyzeImageVocabulary = async (base64Image: string, mimeType: string, accent: SpanishAccent, nativeLanguage: string = 'Inglés') => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
    console.log('[ImageAnalyzer] Starting analysis with model gemini-3-flash-preview, mimeType:', mimeType, 'language:', nativeLanguage);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            {
              text: `Identifica objetos en esta imagen usando "${accent}". 
              Para cada objeto, da el nombre en español y una breve descripción explicativa escrita ÚNICAMENTE en el idioma nativo del alumno: ${nativeLanguage}. 
              Responde en formato JSON con emojis descriptivos. 🍎🚗🏢` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intro: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  example: { type: Type.STRING },
                  explanation: {
                    type: Type.STRING,
                    description: `Traducción y contexto redactados estrictamente en ${nativeLanguage}`
                  }
                },
                required: ["word", "example", "explanation"]
              }
            }
          },
          required: ["intro", "items"]
        }
      }
    });
    console.log('[ImageAnalyzer] Response received, parsing...');
    if (!response.text) {
      console.error('[ImageAnalyzer] No text in response');
      return null;
    }
    return JSON.parse(response.text);
  } catch (e: any) {
    console.error('[ImageAnalyzer] ERROR:', e?.message || e);
    console.error('[ImageAnalyzer] Full error:', JSON.stringify(e, null, 2));
    throw e; // Re-throw so ImageAnalyzer.tsx can show the real error
  }
};
