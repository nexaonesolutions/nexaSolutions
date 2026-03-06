import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, CreditCard, QrCode, ChevronDown } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import StripePixPayment from './StripePixPayment';
import { useAuth } from '../contexts/AuthContext';
import ProjectBriefingModal from '../../../ProjectBriefingModal';
import { API_URL } from '../../../utils/apiConfig';

type PaymentMethod = 'card' | 'pix';

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Tenta pegar do state ou do sessionStorage
    const [mainPlan, setMainPlan] = useState<any>(() => {
        if (location.state?.mainPlan) return location.state.mainPlan;
        const saved = sessionStorage.getItem('nexa_main_plan');
        return saved ? JSON.parse(saved) : null;
    });

    const [maintenancePlan, setMaintenancePlan] = useState<any>(() => {
        if (location.state?.maintenancePlan) return location.state.maintenancePlan;
        const saved = sessionStorage.getItem('nexa_maintenance_plan');
        return saved ? JSON.parse(saved) : null;
    });

    const [activeTab, setActiveTab] = useState<PaymentMethod>('card');
    const [isSummaryOpen, setIsSummaryOpen] = useState(true);
    const [briefingData, setBriefingData] = useState<any>(() => {
        const saved = sessionStorage.getItem('nexa_submitted_briefing');
        return saved ? JSON.parse(saved) : null;
    });
    const [showBriefing, setShowBriefing] = useState(() => {
        // Se já temos briefingData no sessionStorage, não mostramos o modal de novo
        const saved = sessionStorage.getItem('nexa_submitted_briefing');
        return !!mainPlan && !saved;
    });
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribeError, setSubscribeError] = useState<string | null>(null);

    // Salva no sessionStorage quando os dados mudam
    useEffect(() => {
        if (mainPlan) sessionStorage.setItem('nexa_main_plan', JSON.stringify(mainPlan));
        if (maintenancePlan) sessionStorage.setItem('nexa_maintenance_plan', JSON.stringify(maintenancePlan));
        if (briefingData) sessionStorage.setItem('nexa_submitted_briefing', JSON.stringify(briefingData));
    }, [mainPlan, maintenancePlan, briefingData]);

    // Se houver plano de manutenção, o valor pago agora é a soma de ambos. A manutenção se tornará mensal futuramente.
    const mainPlanValue = mainPlan ? Number(String(mainPlan.price).replace(/[^0-9.-]+/g, "")) : 0;
    const maintenanceValue = maintenancePlan ? Number(String(maintenancePlan.price).replace(/[^0-9.-]+/g, "")) : 0;

    const total = mainPlanValue + maintenanceValue;
    const currency = mainPlan?.currency || maintenancePlan?.currency || 'BRL';
    const isBRL = currency === 'R$' || currency === 'BRL';
    const currencySymbol = isBRL ? 'R$' : currency;

    // Proteção contra atualização de página (perda de state) e usuário não logado
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (!mainPlan) {
            // Se não houver plano selecionado (ex: refresh da página), volta para planos
            navigate('/planos');
        }
    }, [user, mainPlan, navigate]);

    if (!user || !mainPlan) {
        return (
            <div className="bg-nexa-dark min-h-screen flex items-center justify-center">
                <div className="text-white text-xl font-bold animate-pulse">
                    Carregando informações do pedido...
                </div>
            </div>
        );
    }

    const handleBriefingSubmit = (data: any) => {
        setBriefingData(data);
        setShowBriefing(false);
    };

    const renderPaymentMethod = () => {
        switch (activeTab) {
            case 'card':
                return <StripePaymentForm amount={total} currency={currency} mainPlan={mainPlan} maintenancePlan={maintenancePlan} briefingData={briefingData} />;
            case 'pix':
                return <StripePixPayment amount={total} currency={currency} mainPlan={mainPlan} maintenancePlan={maintenancePlan} briefingData={briefingData} />;
            default:
                return <StripePaymentForm amount={total} currency={currency} mainPlan={mainPlan} maintenancePlan={maintenancePlan} briefingData={briefingData} />;
        }
    }

    const handleSubscribeMaintenance = async () => {
        setIsSubscribing(true);
        setSubscribeError(null);
        try {
            // Se houver briefingData, garantiremos que seja salvo (opcional dependendo de como as regras de negócio forem configuradas)
            // Se o usuário optar por assinar somente a manutenção, ele ignora o pagamento de uma vez de hoje e só fará a assinatura.

            let endpointCurrency = currency.toLowerCase();
            if (currency === '€') endpointCurrency = 'eur';
            else if (currency === 'R$') endpointCurrency = 'brl';
            else if (currency === '$') endpointCurrency = 'usd';

            const payload = {
                amount: maintenanceValue,
                currency: endpointCurrency,
                orderId: `sub_combined_${Date.now()}`,
                userId: user?.id,
                email: user?.email,
                maintenancePlan: maintenancePlan,
                mainPlan: mainPlan,
                briefing: briefingData,
                metadata: {
                    userId: user?.id,
                    email: user?.email,
                    mainPlanName: mainPlan?.name,
                    maintenancePlanName: maintenancePlan?.name,
                    type: 'combined_checkout'
                }
            };

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/payments/create-maintenance-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create subscription session');
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned from server');
            }
        } catch (error: any) {
            console.error('Subscription error:', error);
            setSubscribeError(error.message);
            setIsSubscribing(false);
        }
    };

    return (
        <div className="bg-nexa-dark min-h-screen text-white font-sans antialiased">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <header className="mb-12 relative flex justify-center items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Voltar
                    </button>
                    <Link to="/" className="flex items-center space-x-2 group w-fit">
                        <div className="w-12 h-12 bg-gradient-to-br from-nexa-primary to-nexa-secondary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-nexa-primary/20">
                            <span className="text-white text-3xl font-extrabold tracking-tight font-sans">N</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tighter text-white">NEXA</span>
                    </Link>
                </header>

                {showBriefing && (
                    <ProjectBriefingModal
                        isOpen={showBriefing}
                        onSubmit={handleBriefingSubmit}
                        planName={mainPlan.name}
                    />
                )}

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left Side: Payment Options */}
                    <div className="lg:order-2">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Efetue o Pagamento</h1>
                        <div className={`bg-nexa-card/40 border border-gray-800 rounded-2xl p-6 sm:p-8 ${showBriefing ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex mb-8 border-b border-gray-700">
                                <button onClick={() => setActiveTab('card')} className={`flex-1 p-4 text-center font-semibold flex items-center justify-center gap-2 ${activeTab === 'card' ? 'text-nexa-primary border-b-2 border-nexa-primary' : 'text-gray-400'}`}>
                                    <CreditCard size={20} /> Cartão
                                </button>
                                {isBRL && (
                                    <button onClick={() => setActiveTab('pix')} className={`flex-1 p-4 text-center font-semibold flex items-center justify-center gap-2 ${activeTab === 'pix' ? 'text-nexa-primary border-b-2 border-nexa-primary' : 'text-gray-400'}`}>
                                        <QrCode size={20} /> PIX
                                    </button>
                                )}
                            </div>
                            {!showBriefing && renderPaymentMethod()}
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:order-1">
                        <div
                            className="flex justify-between items-center cursor-pointer mb-8"
                            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                        >
                            <h1 className="text-2xl sm:text-3xl font-bold">Resumo do Pedido</h1>
                            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`} />
                        </div>

                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSummaryOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                            <div className="bg-nexa-card/40 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 mb-6">
                                {!mainPlan ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 mb-4">Nenhum plano selecionado.</p>
                                        <Link to="/planos" className="bg-nexa-primary text-black px-6 py-2.5 rounded-full font-semibold hover:bg-cyan-300 transition-all duration-300">
                                            Ver Planos
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start p-4 bg-white/5 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-lg text-gray-200">Plano Landing Page</p>
                                                    <p className="text-gray-400">{mainPlan.name}</p>
                                                </div>
                                                <span className="font-bold text-lg text-white">{currencySymbol}{mainPlan.price}</span>
                                            </div>
                                            {maintenancePlan && (
                                                <div className="flex justify-between items-start p-4 bg-white/5 rounded-lg">
                                                    <div>
                                                        <p className="font-bold text-lg text-gray-200">Plano de Manutenção</p>
                                                        <p className="text-gray-400">{maintenancePlan.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-lg text-white">{currencySymbol}{maintenancePlan.price}</span>
                                                        <p className="text-xs text-gray-500">por mês</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-700/50 my-6"></div>

                                        <div className="space-y-2">
                                            {maintenancePlan ? (
                                                <>
                                                    <div className="flex justify-between items-center text-gray-300">
                                                        <span>Construção ({mainPlan.name})</span>
                                                        <span>{currencySymbol}{mainPlanValue}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-gray-300 mt-2">
                                                        <span>1ª Mesada da Manutenção</span>
                                                        <span>{currencySymbol}{maintenanceValue}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex justify-between items-center text-gray-300">
                                                    <span>Construção ({mainPlan.name})</span>
                                                    <span>{currencySymbol}{mainPlanValue}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-white text-xl font-bold pt-4 border-t border-gray-700/50 mt-4">
                                                <span>Total a pagar hoje</span>
                                                <span>{currencySymbol}{total}</span>
                                            </div>
                                            {maintenancePlan && (
                                                <div className="text-right text-xs text-gray-500 mt-1">
                                                    + {currencySymbol}{maintenanceValue}/mês de manutenção.
                                                </div>
                                            )}
                                        </div>

                                        {maintenancePlan && (
                                            <div className="mt-8 pt-6 border-t border-gray-700/50">
                                                <h3 className="text-sm font-bold text-gray-300 mb-3 text-center uppercase tracking-widest">Opção Recorrente Alternativa</h3>
                                                <p className="text-xs text-gray-400 text-center mb-4">
                                                    Deseja iniciar apenas a assinatura da manutenção mensal hoje e resolver o pagamento da Landing Page / Site separadamente?
                                                </p>
                                                <button
                                                    onClick={handleSubscribeMaintenance}
                                                    disabled={isSubscribing}
                                                    className="w-full mt-4 bg-gray-800 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl font-bold hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 group"
                                                >
                                                    {isSubscribing ? (
                                                        <span className="flex items-center gap-2">
                                                            <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Gerando...
                                                        </span>
                                                    ) : (
                                                        `Assinar Manutenção por ${currencySymbol}${maintenanceValue}/mês`
                                                    )}
                                                </button>
                                                {subscribeError && (
                                                    <p className="text-red-400 text-xs text-center mt-2">{subscribeError}</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 text-sm mt-6 p-4 bg-nexa-card/20 border border-gray-800 rounded-lg">
                            <ShieldCheck className="w-8 h-8 text-nexa-primary shrink-0" />
                            <span>Ambiente 100% seguro. Seus dados são protegidos e a transação é criptografada.</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PaymentPage;