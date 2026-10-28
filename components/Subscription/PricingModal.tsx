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

            const textResponse = await response.text();
            let data: any = null;
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                console.error('Non-JSON response from /api/checkout:', textResponse);
            }

            if (response.ok && data?.url) {
                window.location.href = data.url;
            } else if (data?.code === 'MISSING_STRIPE_KEY') {
                alert(isBR 
                    ? 'Atenção: Falta configurar a variável STRIPE_SECRET_KEY na Vercel (Project Settings > Environment Variables).' 
                    : 'Attention: STRIPE_SECRET_KEY is missing in Vercel (Project Settings > Environment Variables).');
            } else if (data?.message) {
                alert((isBR ? 'Erro no pagamento: ' : 'Payment error: ') + data.message);
            } else {
                alert(isBR 
                    ? 'Não foi possível iniciar o checkout. Verifique se a variável STRIPE_SECRET_KEY está configurada na Vercel.' 
                    : 'Could not initiate checkout. Please verify STRIPE_SECRET_KEY in Vercel.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert(isBR ? 'Erro de conexão com o servidor de pagamento.' : 'Connection error with payment server.');
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

                <div className="p-6 sm:p-8 space-y-6">
                    {/* Selector Ciclo de Facturación (Anual vs Mensual) */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('annual')}
                            className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                billingCycle === 'annual'
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <span>{isBR ? 'Anual' : 'Annual'}</span>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                -35%
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all ${
                                billingCycle === 'monthly'
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {isBR ? 'Mensal' : 'Monthly'}
                        </button>
                    </div>

                    {/* Tarjeta de Precio Seleccionado */}
                    <div className="border-2 border-red-500/20 bg-gradient-to-b from-red-50/50 to-white rounded-2xl p-5 relative">
                        {currentPricing.badge && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                                {currentPricing.badge}
                            </span>
                        )}

                        <div className="text-center pt-1">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-outfit font-black text-gray-900 tracking-tight">
                                    {currentPricing.display}
                                </span>
                                <span className="text-gray-500 font-semibold text-sm">
                                    {currentPricing.period}
                                </span>
                            </div>

                            {currentPricing.equivalent && (
                                <p className="text-xs font-bold text-emerald-600 mt-1">
                                    {currentPricing.equivalent}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Beneficios Exclusivos Premium */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {isBR ? 'Tudo o que está incluído no Premium:' : 'Everything included with Premium:'}
                        </p>
                        <ul className="space-y-2.5 text-sm text-gray-700">
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                    ✓
                                </div>
                                <span>
                                    <strong>{isBR ? '30 Horas/mês de Conversação Live' : '30 Hours/mo of Live Voice'}</strong>{' '}
                                    <span className="text-gray-500 text-xs">({isBR ? 'vs 15 min no free' : 'vs 15 min in free'})</span>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                    ✓
                                </div>
                                <span>
                                    <strong>{isBR ? '🗣️ Intérprete em Tempo Real Ilimitado' : '🗣️ Unlimited Live Interpreter'}</strong>{' '}
                                    <span className="text-gray-500 text-xs">({isBR ? 'vs 7 traduções/mês no free' : 'vs 7 uses/mo in free'})</span>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                    ✓
                                </div>
                                <span>
                                    <strong>{isBR ? 'Vision IA Ilimitado' : 'Unlimited Vision AI'}</strong>{' '}
                                    <span className="text-gray-500 text-xs">({isBR ? 'vs 5 análises no free' : 'vs 5 uses in free'})</span>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                    ✓
                                </div>
                                <span>
                                    <strong>{isBR ? 'Todos os Sotaques Disponíveis' : 'All Regional Accents Available'}</strong>{' '}
                                    <span className="text-gray-500 text-xs">({isBR ? 'Rioplatense, Mexicano, Ibérico, Colombiano, Chileno, Paraguaio' : 'Rioplatense, Mexican, Iberian, Colombian, Chilean, Paraguayan'})</span>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                    ✓
                                </div>
                                <span>
                                    <strong>{isBR ? 'Todos os Cursos + EFE Especializados' : 'All Courses + Specialized ESP'}</strong>{' '}
                                    <span className="text-gray-500 text-xs">({isBR ? 'Medicina, Negócios, Turismo e Direito' : 'Medical, Business, Tourism & Legal'})</span>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                    ✓
                                </div>
                                <span>
                                    <strong>{isBR ? 'Tutor IA 24/7 & Podcasts Completos' : '24/7 AI Tutor & Full Podcasts'}</strong>
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Botón CTA Principal */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{currentPricing.ctaText}</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-600 flex items-center justify-center gap-1.5">
                            <span>🔒</span>
                            <span>{isBR ? 'Pagamento 100% seguro via Stripe • Cancele quando quiser' : '100% secure payment via Stripe • Cancel anytime'}</span>
                        </p>
                        {isBR && billingCycle === 'annual' && (
                            <p className="text-center text-[11px] text-gray-600">
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
