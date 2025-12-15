import React from 'react';
import StripePixPayment from './StripePixPayment';

interface PixPaymentProps {
  amount: number;
  currency: string;
}

const PixPayment: React.FC<PixPaymentProps> = ({ amount, currency }) => {
  return <StripePixPayment amount={amount} currency={currency} />;
};

export default PixPayment;