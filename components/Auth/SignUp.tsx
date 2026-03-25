import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const LANGUAGES = [
    { code: 'en', name: 'Inglés', label: 'English 🇺🇸' },
    { code: 'es', name: 'Español', label: 'Español 🇪🇸' },
    { code: 'pt', name: 'Portugués', label: 'Português 🇧🇷' },
    { code: 'fr', name: 'Francés', label: 'Français 🇫🇷' },
    { code: 'de', name: 'Alemán', label: 'Deutsch 🇩🇪' },
    { code: 'it', name: 'Italiano', label: 'Italiano 🇮🇹' }
];

const TRANSLATIONS: Record<string, any> = {
    'Español': {
        title: 'Crear Cuenta',
        haveAccount: '¿Ya tienes cuenta?',
        loginLink: 'Inicia sesión',
        emailPlaceholder: 'Correo electrónico',
        passwordPlaceholder: 'Contraseña',
        nativeLangLabel: 'Idioma Nativo',
        submitButton: 'Registrarse',
        loadingButton: 'Creando cuenta...',
        success: 'Registro exitoso. ¡Bienvenido!'
    },
    'Inglés': {
        title: 'Create Account',
        haveAccount: 'Already have an account?',
        loginLink: 'Log in',
        emailPlaceholder: 'Email address',
        passwordPlaceholder: 'Password',
        nativeLangLabel: 'Native Language',
        submitButton: 'Sign Up',
        loadingButton: 'Creating account...',
        success: 'Registration successful. Welcome!'
    },
    'Portugués': {
        title: 'Criar Conta',
        haveAccount: 'Já tem uma conta?',
        loginLink: 'Entrar',
        emailPlaceholder: 'E-mail',
        passwordPlaceholder: 'Senha',
        nativeLangLabel: 'Idioma Nativo',
        submitButton: 'Registrar-se',
        loadingButton: 'Criando conta...',
        success: 'Registro realizado com sucesso. Bem-vindo!'
    },
    'Francés': {
        title: 'Créer un compte',
        haveAccount: 'Vous avez déjà un compte ?',
        loginLink: 'Se connecter',
        emailPlaceholder: 'Adresse e-mail',
        passwordPlaceholder: 'Mot de passe',
        nativeLangLabel: 'Langue maternelle',
        submitButton: 'S\'inscrire',
        loadingButton: 'Création du compte...',
        success: 'Inscription réussie. Bienvenue !'
    },
    'Alemán': { // Fallback to English/Spanish hybrid or just English ideally, but keeping pattern
        title: 'Konto erstellen',
        haveAccount: 'Haben Sie bereits ein Konto?',
        loginLink: 'Anmelden',
        emailPlaceholder: 'E-Mail-Adresse',
        passwordPlaceholder: 'Passwort',
        nativeLangLabel: 'Muttersprache',
        submitButton: 'Registrieren',
        loadingButton: 'Konto wird erstellt...',
        success: 'Registrierung erfolgreich. Willkommen!'
    },
    'Italiano': {
        title: 'Crea Account',
        haveAccount: 'Hai già un account?',
        loginLink: 'Accedi',
        emailPlaceholder: 'Indirizzo email',
        passwordPlaceholder: 'Password',
        nativeLangLabel: 'Lingua Madre',
        submitButton: 'Iscriviti',
        loadingButton: 'Creazione account...',
        success: 'Registrazione avvenuta con successo. Benvenuto!'
    }
};

const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nativeLanguage, setNativeLanguage] = useState('Inglés'); // Default fallback
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
        }
    }, [location.state]);

    useEffect(() => {
        const detectLanguage = () => {
            const browserLang = navigator.language.split('-')[0].toLowerCase();
            const map: Record<string, string> = {
                es: 'Español',
                pt: 'Portugués',
                fr: 'Francés',
                it: 'Italiano',
                de: 'Alemán',
                en: 'Inglés'
            };
            if (map[browserLang]) {
                setNativeLanguage(map[browserLang]);
            }
        };
        detectLanguage();
    }, []);

    const t = TRANSLATIONS[nativeLanguage] || TRANSLATIONS['Inglés'];

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        native_language: nativeLanguage
                    }
                }
            });
            if (error) throw error;
            alert(t.success);
            navigate('/');
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
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t.title}</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t.haveAccount} <Link to="/login" className="font-medium text-red-600 hover:text-red-500">{t.loginLink}</Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="language-select" className="sr-only">{t.nativeLangLabel}</label>
                            <select
                                id="language-select"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm bg-white"
                                value={nativeLanguage}
                                onChange={(e) => setNativeLanguage(e.target.value)}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.name}>
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">{t.emailPlaceholder}</label>
                            <input
                                id="email-address"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                placeholder={t.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">{t.passwordPlaceholder}</label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                placeholder={t.passwordPlaceholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 transition-all"
                        >
                            {loading ? t.loadingButton : t.submitButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
