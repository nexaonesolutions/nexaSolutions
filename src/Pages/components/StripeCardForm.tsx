import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface StripeCardFormProps {
  amount: number;
  currency: string;
}

const cardElementOptions = {
  style: {
    base: {
      color: "#fff",
      fontFamily: 'Inter, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }
};

const CheckoutForm: React.FC<StripeCardFormProps> = ({ amount, currency }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (cardElement == null) {
      setIsLoading(false);
      return;
    }

    let endpointCurrency = currency.toLowerCase();
    if (currency === '€') {
      endpointCurrency = 'eur';
    }

    try {
      // 1. Create Payment Intent on the backend
      const response = await fetch(`/api/payments/create-stripe-payment-intent-${endpointCurrency}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: amount,
          orderId: `order_${Date.now()}`, // Should be dynamic
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      if (!clientSecret) {
        throw new Error('Failed to retrieve payment client secret.');
      }

      // 2. Confirm the payment on the frontend
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement as any,
          billing_details: {
            name: 'Test User', // This should be dynamic from a form field
          },
        },
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent?.status === 'succeeded') {
        alert(`Payment successful! PaymentIntent ID: ${paymentIntent.id}`);
      } else {
        alert(`Payment status: ${paymentIntent?.status}`);
      }

    } catch (error: any) {
      console.error('Stripe payment error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ background: '#222', padding: '15px', borderRadius: '5px', border: '1px solid #444' }}>
        <CardElement options={cardElementOptions} />
      </div>
      <button
        type="submit"
        disabled={!stripe || isLoading}
        style={{
          ...inputStyle,
          marginTop: '20px',
          background: isLoading ? '#555' : '#6772e5',
          color: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Processing...' : 'Pay'}
      </button>
      {errorMessage && <div style={{ color: '#fa755a', marginTop: '10px' }}>{errorMessage}</div>}
    </form>
  );
};

const StripeCardForm: React.FC<StripeCardFormProps> = (props) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm {...props} />
  </Elements>
);

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '5px',
  border: 'none',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box'
};

export default StripeCardForm;
