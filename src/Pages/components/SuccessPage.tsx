import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/perfil');
    }, 5000); // Redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nexa-dark text-white text-center p-4">
      <CheckCircle className="w-24 h-24 text-green-400 mb-8" />
      <h1 className="text-4xl font-bold mb-4">Pagamento Aprovado!</h1>
      <p className="text-lg text-gray-400 mb-8">
        Seu pagamento foi processado com sucesso. Você será redirecionado para o seu perfil em breve.
      </p>
      <button
        onClick={() => navigate('/perfil')}
        className="bg-nexa-primary text-black px-6 py-3 rounded-full font-semibold hover:bg-cyan-300 transition-all duration-300"
      >
        Ir para o Perfil
      </button>
    </div>
  );
};

export default SuccessPage;
