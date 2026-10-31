import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
        );
    }

    // El componente AdminDashboard se encarga de mostrar la vista de validación/PIN o el panel completo
    return <>{children}</>;
};

export default AdminRoute;
