import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUserProfile, updateUserSubscriptionStatus } from '../services/supabase';
import { UserProfile } from '../types';

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        setActionLoading(userId);
        const success = await updateUserRole(userId, newRole);
        if (success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
        setActionLoading(null);
    };

    const handleGrantAccess = async (userId: string) => {
        setActionLoading(userId);
        const success = await updateUserSubscriptionStatus(userId, 'active');
        if (success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_status: 'active' } : u));
        }
        setActionLoading(null);
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`¿Eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) return;
        setActionLoading(userId);
        const success = await deleteUserProfile(userId);
        if (success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
        setActionLoading(null);
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        trials: users.filter(u => u.subscription_status === 'trial').length,
        active: users.filter(u => u.subscription_status === 'active').length,
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const isTrialExpired = (trialEndsAt: string) => {
        return new Date(trialEndsAt) < new Date();
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-outfit font-bold text-gray-900">Panel de Administración 🛡️</h2>
                <p className="text-gray-500 mt-1">Gestiona usuarios y suscripciones</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Usuarios</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admins</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{stats.admins}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trial Activo</p>
                    <p className="text-3xl font-bold text-amber-500 mt-1">{stats.trials}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suscripción Activa</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-outfit font-bold text-lg text-gray-900">Usuarios Registrados</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suscripción</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trial Hasta</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">{user.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'admin'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.subscription_status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : user.subscription_status === 'trial'
                                                ? 'bg-amber-100 text-amber-700'
                                                : user.subscription_status === 'past_due'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {user.subscription_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm ${isTrialExpired(user.trial_ends_at) ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                                            {formatDate(user.trial_ends_at)}
                                            {isTrialExpired(user.trial_ends_at) && ' ⚠️'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                                disabled={actionLoading === user.id}
                                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === user.id ? '...' : user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                            </button>
                                            {user.subscription_status !== 'active' && (
                                                <button
                                                    onClick={() => handleGrantAccess(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Dar Acceso Premium
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(user.id, user.email)}
                                                disabled={actionLoading === user.id}
                                                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-400">
                        No hay usuarios registrados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
