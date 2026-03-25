
export enum SpanishLevel {
  BASIC = 'Básico',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado'
}

export type UserGender = 'Hombre' | 'Mujer' | 'No Identificarme';

export type SpanishAccent =
  | 'Español de España'
  | 'Español de México'
  | 'Español del Rio de la Plata (Argentina y Uruguay)'
  | 'Español de Chile'
  | 'Español de Colombia'
  | 'Español de Paraguay';

export interface User {
  name: string;
  isSubscribed: boolean;
  level: SpanishLevel;
  gender: UserGender;
  accent: SpanishAccent;
  progress: number;
  nativeLanguage?: string;
  country?: string;
  hasCompletedOnboarding: boolean;
  learningGoal?: string;
  prioritySituation?: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'feedback';
  text: string;
  timestamp: Date;
  audioData?: string; // Base64 PCM data
  imageUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: SpanishLevel;
  category?: string;
  description: string;
  systemPrompt: string;
  isCompleted: boolean;
  representativeImageUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string;
  stripe_customer_id: string | null;
  created_at: string;
}

export type PodcastCategory = 'Turismo' | 'Trabajo' | 'Estudio' | 'Cultura' | 'Culinaria';

export interface Podcast {
  id: string;
  title: string;
  description: string;
  category: PodcastCategory;
  audioUrl: string; // The URL to play
  duration?: string; // e.g. "05:30"
  imageUrl?: string; // Optional cover image
}
