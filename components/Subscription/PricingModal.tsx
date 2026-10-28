import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPlan?: 'monthly' | 'annual';
}

type Region = 'BR' | 'GLOBAL';
type BillingCycle = 'monthly' | 'annual';

const PRICING_CONFIG = {
    BR: {
        currencySymbol: 'R$',
        currencyCode: 'BRL',
        monthly: {
            display: 'R$ 75,90',
            period: '/ mês',
            equivalent: '',
            priceId: 'price_1UQqTBAJMdprx7K92g1Rhk5H',
            ctaText: 'Assinar Plano Mensal',
            badge: null
        },
        annual: {
            display: 'R$ 599,00',
            period: '/ ano',
            equivalent: 'Apenas R$ 49,92 / mês (em até 12x)',
            priceId: 'price_1UQqWtAJMdprx7K9y2aYI0JF',
            ctaText: 'Garantir Acesso Anual (Economize 35%)',
            badge: '🔥 MELHOR VALOR • ECONOMIZE 35%'
        }
    },
    GLOBAL: {
        currencySymbol: '$',
        currencyCode: 'USD',
        monthly: {
            display: '$18.99',
            period: '/ month',
            equivalent: '',
            priceId: 'price_1UQpezAJMdprx7K9ahv8B6em',
            ctaText: 'Start Monthly Plan',
            badge: null
        },
        annual: {
            display: '$149.00',
            period: '/ year',
            equivalent: 'Only $12.41 / month (Save $78.88/yr)',
            priceId: 'price_1UQps4AJMdprx7K9DmXFEVXU',
            ctaText: 'Get Annual Access (Save 35%)',
            badge: '🔥 BEST VALUE • SAVE 35%'
        }
    }
};

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, initialPlan = 'annual' }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialPlan);
    const [region, setRegion] = useState<Region>('GLOBAL');

    // Detección automática de ubicación (Brasil vs Global)
    useEffect(() => {
        try {
            const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
            const brTimezones = [
                'sao_paulo', 'fortaleza', 'manaus', 'belem', 'cuiaba',
                'recife', 'bahia', 'maceio', 'porto_velho', 'boa_vista',
                'campo_grande', 'rio_branco', 'araguaina', 'santarem', 'noronha'
            ];
            const isBrTimezone = brTimezones.some(t => tz.includes(t));
            const lang = (navigator.language || '').toLowerCase();
            const isPt = lang.includes('pt-br') || lang === 'pt';

            if (isBrTimezone || isPt) {
                setRegion('BR');
            } else {
                setRegion('GLOBAL');
            }
        } catch (e) {
            setRegion('GLOBAL');
        }
    }, []);

    if (!isOpen) return null;

    const currentPricing = PRICING_CONFIG[region][billingCycle];
    const isBR = region === 'BR';

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id,
                    email: user?.email,
                    priceId: currentPricing.priceId,
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Error creating checkout session:', data.message);
                alert(isBR ? 'Erro ao iniciar o pagamento. Tente novamente.' : 'Error initiating checkout. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert(isBR ? 'Erro de conexão.' : 'Connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative my-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Botón Cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all z-20"
                    aria-label="Cerrar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Premium con degradado */}
                <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-6 sm:p-8 text-center text-white relative">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/20">
                        <span>💎</span> {isBR ? 'Plano Profe Jemi Premium' : 'Profe Jemi Premium Plan'}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-outfit font-black mb-2">
                        {isBR ? 'Fluência Real em Espanhol' : 'Real Spanish Fluency'}
                    </h2>
                    <p className="text-sm opacity-95 max-w-sm mx-auto">
                        {isBR
                            ? 'Acesso completo à IA, Intérprete em tempo real, 30h de Live e todos os sotaques.'
                            : 'Unlimited AI access, Live Interpreter, 30h Live Voice, Vision AI and all accents.'}
                    </p>

                    {/* Selector de Región (Brasil vs Global) */}
                    <div className="mt-4 inline-flex p-1 bg-black/20 rounded-xl backdrop-blur-sm text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setRegion('BR')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                isBR ? 'bg-white text-red-600 shadow-sm' : 'text-white/80 hover:text-white'
                            }`}
                        >
                            <span>🇧🇷</span> Brasil (R$)
                        </button>
                        <button
                            type="button"
                            onClick={() => setRegion('GLOBAL')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                !isBR ? 'bg-white text-red-600 shadow-sm' : 'text-white/80 hover:text-white'
                            }`}
                        >
                            <span>🌐</span> Global (USD)
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {/* Selector Mensual / Anual */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6 relative">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('annual')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                                billingCycle === 'annual'
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span>{isBR ? 'Anual' : 'Annual'}</span>
                            <span className="ml-1.5 bg-green-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                -35%
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                billingCycle === 'monthly'
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {isBR ? 'Mensal' : 'Monthly'}
                        </button>
                    </div>

                    {/* Precio destacado */}
                    <div className="text-center mb-6">
                        {currentPricing.badge && (
                            <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-black px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                                {currentPricing.badge}
                            </span>
                        )}
                        <div className="flex justify-center items-baseline gap-1">
                            <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                                {currentPricing.display}
                            </span>
                            <span className="text-gray-500 text-sm font-semibold">{currentPricing.period}</span>
                        </div>
                        {currentPricing.equivalent && (
                            <p className="text-xs sm:text-sm text-green-600 font-bold mt-1">
                                {currentPricing.equivalent}
                            </p>
                        )}
                    </div>

                    {/* Lista comparativa de Beneficios */}
                    <div className="space-y-3 mb-6 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                        <div className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-600 font-bold p-1 rounded-lg text-xs mt-0.5">🗣️</span>
                            <div className="text-xs sm:text-sm">
                                <strong className="text-gray-900 font-bold">
                                    {isBR ? 'Intérprete em Tempo Real Ilimitado' : 'Unlimited Live Interpreter'}
                                </strong>
                                <p className="text-gray-500 text-[11px]">
                                    {isBR ? 'Traduza conversas com gírias e sotaques locais (grátis: 7 frases)' : 'Real-time conversation with local idioms (free: 7 phrases)'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-600 font-bold p-1 rounded-lg text-xs mt-0.5">🎙️</span>
                            <div className="text-xs sm:text-sm">
                                <strong className="text-gray-900 font-bold">
                                    {isBR ? '30 Horas de Live por Mês' : '30 Hours Live Voice / Month'}
                                </strong>
                                <p className="text-gray-500 text-[11px]">
                                    {isBR ? '(O plano gratuito tem apenas 15 min)' : '(Free plan is limited to 15 min)'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-600 font-bold p-1 rounded-lg text-xs mt-0.5">📸</span>
                            <div className="text-xs sm:text-sm">
                                <strong className="text-gray-900 font-bold">
                                    {isBR ? 'Visão IA Ilimitada' : 'Unlimited Vision AI'}
                                </strong>
                                <p className="text-gray-500 text-[11px]">
                                    {isBR ? 'Envie quantas fotos quiser para aprender vocabulário' : 'Analyze any photo to learn contextual vocabulary'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-600 font-bold p-1 rounded-lg text-xs mt-0.5">🌎</span>
                            <div className="text-xs sm:text-sm">
                                <strong className="text-gray-900 font-bold">
                                    {isBR ? 'Todos os Sotaques Disponíveis' : 'All Regional Accents Unlocked'}
                                </strong>
                                <p className="text-gray-500 text-[11px]">
                                    Rioplatense, Mexicano, Ibérico, Colombiano, Chileno
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-600 font-bold p-1 rounded-lg text-xs mt-0.5">📚</span>
                            <div className="text-xs sm:text-sm">
                                <strong className="text-gray-900 font-bold">
                                    {isBR ? 'Todos os Cursos + EFE Especializados' : 'All Courses + Specialized EFE'}
                                </strong>
                                <p className="text-gray-500 text-[11px]">
                                    Medicina, Negócios, Turismo e Direito
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-600 font-bold p-1 rounded-lg text-xs mt-0.5">🎧</span>
                            <div className="text-xs sm:text-sm">
                                <strong className="text-gray-900 font-bold">
                                    {isBR ? 'Tutor IA 24/7 & Podcasts Completos' : '24/7 AI Tutor & Full Podcasts'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Botón CTA */}
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-black py-4 px-6 rounded-2xl hover:from-red-700 hover:to-red-600 transition-all shadow-xl shadow-red-500/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm sm:text-base"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <span>{currentPricing.ctaText}</span>
                                <span>🚀</span>
                            </>
                        )}
                    </button>

                    <div className="mt-4 text-center space-y-1">
                        <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                            <span>🔒</span> {isBR ? 'Pagamento 100% seguro via Stripe • Cancele quando quiser' : '100% secure payment via Stripe • Cancel anytime'}
                        </p>
                        {isBR && billingCycle === 'annual' && (
                            <p className="text-[11px] text-gray-500 font-medium">
                                Opção de parcelamento disponível no checkout do cartão.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
