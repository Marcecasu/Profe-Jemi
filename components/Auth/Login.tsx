import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            // First check if email exists in our profiles
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (profileError) {
                throw new Error('Ha ocurrido un error al verificar tu cuenta.');
            }

            if (!userProfile) {
                // Email not found, redirect to signup
                navigate('/signup', { state: { message: 'Este correo no está registrado. Por favor, crea una cuenta para continuar.' } });
                return;
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setMessage('Se ha enviado un correo con las instrucciones. Si no lo ves, revisa tu carpeta de spam.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isForgotPassword ? (
                            <>
                                ¿Recordaste tu contraseña? <button onClick={() => { setIsForgotPassword(false); setError(null); setMessage(null); }} className="font-medium text-red-600 hover:text-red-500">Inicia sesión aquí</button>
                            </>
                        ) : (
                            <>
                                ¿No tienes cuenta? <Link to="/signup" className="font-medium text-red-600 hover:text-red-500">Regístrate gratis</Link>
                            </>
                        )}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={isForgotPassword ? handleResetPassword : handleLogin}>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
                    {message && <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{message}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isForgotPassword ? 'rounded-md' : 'rounded-t-md'} focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm`}
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {!isForgotPassword && (
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {!isForgotPassword && (
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <button type="button" onClick={() => { setIsForgotPassword(true); setError(null); setMessage(null); }} className="font-medium text-red-600 hover:text-red-500">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            {loading ? 'Cargando...' : (isForgotPassword ? 'Enviar enlace de recuperación' : 'Entrar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
