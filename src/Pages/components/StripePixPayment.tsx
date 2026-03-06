import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../../../utils/apiConfig';

const VITE_STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const stripePromise = VITE_STRIPE_PUBLIC_KEY ? loadStripe(VITE_STRIPE_PUBLIC_KEY) : null;

interface StripePixPaymentProps {
  amount: number;
  currency: string;
  mainPlan?: any;
  maintenancePlan?: any;
  briefingData?: any;
}

const StripePixPayment: React.FC<StripePixPaymentProps> = ({ amount, currency, mainPlan, maintenancePlan, briefingData }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copyPasteCode, setCopyPasteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    let ignore = false;
    const fetchPaymentIntent = async () => {
      try {
        if (!stripePromise) {
          throw new Error("Chave pública do Stripe não configurada (VITE_STRIPE_PUBLIC_KEY).");
        }

        let endpointCurrency = currency.toLowerCase();
        if (currency === '€') {
          endpointCurrency = 'eur';
        } else if (currency === 'R$') {
          endpointCurrency = 'brl';
        }

        const payload = {
          amount: amount,
          currency: endpointCurrency,
          payment_method_types: ['pix'],
          orderId: `order_pix_${Date.now()}`,
          mainPlan,
          maintenancePlan,
          userId: user?.id,
          clientName: user?.name || user?.email?.split('@')[0] || 'Unknown',
          clientEmail: user?.email || undefined,
          email: user?.email,
          metadata: {
            briefing: briefingData ? JSON.stringify(briefingData).substring(0, 500) : undefined,
            userId: user?.id,
            email: user?.email,
            mainPlanName: mainPlan?.name,
            maintenancePlanName: maintenancePlan?.name
          }
        };
        console.log('DEBUG: Enviando dados para criar PaymentIntent (PIX):', payload);

        // Adiciona o briefing ao corpo da requisição para ser salvo no banco de dados
        const requestBody = { ...payload, briefing: briefingData };

        const response = await fetch(`${API_URL}/api/payments/create-stripe-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(requestBody),
        });

        if (ignore) return;

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent.');
        }

        const { clientSecret, error: backendError } = await response.json();

        if (backendError) {
          throw new Error(backendError);
        }

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Falha ao carregar o Stripe.js.");
        }

        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        if (paymentIntent && paymentIntent.next_action?.pix_display_qr_code) {
          if (ignore) return;
          setQrCodeUrl(paymentIntent.next_action.pix_display_qr_code.image_url_png);
          setCopyPasteCode(paymentIntent.next_action.pix_display_qr_code.copyable_code);
        } else {
          throw new Error("Could not retrieve PIX QR code from Payment Intent.");
        }

      } catch (error: any) {
        if (ignore) return;
        setError("Não foi possível gerar o código PIX. Por favor, verifique se esta opção de pagamento está habilitada em sua conta Stripe.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPaymentIntent();
    return () => {
      ignore = true;
    };
  }, [amount, currency, user, mainPlan, maintenancePlan, briefingData]);

  const handleCopy = () => {
    if (copyPasteCode) {
      navigator.clipboard.writeText(copyPasteCode);
      alert('Chave PIX copiada para a área de transferência!');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Gerando PIX...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-900/20 text-red-300 border border-red-800 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Ocorreu um erro</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Pague com QR Code</h3>
        <p className="text-sm text-gray-400 mb-4 text-center">Abra o app do seu banco e escaneie o código abaixo.</p>
        <div className="w-48 h-48 bg-white p-2 rounded-lg flex items-center justify-center">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="PIX QR Code" className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          )}
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>

      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4 text-center">Pague com PIX Copia e Cola</h3>
        <p className="text-sm text-gray-400 mb-2">Copie o código abaixo e cole no seu app de pagamentos:</p>
        <div className="flex">
          <input
            type="text"
            readOnly
            value={copyPasteCode || 'Gerando código...'}
            className="w-full p-3 border border-gray-600 rounded-l-md bg-gray-900 text-white text-xs truncate"
          />
          <button
            onClick={handleCopy}
            disabled={!copyPasteCode}
            className="p-3 bg-nexa-primary text-black rounded-r-md hover:bg-nexa-secondary disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Copy size={20} />
            <span>Copiar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripePixPayment;
