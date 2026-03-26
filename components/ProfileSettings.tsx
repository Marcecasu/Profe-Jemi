import React, { useState } from 'react';
import { User, SpanishLevel, SpanishAccent } from '../types';
import { supabase } from '../services/supabase';

interface ProfileSettingsProps {
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

const ACCENTS: SpanishAccent[] = [
  'Español de España',
  'Español de México',
  'Español del Rio de la Plata (Argentina y Uruguay)',
  'Español de Chile',
  'Español de Colombia',
  'Español de Paraguay'
];

const LEVELS: SpanishLevel[] = [
  SpanishLevel.BASIC,
  SpanishLevel.INTERMEDIATE,
  SpanishLevel.ADVANCED
];

const AVATARS = ['🤪', '😎', '👻', '👽', '🤖', '🦁', '🐸', '🦊', '🥑', '🌮', '🎭', '🎸'];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [level, setLevel] = useState<SpanishLevel>(user.level);
  const [accent, setAccent] = useState<SpanishAccent>(user.accent);
  const [avatar, setAvatar] = useState<string>(user.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const updatedData = { name, level, accent, avatar };

    // Actualizar estado global y local storage
    onUpdateUser(updatedData);

    // Actualizar metadata de supabase auth
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.auth.updateUser({
        data: updatedData
      });
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 w-full">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10 opacity-50"></div>
        
        <div className="flex items-center gap-4 mb-2">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-red-100 border-4 border-red-500 flex shrink-0 items-center justify-center text-4xl shadow-md">
                {avatar}
            </div>
            <div>
                <h2 className="text-3xl font-outfit font-bold text-gray-900">Tu Perfil ⚙️</h2>
                <p className="text-gray-500">Puedes cambiar tu avatar y preferencias de aprendizaje cuando quieras.</p>
            </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 mt-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Elige un Avatar Gracioso</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(img => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setAvatar(img)}
                  className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl transition-all ${
                    avatar === img
                      ? 'bg-red-500 shadow-md scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {img}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="name-input" className="block text-sm font-bold text-gray-700 mb-2">Tu Nombre</label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tu Nivel de Español</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LEVELS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    level === l
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="accent-select" className="block text-sm font-bold text-gray-700 mb-2">Acento a Practicar</label>
            <select
              id="accent-select"
              value={accent}
              onChange={(e) => setAccent(e.target.value as SpanishAccent)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium bg-white appearance-none"
            >
              {ACCENTS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {success ? (
               <div className="text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg text-sm">
                   ¡Perfil actualizado correctamente! ✅
               </div>
            ) : <div></div>}
            
            <button
              type="submit"
              disabled={saving}
              className={`font-bold py-3 px-8 rounded-xl text-white transition-all shadow-md ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 active:scale-95'
              }`}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
