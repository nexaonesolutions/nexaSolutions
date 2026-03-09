import React, { useState, useEffect, useRef } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { Loader, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/utils/apiConfig';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const VITE_STRIPE_PUBLIC_KEY = (import.meta as any).env.VITE_STRIPE_PUBLIC_KEY || "pk_live_51Sc2xoFPwaZldxIn3aZwNxuSf5cdfulsOBO60IO8mFCzOGqzyTcuvapJdAvFiwTPJ2vW7m0KO2qSSDO9zCdl6ZeC00gg2WDHd6";

if (!VITE_STRIPE_PUBLIC_KEY) {
  console.error('FATAL ERROR: VITE_STRIPE_PUBLIC_KEY is not defined. Stripe payments will not be available. Please set this environment variable.');
}

const stripePromise = VITE_STRIPE_PUBLIC_KEY ? loadStripe(VITE_STRIPE_PUBLIC_KEY) : null;

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  mainPlan?: any;
  maintenancePlan?: any;
  briefingData?: any;
  orderId?: string;
}

const CheckoutForm: React.FC<StripePaymentFormProps> = ({ amount, currency, mainPlan, maintenancePlan, briefingData, orderId }) => {
  const { user, token } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const logActivity = async (status: 'success' | 'failed', errorMsg?: string) => {
    try {
      if (!user) return;

      await addDoc(collection(db, 'activity'), {
        userId: user.id,
        userName: user.name,
        orderId: orderId || 'pending',
        amount,
        currency: currency.toLowerCase() === '€' ? 'eur' : (currency.toLowerCase() === 'r$' ? 'brl' : currency.toLowerCase()),
        status,
        errorMessage: errorMsg || null,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn('Failed to log payment activity to Firestore:', e);
    }
  };

  useEffect(() => {
    if (showSuccessToast) {
      if (countdown > 0) {
        const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
      } else {
        navigate('/perfil');
      }
    }
  }, [showSuccessToast, countdown, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/perfil`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      await logActivity('failed', error.message || 'Pagamento recusado ou erro no processamento');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        if (token) {
          const orderPayload: any = {
            total: amount,
            mainPlanName: mainPlan?.name || 'Unknown',
            maintenancePlanName: maintenancePlan?.name || undefined,
            briefing: briefingData || undefined,
            paymentMethod: 'card',
            currency: currency.toLowerCase() === '€' ? 'eur' : (currency.toLowerCase() === 'r$' ? 'brl' : currency.toLowerCase()),
            clientName: user?.name || user?.email?.split('@')[0] || 'Unknown',
            clientEmail: user?.email || undefined,
            orderId: orderId || (paymentIntent as any).metadata?.orderId || (paymentIntent as any).metadata?.order_id || undefined,
          };
          await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderPayload),
          });
        }
        await logActivity('success');
        setShowSuccessToast(true);
      } catch (orderErr) {
        console.error('Failed to finalize order after payment:', orderErr);
        await logActivity('success');
        setShowSuccessToast(true);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <CheckCircle size={24} />
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Pagamento Aprovado!</p>
            <p style={{ margin: 0, fontSize: '0.9em' }}>Redirecionando para o perfil em {countdown}s...</p>
          </div>
        </div>
      )}
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isLoading}
        style={{
          marginTop: '20px',
          padding: '10px 12px',
          borderRadius: '5px',
          border: 'none',
          fontSize: '16px',
          width: '100%',
          boxSizing: 'border-box',
          background: isLoading ? '#555' : '#6772e5',
          color: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin" size={20} />
            Carregando...
          </>
        ) : 'Pagar'}
      </button>
      {errorMessage && <div style={{ color: '#fa755a', marginTop: '10px' }}>{errorMessage}</div>}
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ amount, currency, mainPlan, maintenancePlan, briefingData }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeFormError, setStripeFormError] = useState<string | null>(null);
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const orderIdRef = useRef<string>(`order_${Date.now()}`);

  useEffect(() => {
    let ignore = false;
    const fetchPaymentIntent = async () => {
      setStripeFormError(null); // Clear previous errors
      try {
        if (!VITE_STRIPE_PUBLIC_KEY) {
          setStripeFormError('Stripe public key is not configured.');
          return;
        }

        let endpointCurrency = currency.toLowerCase();
        if (currency === '€') {
          endpointCurrency = 'eur';
        } else if (currency === 'R$') {
          endpointCurrency = 'brl';
        } else if (currency === '$') { // Assuming '$' could be USD
          endpointCurrency = 'usd';
        }

        if (!token) {
          throw new Error('Você precisa estar logado para realizar o pagamento.');
        }

        if (isAuthLoading || !user) {
          return;
        }

        // Se houver um plano principal e o briefing ainda não foi preenchido, não cria o payment intent ainda
        if (mainPlan && !briefingData) {
          return;
        }

        const generatedOrderId = orderIdRef.current;

        const payload = {
          amount: amount,
          currency: endpointCurrency, // Ensure correct format
          orderId: generatedOrderId,
          mainPlan,
          maintenancePlan,
          userId: user?.id, // Envia o ID do usuário explicitamente
          email: user?.email,
          metadata: {
            orderId: generatedOrderId,
            briefing: briefingData ? JSON.stringify(briefingData).substring(0, 500) : undefined, // Stripe metadata limits
            userId: user?.id,
            email: user?.email,
            mainPlanName: mainPlan?.name,
            maintenancePlanName: maintenancePlan?.name
          }
        };
        console.log('DEBUG: Enviando dados para criar PaymentIntent:', payload);

        // Adiciona o briefing ao corpo da requisição para ser salvo no banco de dados (sem limite de caracteres do metadata)
        const requestBody = { ...payload, briefing: briefingData };

        const response = await fetch(`${API_URL}/api/payments/create-stripe-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody),
        });

        if (ignore) return;

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          }
          if (response.status === 429) {
            throw new Error('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.');
          }
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const data = await response.json(); // Renamed to data to avoid conflict with 'error' property

        if (data.error) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        if (ignore) return;
        console.error('Failed to create payment intent:', error);

        let userFriendlyMsg = error.message || 'Falha ao inicializar pagamento. Por favor, tente novamente.';
        if (error.message === 'Failed to fetch') {
          userFriendlyMsg = 'Não foi possível conectar ao servidor de pagamentos. Verifique sua conexão ou se o serviço está temporariamente indisponível (Erro de Conexão/CORS).';
        }

        setStripeFormError(userFriendlyMsg);
      }
    };

    fetchPaymentIntent();

    return () => {
      ignore = true;
    };
  }, [amount, currency, user, isAuthLoading, briefingData, mainPlan]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#6772e5',
        colorBackground: '#222',
        colorText: '#fff',
        colorDanger: '#fa755a',
        fontFamily: 'Inter, sans-serif',
        spacingUnit: '4px',
        borderRadius: '5px',
      },
    },
  };

  if (isAuthLoading) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        <Loader className="animate-spin" size={20} />
        Carregando informações do usuário...
      </div>
    );
  }

  return (
    <div>
      {stripeFormError && <div style={{ color: '#fa755a', marginTop: '10px' }}>{stripeFormError}</div>}
      {clientSecret && stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm amount={amount} currency={currency} mainPlan={mainPlan} maintenancePlan={maintenancePlan} briefingData={briefingData} orderId={orderIdRef.current} />
        </Elements>
      ) : (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
          Loading payment form...
        </div>
      )}
    </div>
  );
};

export default StripePaymentForm;
