import React, { useState, useMemo } from 'react';

const CardPayment = () => {
  const [cardState, setCardState] = useState({
    number: '#### #### #### ####',
    name: 'FULL NAME',
    expiry: 'MM/YY',
    cvc: '',
  });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardState(prev => ({ ...prev, [name]: value }));
  };

  const handleCvcFocus = () => setIsFlipped(true);
  const handleCvcBlur = () => setIsFlipped(false);

  const cardLogo = useMemo(() => {
    if (cardState.number.startsWith('4')) return 'visa';
    if (cardState.number.startsWith('5')) return 'mastercard';
    return 'default';
  }, [cardState.number]);

  // TODO: Integrate with Mercado Pago
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Card Number: ${cardState.number}\nName: ${cardState.name}\nExpiry: ${cardState.expiry}\nCVC: ${cardState.cvc}`);
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className={`relative w-full h-56 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden">
          <svg viewBox="0 0 320 200" className="w-full h-full rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg">
            <rect width="320" height="200" rx="10" fill="url(#grad1)" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(55, 65, 81)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(17, 24, 39)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <text x="20" y="35" fill="white" fontSize="16" fontWeight="bold">Credit Card</text>
            <text x="20" y="120" fill="white" fontSize="20">{cardState.number}</text>
            <text x="20" y="160" fill="white" fontSize="14">Card Holder</text>
            <text x="20" y="180" fill="white" fontSize="16">{cardState.name}</text>
            <text x="230" y="160" fill="white" fontSize="14">Expires</text>
            <text x="230" y="180" fill="white" fontSize="16">{cardState.expiry}</text>
            {cardLogo === 'visa' && <text x="270" y="35" fill="white" fontSize="20" fontWeight="bold">VISA</text>}
            {cardLogo === 'mastercard' && <circle cx="280" cy="25" r="10" fill="red" />}
          </svg>
        </div>
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <svg viewBox="0 0 320 200" className="w-full h-full rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg">
            <rect width="320" height="200" rx="10" fill="url(#grad1)" />
            <rect y="40" width="320" height="30" fill="black" />
            <rect x="20" y="90" width="280" height="30" fill="white" />
            <text x="270" y="110" fill="black" fontSize="14">{cardState.cvc}</text>
          </svg>
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="number"
          placeholder="Card Number"
          onChange={handleInputChange}
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary"
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleInputChange}
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary"
        />
        <div className="flex space-x-4">
          <input
            type="text"
            name="expiry"
            placeholder="MM/YY"
            onChange={handleInputChange}
            className="w-1/2 p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary"
          />
          <input
            type="text"
            name="cvc"
            placeholder="CVC"
            onChange={handleInputChange}
            onFocus={handleCvcFocus}
            onBlur={handleCvcBlur}
            className="w-1/2 p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-4 p-3 rounded bg-nexa-primary text-black font-bold hover:bg-nexa-secondary"
        >
          Pagar com Cartão
        </button>
      </form>
    </div>
  );
};

export default CardPayment;

// Add this to your globals.css for the 3D effect
/*
.transform-style-3d {
  transform-style: preserve-3d;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
.backface-hidden {
  backface-visibility: hidden;
}
*/