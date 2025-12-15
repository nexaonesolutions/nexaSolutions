import React from 'react';
import { Link } from 'react-router-dom';
import NEXA404Image from '/image/NEXA404.jpg'; // Adjust the import path as needed

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nexa-dark text-white text-center p-4">
      <img src={NEXA404Image} alt="Página não encontrada" className="max-w-sm w-full mb-8" />
      <h1 className="text-4xl font-bold mb-4">Página Não Encontrada</h1>
      <p className="text-lg text-gray-400 mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="bg-nexa-primary text-black px-6 py-3 rounded-full font-semibold hover:bg-cyan-300 transition-all duration-300"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};

export default NotFoundPage;
