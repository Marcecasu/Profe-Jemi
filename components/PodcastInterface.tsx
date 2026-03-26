import React, { useState, useEffect } from 'react';
import { Podcast, PodcastCategory } from '../types';
import { supabase } from '../services/supabase';

// Datos estáticos por si fallara la base de datos o mientras la configuran
const FALLBACK_PODCASTS: Podcast[] = [
    {
        id: '1',
        title: 'Saludos, Presentaciones y Profesiones (PT)',
        description: 'Vocabulario esencial para empezar a presentarte y hablar de tu profesión.',
        category: 'Estudio',
        audioUrl: 'https://podcast.hablemosenespanol.com/pt/basico/podcast_saludos_presentaciones_profesiones_basico_pt.mp3',
        duration: 'Básico'
    },
    {
        id: '2',
        title: 'Guía de Turismo (PT)',
        description: 'Vocabulario práctico para desenvolverse de viaje y hacer turismo.',
        category: 'Turismo',
        audioUrl: 'https://podcast.hablemosenespanol.com/pt/basico/podcast_turismo_pt.mp3',
        duration: 'Básico'
    },
    {
        id: '3',
        title: 'Trabajo y Oficina (PT)',
        description: 'Aprende frases útiles para desenvolverte con éxito en tu ambiente laboral.',
        category: 'Trabajo',
        audioUrl: 'https://podcast.hablemosenespanol.com/pt/basico/podcast_trabajo_oficina.mp3',
        duration: 'Básico'
    },
    {
        id: '4',
        title: 'Cultura: Curiosidades y Costumbres (PT)',
        description: 'Sumérgete en la cultura hispanohablante y descubre sus costumbres más interesantes.',
        category: 'Cultura',
        audioUrl: 'https://podcast.hablemosenespanol.com/pt/basico/podcast_cultura_pt.mp3',
        duration: 'Básico'
    },
    {
        id: '5',
        title: 'Culinaria y Gastronomía (PT)',
        description: 'Descubre los sabores latinos y aprende el vocabulario para restaurantes y comidas.',
        category: 'Culinaria',
        audioUrl: 'https://podcast.hablemosenespanol.com/pt/basico/podcast_culinaria_pt.mp3',
        duration: 'Básico'
    }
];

const CATEGORIES: { id: PodcastCategory; icon: string; bg: string; text: string }[] = [
    { id: 'Turismo', icon: '✈️', bg: 'bg-blue-50', text: 'text-blue-700' },
    { id: 'Trabajo', icon: '💼', bg: 'bg-purple-50', text: 'text-purple-700' },
    { id: 'Estudio', icon: '📚', bg: 'bg-green-50', text: 'text-green-700' },
    { id: 'Cultura', icon: '🎭', bg: 'bg-orange-50', text: 'text-orange-700' },
    { id: 'Culinaria', icon: '🍳', bg: 'bg-red-50', text: 'text-red-700' },
];

