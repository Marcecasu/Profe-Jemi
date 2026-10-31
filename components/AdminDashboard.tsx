import React, { useEffect, useState, useMemo } from 'react';
import {
    getAllUsers,
    updateUserRole,
    deleteUserProfile,
    updateUserSubscriptionStatus,
    resetUserUsage,
    updateUserUsageDetails
} from '../services/supabase';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';

interface AdminDashboardProps {
    onBackToApp?: () => void;
}

const COLORS = {
    premium: '#10B981', // Emerald green
    freemium: '#F59E0B', // Amber
    past_due: '#F97316', // Orange
    canceled: '#EF4444', // Red
    other: '#9CA3AF'
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
    const { user: authUser, profile, isAdmin, refreshProfile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [showSqlHelp, setShowSqlHelp] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

    // Modal para editar cuotas manualmente
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [editForm, setEditForm] = useState({
        subscription_status: 'free' as 'free' | 'trial' | 'active' | 'past_due' | 'canceled',
        live_minutes_used: 0,
        vision_count_used: 0,
        translations_count_used: 0
    });

    // Desbloqueo con PIN de fundador en caso de que no tenga rol admin
    const [founderPin, setFounderPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [pinSuccess, setPinSuccess] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    // Métricas calculadas
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.subscription_status === 'active').length;
        const trials = users.filter(u => u.subscription_status === 'trial' || u.subscription_status === 'free').length;
        const pastDue = users.filter(u => u.subscription_status === 'past_due').length;
        const canceled = users.filter(u => u.subscription_status === 'canceled').length;
        const admins = users.filter(u => u.role === 'admin').length;

        const totalLiveMinutes = users.reduce((acc, u) => acc + (u.live_minutes_used || 0), 0);
        const totalVisionScans = users.reduce((acc, u) => acc + (u.vision_count_used || 0), 0);
        const totalTranslations = users.reduce((acc, u) => acc + (u.translations_count_used || 0), 0);

        const conversionRate = total > 0 ? ((active / total) * 100).toFixed(1) : '0';

        return {
            total,
            active,
            trials,
            pastDue,
            canceled,
            admins,
            totalLiveMinutes,
            totalVisionScans,
            totalTranslations,
            conversionRate
        };
    }, [users]);

    // Datos para gráficos de Recharts
    const subscriptionChartData = useMemo(() => [
        { name: 'Premium (Activos)', value: stats.active, color: COLORS.premium },
        { name: 'Freemium / Trial', value: stats.trials, color: COLORS.freemium },
        { name: 'Past Due', value: stats.pastDue, color: COLORS.past_due },
        { name: 'Cancelados', value: stats.canceled, color: COLORS.canceled },
    ].filter(d => d.value > 0), [stats]);

    const usageChartData = useMemo(() => [
        { service: 'Live Voz (min)', total: stats.totalLiveMinutes, color: '#DC2626' },
        { service: 'Vision IA (fotos)', total: stats.totalVisionScans, color: '#3B82F6' },
        { service: 'Intérprete (usos)', total: stats.totalTranslations, color: '#8B5CF6' }
    ], [stats]);

    // Filtrado de usuarios
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch =
                (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                filterStatus === 'all' ? true :
                filterStatus === 'active' ? u.subscription_status === 'active' :
                filterStatus === 'free' ? (u.subscription_status === 'free' || u.subscription_status === 'trial') :
                filterStatus === 'past_due' ? u.subscription_status === 'past_due' :
                filterStatus === 'canceled' ? u.subscription_status === 'canceled' : true;

            const matchesRole =
                filterRole === 'all' ? true :
                filterRole === 'admin' ? u.role === 'admin' :
                filterRole === 'user' ? u.role === 'user' : true;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [users, searchQuery, filterStatus, filterRole]);

    // Acciones de usuario
    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        setActionLoading(userId);
        const success = await updateUserRole(userId, newRole);
        if (success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
            alert('No se pudo cambiar el rol. Verifica las políticas RLS en Supabase.');
        }
        setActionLoading(null);
    };

    const handleTogglePremium = async (userId: string, currentStatus: string) => {
        setActionLoading(userId);
        const newStatus = currentStatus === 'active' ? 'free' : 'active';
        const success = await updateUserSubscriptionStatus(userId, newStatus);
        if (success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_status: newStatus } : u));
        } else {
            alert('No se pudo actualizar el estado de suscripción. Verifica las políticas RLS en Supabase.');
        }
        setActionLoading(null);
    };

    const handleResetUsage = async (userId: string, email: string) => {
        if (!confirm(`¿Reiniciar las cuotas de IA (Live, Vision e Intérprete) a 0 para ${email}?`)) return;
        setActionLoading(userId);
        const success = await resetUserUsage(userId);
        if (success) {
            setUsers(prev => prev.map(u => u.id === userId ? {
                ...u,
                live_minutes_used: 0,
                vision_count_used: 0,
                translations_count_used: 0
            } : u));
        } else {
            alert('No se pudo reiniciar la cuota.');
        }
        setActionLoading(null);
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`¿Eliminar definitivamente el perfil de ${email}? Esta acción no se puede deshacer.`)) return;
        setActionLoading(userId);
        const success = await deleteUserProfile(userId);
        if (success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
            alert('No se pudo eliminar el usuario.');
        }
        setActionLoading(null);
    };

    const openEditModal = (user: UserProfile) => {
        setEditingUser(user);
        setEditForm({
            subscription_status: user.subscription_status,
            live_minutes_used: user.live_minutes_used || 0,
            vision_count_used: user.vision_count_used || 0,
            translations_count_used: user.translations_count_used || 0
        });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setActionLoading(editingUser.id);
        const success = await updateUserUsageDetails(editingUser.id, editForm);
        if (success) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? {
                ...u,
                ...editForm
            } : u));
            setEditingUser(null);
        } else {
            alert('No se pudieron guardar los cambios.');
        }
        setActionLoading(null);
    };

    // Exportar usuarios a archivo CSV
    const exportToCSV = () => {
        if (users.length === 0) return;
        const headers = ['ID', 'Email', 'Rol', 'Suscripción', 'Minutos Live Usados', 'Vision Fotos Usadas', 'Traducciones Usadas', 'Fecha Registro', 'Stripe Customer ID'];
        const rows = users.map(u => [
            u.id,
            u.email,
            u.role,
            u.subscription_status,
            u.live_minutes_used || 0,
            u.vision_count_used || 0,
            u.translations_count_used || 0,
            u.created_at || '',
            u.stripe_customer_id || ''
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `profe_jemi_usuarios_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(label);
        setTimeout(() => setCopiedSnippet(null), 2500);
    };

    // Desbloqueo rápido si el usuario no es admin
    const handleUnlockWithPin = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinError('');
        const validPins = ['jemi2026', 'profejemiadmin', 'jemiadmin'];
        if (!validPins.includes(founderPin.trim().toLowerCase())) {
            setPinError('PIN de fundador incorrecto. Usa el comando SQL en Supabase o verifica tu PIN.');
            return;
        }

        if (authUser) {
            setActionLoading('unlock');
            const success = await updateUserRole(authUser.id, 'admin');
            if (success) {
                setPinSuccess(true);
                await refreshProfile();
                setTimeout(() => {
                    fetchUsers();
                }, 1000);
            } else {
                setPinError('Error de permisos al actualizar en Supabase. Corre el comando SQL en Supabase Editor.');
            }
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // Pantalla de Acceso Restringido para no-admins
    if (!isAdmin) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center p-8 sm:p-10">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                        🛡️
                    </div>

                    <span className="bg-red-50 text-red-600 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-red-200">
                        Acceso Restringido
                    </span>

                    <h2 className="text-3xl font-outfit font-black text-gray-900 mt-4 mb-2">
                        Panel de Administración Profe Jemi
                    </h2>

                    <p className="text-gray-600 max-w-lg mx-auto text-sm leading-relaxed mb-6">
                        Esta sección está reservada exclusivamente para el administrador de la plataforma.
                        Tu cuenta actual es <strong className="text-gray-900">{authUser?.email || 'No iniciada'}</strong>{' '}
                        (Rol actual: <span className="text-amber-600 font-bold">{profile?.role || 'user'}</span>).
                    </p>

                    {/* Desbloqueo con PIN de Fundador */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                        <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <span>🔑</span> Desbloqueo Rápido de Fundador
                        </h4>
                        <p className="text-xs text-gray-500 mb-4">
                            Si eres el creador, ingresa el PIN de acceso para activar tu rol de Administrador al instante.
                        </p>

                        <form onSubmit={handleUnlockWithPin} className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    placeholder="Ingresa PIN de fundador"
                                    value={founderPin}
                                    onChange={(e) => setFounderPin(e.target.value)}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'unlock'}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {actionLoading === 'unlock' ? 'Verificando...' : 'Activar 🛡️'}
                                </button>
                            </div>
                            {pinError && <p className="text-xs text-red-600 font-semibold">{pinError}</p>}
                            {pinSuccess && <p className="text-xs text-emerald-600 font-bold">¡Rol de Admin activado! Cargando panel...</p>}
                        </form>
                    </div>

                    {/* Método alternativo vía SQL */}
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 text-left max-w-xl mx-auto mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                <span>⚡</span> Activar desde Supabase SQL Editor
                            </h4>
                            <button
                                onClick={() => copyToClipboard(`UPDATE public.profiles SET role = 'admin' WHERE email = '${authUser?.email || 'tu_email@ejemplo.com'}';`, 'sql')}
                                className="text-xs font-bold bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-2.5 py-1 rounded-lg transition-colors"
                            >
                                {copiedSnippet === 'sql' ? '¡Copiado! ✓' : 'Copiar comando SQL'}
                            </button>
                        </div>
                        <p className="text-xs text-amber-800 mb-3">
                            Entra a tu panel de Supabase ➔ <strong>SQL Editor</strong> y ejecuta:
                        </p>
                        <pre className="bg-amber-900/90 text-amber-100 p-3 rounded-xl text-xs overflow-x-auto font-mono">
                            {`UPDATE public.profiles SET role = 'admin' WHERE email = '${authUser?.email || 'tu_email@ejemplo.com'}';`}
                        </pre>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={async () => {
                                await refreshProfile();
                                alert('Permisos recargados. Si acabas de correr el comando SQL, ya deberías tener acceso.');
                            }}
                            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <span>🔄</span> Reintentar Verificación
                        </button>
                        {onBackToApp && (
                            <button
                                onClick={onBackToApp}
                                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                🏠 Volver al Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                <p className="text-sm font-bold text-gray-500">Cargando métricas y usuarios de Profe Jemi...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-in fade-in duration-200">
            {/* Header del Admin */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl">🛡️</span>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-black text-gray-900">
                            Panel de Administración
                        </h2>
                        <span className="bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-200">
                            Live Master
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Métricas de SaaS, consumos de IA por usuario y gestión de suscripciones Stripe.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={fetchUsers}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                        title="Recargar datos de Supabase"
                    >
                        <span>🔄</span> Actualizar
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-emerald-200"
                        title="Descargar lista de usuarios en Excel/CSV"
                    >
                        <span>📥</span> Exportar CSV
                    </button>
                    {onBackToApp && (
                        <button
                            onClick={onBackToApp}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <span>🏠</span> Volver a la App
                        </button>
                    )}
                </div>
            </div>

            {/* Tarjetas de Métricas Principales (KPIs) */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {/* 1. Total Usuarios */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Usuarios</p>
                            <span className="text-lg">👥</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 mt-2">
                        {stats.admins} Administradores
                    </p>
                </div>

                {/* 2. Premium Activos */}
                <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Premium Activos</p>
                            <span className="text-lg">💎</span>
                        </div>
                        <p className="text-3xl font-black text-emerald-600 mt-2">{stats.active}</p>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-700 mt-2">
                        Conv: {stats.conversionRate}%
                    </p>
                </div>

                {/* 3. Freemium / Trials */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Freemium</p>
                            <span className="text-lg">🆓</span>
                        </div>
                        <p className="text-3xl font-black text-amber-500 mt-2">{stats.trials}</p>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 mt-2">
                        {stats.pastDue > 0 ? `${stats.pastDue} pagos pendientes` : 'Con cuotas gratis'}
                    </p>
                </div>

                {/* 4. Minutos Live IA */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live Minutos</p>
                            <span className="text-lg">🎙️</span>
                        </div>
                        <p className="text-3xl font-black text-red-600 mt-2">{stats.totalLiveMinutes}m</p>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 mt-2">
                        ≈ {(stats.totalLiveMinutes / 60).toFixed(1)} horas de voz
                    </p>
                </div>

                {/* 5. Vision IA Usados */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vision IA</p>
                            <span className="text-lg">📸</span>
                        </div>
                        <p className="text-3xl font-black text-blue-600 mt-2">{stats.totalVisionScans}</p>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 mt-2">
                        Fotos analizadas
                    </p>
                </div>

                {/* 6. Traducciones Intérprete */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Intérprete</p>
                            <span className="text-lg">🗣️</span>
                        </div>
                        <p className="text-3xl font-black text-purple-600 mt-2">{stats.totalTranslations}</p>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 mt-2">
                        Traducciones en vivo
                    </p>
                </div>
            </div>

            {/* Gráficos Visuales Interactivos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 1: Planes */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-outfit font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
                        <span>📊</span> Distribución de Suscripciones
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Proporción de usuarios activos vs gratuitos</p>
                    <div className="h-64 w-full">
                        {subscriptionChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={subscriptionChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={45}
                                        paddingAngle={5}
                                        label={({ name, percent }: any) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {subscriptionChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                Sin datos de planes disponibles.
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico 2: Consumo de IA */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-outfit font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
                        <span>⚡</span> Consumo Acumulado de Herramientas IA
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Total de uso en vivo de todos los alumnos</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                                    {usageChartData.map((entry, index) => (
                                        <Cell key={`bar-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tabla de Usuarios y Controles de Gestión */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header de la tabla con Buscador y Filtros */}
                <div className="p-6 border-b border-gray-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-outfit font-bold text-xl text-gray-900">
                                Gestión de Usuarios ({filteredUsers.length})
                            </h3>
                            <p className="text-xs text-gray-400">
                                Administra roles, membresías y cuotas de consumo en tiempo real
                            </p>
                        </div>

                        {/* Buscador */}
                        <div className="relative w-full sm:w-72">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar por email o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Filtros por badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="font-bold text-gray-400 mr-1">Filtrar:</span>
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${filterStatus === 'all' ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Todos ({users.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                            💎 Premium ({stats.active})
                        </button>
                        <button
                            onClick={() => setFilterStatus('free')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${filterStatus === 'free' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                        >
                            🆓 Freemium ({stats.trials})
                        </button>
                        <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>
                        <button
                            onClick={() => setFilterRole(filterRole === 'admin' ? 'all' : 'admin')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${filterRole === 'admin' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                        >
                            🛡️ Solo Admins ({stats.admins})
                        </button>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-semibold border-b border-gray-100">
                                <th className="px-6 py-3.5">Usuario</th>
                                <th className="px-6 py-3.5">Rol</th>
                                <th className="px-6 py-3.5">Suscripción</th>
                                <th className="px-6 py-3.5">Consumo IA Usado</th>
                                <th className="px-6 py-3.5">Registro</th>
                                <th className="px-6 py-3.5 text-right">Acciones Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredUsers.map(user => {
                                const isPremiumUser = user.subscription_status === 'active';
                                const liveMins = user.live_minutes_used || 0;
                                const visionCount = user.vision_count_used || 0;
                                const translationCount = user.translations_count_used || 0;

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                        {/* Usuario */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                                    {(user.email || 'U')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5" title={user.id}>
                                                        ID: {user.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Rol */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                user.role === 'admin'
                                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {user.role === 'admin' ? '🛡️ Admin' : '👤 Alumno'}
                                            </span>
                                        </td>

                                        {/* Suscripción */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                isPremiumUser
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    : (user.subscription_status === 'free' || user.subscription_status === 'trial')
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : user.subscription_status === 'past_due'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {isPremiumUser ? '💎 Premium' : (user.subscription_status === 'free' || user.subscription_status === 'trial') ? '🆓 Freemium' : user.subscription_status}
                                            </span>
                                        </td>

                                        {/* Consumo IA */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5 text-xs min-w-[160px]">
                                                {/* Live */}
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-gray-500">🎙️ Live:</span>
                                                    <span className={`font-bold ${liveMins >= 15 && !isPremiumUser ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {liveMins} {isPremiumUser ? 'm (unlimited)' : '/ 15m'}
                                                    </span>
                                                </div>
                                                {/* Vision */}
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-gray-500">📸 Vision:</span>
                                                    <span className={`font-bold ${visionCount >= 5 && !isPremiumUser ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {visionCount} {isPremiumUser ? '(unlimited)' : '/ 5'}
                                                    </span>
                                                </div>
                                                {/* Intérprete */}
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-gray-500">🗣️ Intérprete:</span>
                                                    <span className={`font-bold ${translationCount >= 7 && !isPremiumUser ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {translationCount} {isPremiumUser ? '(unlimited)' : '/ 7'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Fecha Registro */}
                                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(user.created_at)}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* Toggle Premium */}
                                                <button
                                                    onClick={() => handleTogglePremium(user.id, user.subscription_status)}
                                                    disabled={actionLoading === user.id}
                                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                                        isPremiumUser
                                                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    }`}
                                                    title={isPremiumUser ? 'Pasar a Freemium' : 'Dar Acceso Premium'}
                                                >
                                                    {isPremiumUser ? 'Quitar Premium' : '💎 Dar Premium'}
                                                </button>

                                                {/* Toggle Admin */}
                                                <button
                                                    onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                                    disabled={actionLoading === user.id}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                    title={user.role === 'admin' ? 'Quitar rol admin' : 'Nombrar admin'}
                                                >
                                                    {user.role === 'admin' ? '👤 Quitar Admin' : '🛡️ Admin'}
                                                </button>

                                                {/* Reset Cuotas */}
                                                <button
                                                    onClick={() => handleResetUsage(user.id, user.email)}
                                                    disabled={actionLoading === user.id}
                                                    className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-2 py-1.5 rounded-lg transition-colors border border-purple-200 disabled:opacity-50"
                                                    title="Reiniciar cuotas de minutos/vision/traducciones a 0"
                                                >
                                                    🔄
                                                </button>

                                                {/* Editar Cuotas */}
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    disabled={actionLoading === user.id}
                                                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2 py-1.5 rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
                                                    title="Editar valores manualmente"
                                                >
                                                    ✏️
                                                </button>

                                                {/* Eliminar */}
                                                <button
                                                    onClick={() => handleDelete(user.id, user.email)}
                                                    disabled={actionLoading === user.id}
                                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Eliminar usuario"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-400 text-sm">
                        No se encontraron usuarios con los filtros seleccionados.
                    </div>
                )}
            </div>

            {/* Accordion de Ayuda SQL para Supabase */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                    onClick={() => setShowSqlHelp(!showSqlHelp)}
                    className="w-full px-6 py-4 text-left font-outfit font-bold text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                    <span className="flex items-center gap-2">
                        <span>💡</span> Comandos SQL Útiles para Supabase (Hacer Admin, Reset Masivo, RLS)
                    </span>
                    <span className="text-gray-400 text-sm">{showSqlHelp ? '▲ Ocultar' : '▼ Ver'}</span>
                </button>

                {showSqlHelp && (
                    <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
                        {/* Snippet 1 */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-800">1. Nombrar a cualquier usuario como Administrador:</p>
                                <button
                                    onClick={() => copyToClipboard(`UPDATE public.profiles SET role = 'admin' WHERE email = 'EMAIL_DEL_USUARIO';`, 'sql_admin')}
                                    className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg"
                                >
                                    {copiedSnippet === 'sql_admin' ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </div>
                            <pre className="text-xs bg-gray-900 text-gray-100 p-2.5 rounded-xl font-mono overflow-x-auto">
                                {`UPDATE public.profiles SET role = 'admin' WHERE email = 'EMAIL_DEL_USUARIO';`}
                            </pre>
                        </div>

                        {/* Snippet 2 */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-800">2. Reiniciar cuotas de IA a TODOS los usuarios (primer día de mes):</p>
                                <button
                                    onClick={() => copyToClipboard(`UPDATE public.profiles SET live_minutes_used = 0, vision_count_used = 0, translations_count_used = 0, usage_reset_at = now() + interval '30 days';`, 'sql_reset')}
                                    className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg"
                                >
                                    {copiedSnippet === 'sql_reset' ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </div>
                            <pre className="text-xs bg-gray-900 text-gray-100 p-2.5 rounded-xl font-mono overflow-x-auto">
                                {`UPDATE public.profiles 
SET live_minutes_used = 0, vision_count_used = 0, translations_count_used = 0, usage_reset_at = now() + interval '30 days';`}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para Editar Cuotas y Suscripción */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between mb-4 border-b pb-3">
                            <div>
                                <h3 className="font-outfit font-bold text-lg text-gray-900">
                                    Editar Usuario
                                </h3>
                                <p className="text-xs text-gray-400">{editingUser.email}</p>
                            </div>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Estado de Membresía:
                                </label>
                                <select
                                    value={editForm.subscription_status}
                                    onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value as any })}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="free">🆓 Freemium (Free)</option>
                                    <option value="active">💎 Premium (Active)</option>
                                    <option value="trial">🎁 Trial</option>
                                    <option value="past_due">⚠️ Past Due</option>
                                    <option value="canceled">❌ Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Minutos Live Consumidos:
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.live_minutes_used}
                                    onChange={(e) => setEditForm({ ...editForm, live_minutes_used: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                                <span className="text-[10px] text-gray-400">En plan free el límite es 15 minutos</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Vision IA Usados:
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.vision_count_used}
                                    onChange={(e) => setEditForm({ ...editForm, vision_count_used: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                                <span className="text-[10px] text-gray-400">En plan free el límite es 5 imágenes</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Traducciones Intérprete Usadas:
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.translations_count_used}
                                    onChange={(e) => setEditForm({ ...editForm, translations_count_used: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                                <span className="text-[10px] text-gray-400">En plan free el límite es 7 traducciones</span>
                            </div>
                        </div>

                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={actionLoading === editingUser.id}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                            >
                                {actionLoading === editingUser.id ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
