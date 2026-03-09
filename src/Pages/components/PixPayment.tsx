import React from 'react';
// import StripePixPayment from './StripePixPayment';

interface PixPaymentProps {
  amount: number;
  currency: string;
}

const PixPayment: React.FC<PixPaymentProps> = ({ amount, currency }) => {
  return <div className="p-4 bg-gray-800 rounded-lg text-white">Pagamento via PIX em processamento...</div>;
};

export default PixPayment;