const PodcastInterface: React.FC = () => {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<PodcastCategory | 'Todos'>('Todos');
    const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);

    useEffect(() => {
        const fetchPodcasts = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('podcasts').select('*');
                if (error) {
                    console.log('No se pudo cargar la tabla de podcasts de Supabase, usando fallbacks.', error.message);
                    setPodcasts(FALLBACK_PODCASTS);
                } else {
                    // Mapeo básico asumiendo que las columnas se llaman igual
                    const mappedData = data.map(item => ({
                        id: item.id.toString(),
                        title: item.title,
                        description: item.description,
                        category: item.category as PodcastCategory,
                        audioUrl: item.audio_url, // Asumiendo que guardarán la columna como audio_url
                        duration: item.duration,
                    }));
                    setPodcasts(mappedData.length > 0 ? mappedData : FALLBACK_PODCASTS);
                }
            } catch (err) {
                console.error('Error general fetching podcasts:', err);
                setPodcasts(FALLBACK_PODCASTS);
            } finally {
                setLoading(false);
            }
        };

        fetchPodcasts();
    }, []);

    const filteredPodcasts = activeCategory === 'Todos' ? podcasts : podcasts.filter(p => p.category === activeCategory);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-8">
            {/* Lado Izquierdo: Lista de Categorías y Podcasts */}
            <div className={`w-full ${currentPodcast ? 'md:w-2/3 lg:w-3/4' : 'w-full'} transition-all duration-300`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-outfit font-bold text-gray-900 mb-2">Podcasts de Jemi 🎧</h2>
                    <p className="text-gray-500">Escucha y aprende con contenido catalogado por tus intereses.</p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveCategory('Todos')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeCategory === 'Todos' ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Todos
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                                activeCategory === cat.id 
                                ? 'bg-gray-900 text-white shadow-md' 
                                : `bg-white border border-gray-200 text-gray-700 hover:${cat.bg}`
                            }`}
                        >
                            <span>{cat.icon}</span> {cat.id}
                        </button>
                    ))}
                </div>

                {/* Lista de Audios */}
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(n => <div key={n} className="h-24 bg-white border border-gray-100 rounded-2xl"></div>)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPodcasts.map(podcast => {
                            const catStyle = CATEGORIES.find(c => c.id === podcast.category) || CATEGORIES[0];
                            const isPlaying = currentPodcast?.id === podcast.id;

                            return (
                                <div 
                                    key={podcast.id} 
                                    className={`bg-white rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-md cursor-pointer ${isPlaying ? 'border-red-500 ring-1 ring-red-500 shadow-sm' : 'border-gray-100'}`}
                                    onClick={() => setCurrentPodcast(podcast)}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${catStyle.bg}`}>
                                        <span className="text-2xl">{catStyle.icon}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${catStyle.bg} ${catStyle.text}`}>{podcast.category}</span>
                                            {podcast.duration && <span className="text-xs text-gray-500 font-medium">⏱ {podcast.duration}</span>}
                                        </div>
                                        <h3 className={`font-bold text-lg ${isPlaying ? 'text-red-600' : 'text-gray-900'}`}>{podcast.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{podcast.description}</p>
                                    </div>
                                    <div className="shrink-0">
                                        <button className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'}`}>
                                            {isPlaying ? '▶️' : '🎧'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredPodcasts.length === 0 && (
                           <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                               <p className="text-gray-400 font-medium">No se encontraron podcasts en esta categoría aún.</p>
                           </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lado Derecho: Reproductor de Audio (Sticky) */}
            {currentPodcast && (
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="sticky top-24 bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reproduciendo</span>
                            <button onClick={() => setCurrentPodcast(null)} className="text-gray-400 hover:text-gray-900">✖</button>
                        </div>
                        
                        <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl mb-6 flex flex-col items-center justify-center border-2 border-white shadow-inner relative overflow-hidden">
                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
                             <span className="text-7xl mb-2 z-10">{CATEGORIES.find(c => c.id === currentPodcast.category)?.icon || '🎧'}</span>
                             <div className="w-16 h-1 mt-4 bg-red-200 rounded-full overflow-hidden z-10">
                                 <div className="w-full h-full bg-red-500 animate-pulse"></div>
                             </div>
                        </div>

                        <h4 className="font-outfit font-bold text-xl text-center mb-1 text-gray-900">{currentPodcast.title}</h4>
                        <p className="text-sm text-gray-500 text-center mb-6">{currentPodcast.description}</p>

                        {/* Reproductor Nativo de HTML5 Modificado */}
                        <audio 
                            controls 
                            autoPlay 
                            src={currentPodcast.audioUrl} 
                            className="w-full h-10 [&::-webkit-media-controls-enclosure]:bg-gray-100 [&::-webkit-media-controls-enclosure]:rounded-full"
                        >
                            Tu navegador no soporta el formato de audio.
                        </audio>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PodcastInterface;
