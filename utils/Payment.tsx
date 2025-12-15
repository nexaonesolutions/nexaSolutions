import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

// --- Componente de Checkout do Stripe ---
const StripeCheckoutForm = ({ plan }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js ainda não foi carregado.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Altere para a sua página de sucesso de pagamento
        return_url: `${window.location.origin}/order-success?provider=stripe`,
      },
    });

    // Este ponto só será alcançado se houver um erro imediato.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message ?? 'Ocorreu um erro com seu cartão.');
    } else {
      setMessage("Ocorreu um erro inesperado.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit" style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#22d3ee', color: '#030712', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
        <span id="button-text">
          {isLoading ? "Processando..." : `Pagar ${plan.currency} ${plan.price}`}
        </span>
      </button>
      {message && <div id="payment-message" style={{ color: '#f87171', marginTop: '10px' }}>{message}</div>}
    </form>
  );
};

const StripeCheckout = ({ plan }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chame seu backend para criar um PaymentIntent no Stripe
    fetch('http://localhost:5000/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: plan.price * 100, currency: 'eur' }), // Stripe usa centavos
    })
      .then(async (res) => {
        if (!res.ok) {
          const { error: errorMsg } = await res.json().catch(() => ({ error: 'Falha ao ler a resposta do servidor.' }));
          throw new Error(errorMsg || 'Falha ao iniciar o pagamento.');
        }
        return res.json();
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err: Error) => {
        console.error("Stripe fetch error:", err);
        setError(err.message);
      });
  }, [plan]);

  const appearance = {
    theme: 'night',
    labels: 'floating',
  };
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  if (error) {
    return <div style={{ color: '#f87171' }}>Erro: {error}</div>;
  }

  if (!clientSecret) {
    return <div>A inicializar o checkout...</div>;
  }

  return (
    <div>
      <Elements options={options} stripe={stripePromise}>
        <StripeCheckoutForm plan={plan} />
      </Elements>
    </div>
  );
};

// --- Componente de Checkout do Mercado Pago ---

// Inicialize o SDK do Mercado Pago fora do componente para evitar reinicializações
initMercadoPago(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });

const MercadoPagoCheckout = ({ plan }) => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chame seu backend para criar uma preferência de pagamento no Mercado Pago
    fetch('http://localhost:5000/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: plan.name,
            quantity: 1,
            unit_price: Number(plan.price),
            currency_id: 'BRL'
        }),
    })
    .then(async (res) => {
      if (!res.ok) {
        const { error: errorMsg } = await res.json().catch(() => ({ error: 'Falha ao ler a resposta do servidor.' }));
        throw new Error(errorMsg || 'Falha ao criar a preferência de pagamento.');
      }
      return res.json();
    })
    .then((data) => {
        setPreferenceId(data.preferenceId);
    })
    .catch((err: Error) => {
      console.error("Mercado Pago fetch error:", err);
      setError(err.message);
    });
  }, [plan]);

  const initialization = {
    amount: Number(plan.price),
    preferenceId: preferenceId,
  };

  const customization = {
    paymentMethods: {
      creditCard: 'all',
      debitCard: 'all',
      pix: 'all',
    },
  };

  if (error) {
    return <div style={{ color: '#f87171' }}>Erro: {error}</div>;
  }

  if (!preferenceId) {
    return <div>A inicializar o checkout...</div>;
  }

  return (
    <div>
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={async (param) => console.log(param)}
      />
    </div>
  );
};

// --- Componente Principal de Pagamento ---
export const PaymentComponent = ({ plan }) => {
  // Lógica para detectar a localidade. Ex: 'pt-BR' ou 'pt-PT'
  // const locale = useLocale();
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'; // Padrão 'en' para SSR

  // Usa Mercado Pago apenas para o Brasil (BRL)
  if (locale === 'pt-BR') {
    return <MercadoPagoCheckout plan={plan} />;
  }

  // Usa Stripe para Portugal e todos os outros casos (incluindo 'pt', 'pt-PT', 'en', etc.)
  return <StripeCheckout plan={plan} />;
};