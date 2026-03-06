import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// Mercado Pago removed; Stripe only
import { API_URL } from './apiConfig';

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
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/payments/create-stripe-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ amount: plan.price, currency: 'eur' }), // amount as number (controller converts to cents)
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

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

// Mercado Pago integration removed — Stripe handles payments now.

// --- Componente Principal de Pagamento ---
export const PaymentComponent = ({ plan }) => {
  return <StripeCheckout plan={plan} />;
};