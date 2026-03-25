import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
                    userId: user?.id,
                    userEmail: user?.email,
                }),
            });

            const data = await response.json();
            if (data.sessionId) {
                // Redirigir a Stripe Checkout
                const stripe = (window as any).Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
                await stripe.redirectToCheckout({ sessionId: data.sessionId });
            } else {
                console.error('Error creating session:', data.error);
                alert('Error al iniciar el pago. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="bg-red-500 p-8 text-center text-white">
                    <h2 className="text-3xl font-outfit font-bold mb-2">Profe Jemi Premium ✨</h2>
                    <p className="opacity-90">Desbloquea todo el potencial de tu aprendizaje.</p>
                </div>

                <div className="p-8">
                    <div className="flex justify-center items-end mb-8">
                        <span className="text-5xl font-bold text-gray-900">$12.97</span>
                        <span className="text-gray-500 mb-2 ml-1">/ mes</span>
                    </div>

                    <ul className="space-y-4 mb-8 text-gray-600">
                        <li className="flex items-center">
                            <span className="bg-green-100 text-green-600 p-1 rounded-full mr-3">✓</span>
                            <span><strong>Voz Ilimitada:</strong> Conversaciones en tiempo real.</span>
                        </li>
                        <li className="flex items-center">
                            <span className="bg-green-100 text-green-600 p-1 rounded-full mr-3">✓</span>
                            <span><strong>Visión IA:</strong> Aprende con fotos de tu entorno.</span>
                        </li>
                        <li className="flex items-center">
                            <span className="bg-green-100 text-green-600 p-1 rounded-full mr-3">✓</span>
                            <span><strong>Acentos Regionales:</strong> Mexicano, Ibérico, Rioplatense...</span>
                        </li>
                        <li className="flex items-center">
                            <span className="bg-green-100 text-green-600 p-1 rounded-full mr-3">✓</span>
                            <span><strong>Sin Límites:</strong> Práctica 24/7.</span>
                        </li>
                    </ul>

                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            'Suscribirme Ahora 🚀'
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        Cancela cuando quieras. Pago seguro vía Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
