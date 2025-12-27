import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, CreditCard, QrCode, ChevronDown } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import StripePixPayment from './StripePixPayment';
import { useAuth } from '../contexts/AuthContext';

type PaymentMethod = 'card' | 'pix';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mainPlan, maintenancePlan } = location.state || { mainPlan: null, maintenancePlan: null };
  const [activeTab, setActiveTab] = useState<PaymentMethod>('card');
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  const total = (mainPlan ? Number(String(mainPlan.price).replace(/[^0-9.-]+/g,"")) : 0) + (maintenancePlan ? Number(String(maintenancePlan.price).replace(/[^0-9.-]+/g,"")) : 0);
  const currency = mainPlan?.currency || maintenancePlan?.currency || 'BRL';
  const currencySymbol = currency === 'BRL' ? 'R$' : currency;

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

  const renderPaymentMethod = () => {
    switch (activeTab) {
      case 'card':
        return <StripePaymentForm amount={total} currency={currency} mainPlan={mainPlan} maintenancePlan={maintenancePlan} />;
      case 'pix':
        return <StripePixPayment amount={total} currency={currency} mainPlan={mainPlan} maintenancePlan={maintenancePlan} />;
      default:
        return <StripePaymentForm amount={total} currency={currency} mainPlan={mainPlan} maintenancePlan={maintenancePlan} />;
    }
  }

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

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Left Side: Payment Options */}
                <div className="lg:order-2">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-8">Efetue o Pagamento</h1>
                    <div className="bg-nexa-card/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
                        <div className="flex mb-8 border-b border-gray-700">
                            <button onClick={() => setActiveTab('card')} className={`flex-1 p-4 text-center font-semibold flex items-center justify-center gap-2 ${activeTab === 'card' ? 'text-nexa-primary border-b-2 border-nexa-primary' : 'text-gray-400'}`}>
                                <CreditCard size={20} /> Cartão
                            </button>
                            {currency === 'BRL' && (
                                <button onClick={() => setActiveTab('pix')} className={`flex-1 p-4 text-center font-semibold flex items-center justify-center gap-2 ${activeTab === 'pix' ? 'text-nexa-primary border-b-2 border-nexa-primary' : 'text-gray-400'}`}>
                                    <QrCode size={20} /> PIX
                                </button>
                            )}
                        </div>
                        {renderPaymentMethod()}
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
                                        <div className="flex justify-between items-center text-gray-300">
                                            <span>Subtotal</span>
                                            <span>{currencySymbol}{mainPlan.price}</span>
                                        </div>
                                        {maintenancePlan && (
                                            <div className="flex justify-between items-center text-gray-300">
                                                <span>Manutenção Mensal</span>
                                                <span>{currencySymbol}{maintenancePlan.price}</span>
                                            </div>

                                        )}
                                        <div className="flex justify-between items-center text-white text-xl font-bold pt-4 border-t border-gray-700/50 mt-4">
                                            <span>Total</span>
                                            <span>{currencySymbol}{total}{maintenancePlan ? '/mês' : ''}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                     <div className="flex items-center gap-3 text-gray-500 text-sm mt-6 p-4 bg-nexa-card/20 border border-gray-800 rounded-lg">
                        <ShieldCheck className="w-8 h-8 text-nexa-primary shrink-0"/>
                        <span>Ambiente 100% seguro. Seus dados são protegidos e a transação é criptografada.</span>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
};

export default PaymentPage;