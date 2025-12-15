import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface MercadoPagoCardFormProps {
  amount: number;
  currency: string;
}

const MercadoPagoCardForm: React.FC<MercadoPagoCardFormProps> = ({ amount, currency }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mp, setMp] = useState<any>(null);
  const [mpFields, setMpFields] = useState<any>(null);
  
  // Use a ref to keep track of the bin
  const bin = useRef('');

  useEffect(() => {
    if (window.MercadoPago) {
      const mercadopago = new window.MercadoPago(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY, {
        locale: 'pt-BR'
      });
      setMp(mercadopago);

      try {
        const fields = mercadopago.fields;
        if (!fields) {
            console.error('MercadoPago Fields SDK not found');
            alert('Ocorreu um erro ao carregar o formulário de pagamento. Por favor, recarregue a página.');
            return;
        }
        
        const cardNumber = fields.create('cardNumber', { placeholder: "Número do cartão" });
        cardNumber.mount('cardNumber');
        fields.create('expirationDate', { placeholder: "MM/YY" }).mount('expirationDate');
        fields.create('securityCode', { placeholder: "CVC" }).mount('securityCode');
        setMpFields(fields);

        cardNumber.on('binChange', (data: any) => {
            bin.current = data.bin;
        });

        // Add event listeners to know when the fields are ready
        cardNumber.on('ready', () => {
            setIsLoading(false);
        });

        // Handle field validation errors
        cardNumber.on('error', (errors: any) => {
            console.error('CardNumber errors:', errors);
            // You can display these errors to the user
        });

      } catch (error) {
        console.error('Error initializing MercadoPago Fields:', error);
        alert('Ocorreu um erro inesperado ao inicializar o pagamento. Verifique o console para mais detalhes.');
      }

    } else {
      console.error('MercadoPago SDK not found');
      // Retry loading the SDK or show an error message.
      setTimeout(() => {
        if(!window.MercadoPago) {
           alert('Não foi possível carregar o SDK do Mercado Pago. Verifique sua conexão ou tente novamente mais tarde.');
        }
      }, 2000);
    }
  }, []);

  const getPaymentMethod = async (currentBin: string) => {
    if (!mp || !currentBin) return null;
    try {
        const { results } = await mp.getPaymentMethods({ bin: currentBin });
        return results && results.length > 0 ? results[0].id : null;
    } catch (error) {
        console.error('Error getting payment methods:', error);
        return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || !mpFields) {
      alert('O formulário de pagamento ainda não está pronto. Por favor, aguarde.');
      return;
    }
    
    setIsLoading(true);

    const paymentMethodId = await getPaymentMethod(bin.current);

    if (!paymentMethodId) {
      alert('Não foi possível determinar o método de pagamento. Verifique o número do seu cartão.');
      setIsLoading(false);
      return;
    }

    try {
      const cardToken = await mpFields.createCardToken({
        cardholderName: (document.getElementById('cardholderName') as HTMLInputElement).value,
        identificationType: (document.getElementById('identificationType') as HTMLInputElement).value,
        identificationNumber: (document.getElementById('identificationNumber') as HTMLInputElement).value,
      });

      if (!cardToken || !cardToken.id) {
        throw new Error('Não foi possível tokenizar o cartão. Verifique os detalhes do seu cartão.');
      }
      
      const response = await fetch('/api/payments/create-mercadopago-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cardToken.id,
          installments: 1,
          paymentMethodId: paymentMethodId,
          transaction_amount: amount,
          description: `Pagamento do plano: ${amount} ${currency}`,
          payer: {
            email: 'test_user_123456@testuser.com', // This should come from user session
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Pagamento bem-sucedido! ID: ${data.id}, Status: ${data.status}`);
      } else {
        let userMessage = data.message || data.error || 'Erro desconhecido';
        if (userMessage.includes('bin_not_found')) {
            userMessage = 'O número do cartão é inválido. Por favor, use um cartão de teste válido do Mercado Pago.';
        }
        alert(`O pagamento falhou: ${userMessage}`);
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
      alert(`Ocorreu um erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div id="cardNumber" style={inputStyle}></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div id="expirationDate" style={inputStyle}></div>
            <div id="securityCode" style={inputStyle}></div>
          </div>
          <input
            type="text"
            id="cardholderName"
            placeholder="Nome no cartão"
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select id="identificationType" style={inputStyle}>
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
            <input
              type="text"
              id="identificationNumber"
              placeholder="Número de identificação"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={isLoading} style={{...inputStyle, background: '#00a99d', color: 'white', cursor: 'pointer'}}>
            {isLoading ? 'Processando...' : `Pagar R$${amount}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '16px',
  width: '100%',
  height: '40px',
  background: '#333',
  color: 'white'
};

export default MercadoPagoCardForm;
