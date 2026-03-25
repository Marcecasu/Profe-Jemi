
import React, { useState } from 'react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onNavigate: (view: string) => void;
  currentView: string;
  isAdmin?: boolean;
}

// IMPORTANTE: Ruta local a la imagen real de la Profe Jemi
const PROFE_JEMI_REAL = "/profe_jemi.jpg";

const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, currentView, isAdmin }) => {
  const { signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('profe_jemi_user');
    localStorage.removeItem('profe_jemi_completed_lessons');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => onNavigate('home')}
            >
              <div className="relative mr-3">
                <div className="bg-red-500 w-11 h-11 rounded-full flex items-center justify-center overflow-hidden border-2 border-red-500 shadow-sm group-hover:scale-110 transition-transform aspect-square">
                  <img src={PROFE_JEMI_REAL} alt="Profe Jemi" className="w-full h-full object-cover" />
                </div>
              </div>
              <h1 className="text-2xl font-outfit font-bold text-gray-900">Profe Jemi ✨</h1>
            </div>

            <nav className="hidden md:flex space-x-6">
              <button onClick={() => onNavigate('home')} className={`px-3 py-2 text-sm font-bold transition-colors ${currentView === 'home' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>🏠 Dashboard</button>
              <button onClick={() => onNavigate('chat')} className={`px-3 py-2 text-sm font-bold transition-colors ${currentView === 'chat' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>💬 Tutor</button>
              <button onClick={() => onNavigate('vision')} className={`px-3 py-2 text-sm font-bold transition-colors ${currentView === 'vision' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>📸 Vision</button>
              <button onClick={() => onNavigate('voice')} className={`px-3 py-2 text-sm font-bold transition-colors ${currentView === 'voice' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>🎙️ Live</button>
              <button onClick={() => onNavigate('courses')} className={`px-3 py-2 text-sm font-bold transition-colors ${currentView === 'courses' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>📚 Cursos</button>
              <button onClick={() => onNavigate('podcasts')} className={`px-3 py-2 text-sm font-bold transition-colors ${currentView === 'podcasts' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>🎧 Podcasts</button>
              {isAdmin && <button onClick={() => onNavigate('admin')} className={`px-3 py-2 text-sm font-bold transition-colors ${currentView === 'admin' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>🛡️ Admin</button>}
            </nav>

            <div className="flex items-center space-x-4 relative">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900">{user.name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Nivel: {user.level}</p>
              </div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-500 overflow-hidden hover:scale-105 transition-transform shadow-sm aspect-square"
              >
                <img src={`https://picsum.photos/seed/${user.name}/100/100`} alt="Profile" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.level} • {user.accent}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors flex items-center gap-2"
                    >
                      🚪 Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-xs font-medium">
          &copy; {new Date().getFullYear()} Profe Jemi 👩‍🏫 Aprende con Inteligencia y Alegría ✨
        </div>
      </footer>
    </div>
  );
};

export default Layout;
