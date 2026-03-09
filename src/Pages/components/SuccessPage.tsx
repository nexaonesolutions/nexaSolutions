import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { API_URL } from '../../../utils/apiConfig';
import { useAuth } from '../contexts/AuthContext';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, token } = useAuth();

  const [orderProcessed, setOrderProcessed] = useState(false);

  useEffect(() => {
    const processOrder = async () => {
      if (orderProcessed) return;
      setOrderProcessed(true);

      const params = new URLSearchParams(location.search);
      const paymentIntentId = params.get('payment_intent');
      const sessionId = params.get('session_id');

      if (!token || (!paymentIntentId && !sessionId)) {
        setStatus('error');
        setErrorMessage('Sessão ou ID de pagamento inválido.');
        return;
      }

      try {
        let orderPayload: any = null;

        if (sessionId) {
          // Flow for Subscriptions
          const sessionRes = await fetch(`${API_URL}/api/payments/checkout-session/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!sessionRes.ok) throw new Error('Falha ao recuperar detalhes da sessão de assinatura.');
          const { session } = await sessionRes.json();

          orderPayload = {
            total: session.amount_total / 100,
            mainPlanName: session.metadata.mainPlanName,
            maintenancePlanName: session.metadata.maintenancePlanName,
            briefing: session.metadata?.briefing || undefined,
            paymentMethod: 'subscription_card',
            paymentDetails: { subscriptionId: session.subscription?.id || session.subscription },
            currency: session.currency || 'brl',
            clientName: user?.name || user?.email?.split('@')[0] || 'Unknown',
            clientEmail: user?.email || undefined,
            orderId: session.metadata?.orderId || undefined,
          };
        } else if (paymentIntentId) {
          // Flow for One-time Payments
          const piResponse = await fetch(`${API_URL}/api/payments/stripe-payment-intent/${paymentIntentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!piResponse.ok) throw new Error('Falha ao recuperar detalhes do pagamento.');
          const { paymentIntent } = await piResponse.json();

          orderPayload = {
            total: paymentIntent.amount / 100,
            mainPlanName: paymentIntent.metadata.mainPlanName,
            maintenancePlanName: paymentIntent.metadata.maintenancePlanName,
            briefing: paymentIntent.metadata?.briefing || undefined,
            paymentMethod: paymentIntent.payment_method_details?.type || 'card',
            paymentDetails: paymentIntent.charges?.data?.[0] || undefined,
            currency: paymentIntent.currency || 'brl',
            clientName: user?.name || user?.email?.split('@')[0] || 'Unknown',
            clientEmail: user?.email || undefined,
            orderId: paymentIntent.metadata?.orderId || paymentIntent.metadata?.order_id || undefined,
          };
        }

        if (orderPayload) {
          const orderResponse = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload)
          });

          if (!orderResponse.ok) throw new Error('Falha ao salvar o pedido no banco de dados.');
        }

        setStatus('success');
        localStorage.removeItem('nexa_briefing_draft');
        sessionStorage.removeItem('nexa_main_plan');
        sessionStorage.removeItem('nexa_maintenance_plan');
        sessionStorage.removeItem('nexa_submitted_briefing');

      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Ocorreu um erro inesperado ao salvar seu pedido.');
      }
    };

    if (token) {
      processOrder();
    }
  }, [location, orderProcessed, token]);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      if (countdown === 0) {
        navigate('/perfil');
        return;
      }
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, navigate, status]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader className="w-24 h-24 text-nexa-primary mb-8 mx-auto animate-spin" />
            <h1 className="text-4xl font-bold mb-4">Processando seu Pedido...</h1>
            <p className="text-lg text-gray-400">Por favor, aguarde enquanto finalizamos seu pedido.</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-24 h-24 text-green-400 mb-8 mx-auto" />
            <h1 className="text-4xl font-bold mb-4">Pagamento Aprovado!</h1>
            <p className="text-lg text-gray-400 mb-8">
              Seu pedido foi salvo com sucesso! Redirecionando para seu perfil em{' '}
              <span className="font-bold text-nexa-primary">{countdown}</span>s.
            </p>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-24 h-24 text-red-500 mb-8 mx-auto" />
            <h1 className="text-4xl font-bold mb-4">Erro ao Salvar Pedido</h1>
            <p className="text-lg text-red-400 mb-8">{errorMessage}</p>
            <p className="text-sm text-gray-500">
              Você será redirecionado em <span className="font-bold">{countdown}</span>s.
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nexa-dark text-white text-center p-4">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-lg">
        {renderContent()}
        <button
          onClick={() => navigate('/perfil')}
          className="mt-8 bg-nexa-primary text-black px-6 py-3 rounded-full font-semibold hover:bg-cyan-300 transition-all duration-300"
        >
          Ir para o Perfil Agora
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
