import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface StripePaymentFormProps {
  amount: number;
  currency: string;
}

const CheckoutForm: React.FC<StripePaymentFormProps> = ({ amount, currency }) => {
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/#/success`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
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
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Processing...' : 'Pay'}
      </button>
      {errorMessage && <div style={{ color: '#fa755a', marginTop: '10px' }}>{errorMessage}</div>}
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ amount, currency }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        let endpointCurrency = currency.toLowerCase();
        if (currency === '€') {
          endpointCurrency = 'eur';
        } else if (currency === 'R$') {
          endpointCurrency = 'brl';
        }

        const response = await fetch('/api/payments/create-stripe-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            currency: endpointCurrency,
            payment_method_types: ['card'],
            orderId: `order_${Date.now()}`,
          }),
        });

        const { clientSecret, error } = await response.json();

        if (error) {
          throw new Error(error);
        }
        
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Failed to create payment intent:', error);
      }
    };

    fetchPaymentIntent();
  }, [amount, currency]);

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

  return (
    <div>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm amount={amount} currency={currency} />
        </Elements>
      )}
    </div>
  );
};

export default StripePaymentForm;
