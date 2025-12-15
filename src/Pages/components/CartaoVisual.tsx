import React from 'react';
import StripePaymentForm from './StripePaymentForm';

interface CartaoVisualProps {
  amount: number;
  currency: string;
}

const CartaoVisual: React.FC<CartaoVisualProps> = ({ amount, currency }) => {
  return <StripePaymentForm amount={amount} currency={currency} />;
};

export default CartaoVisual;