import React, { useEffect } from 'react';
import { Banknote } from 'lucide-react';

const SepaPayment = () => {
  const sepaDetails = {
    beneficiary: 'Nexa Digital LTDA',
    iban: 'PT50 0000 0000 0000 0000 0000 0',
    bic: 'NEXAPTPL',
  };

  useEffect(() => {
    // TODO: Integrate with Stripe
    alert(`Beneficiary: ${sepaDetails.beneficiary}\nIBAN: ${sepaDetails.iban}\nBIC: ${sepaDetails.bic}`);
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-4">Transferência Bancária (SEPA)</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Beneficiário:</p>
          <p className="font-mono">{sepaDetails.beneficiary}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">IBAN:</p>
          <p className="font-mono">{sepaDetails.iban}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">BIC/SWIFT:</p>
          <p className="font-mono">{sepaDetails.bic}</p>
        </div>
        <div className="flex items-start p-4 bg-gray-900/50 rounded-lg mt-4">
          <Banknote className="w-6 h-6 text-nexa-primary mr-4" />
          <p className="text-sm text-gray-400">
            Por favor, inclua o número do seu pedido como referência de pagamento.
            O seu pedido não será processado até que os fundos sejam recebidos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SepaPayment;