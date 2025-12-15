
import React from 'react';
import { X, Building, Users, Rocket } from 'lucide-react';

interface AboutUsProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToPricing: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ isOpen, onClose, onGoToPricing }) => {

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-900/50 glass-effect border border-nexa-primary/20 rounded-2xl shadow-2xl shadow-nexa-primary/10 max-w-2xl w-full flex flex-col max-h-[90vh] sm:max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/60 rounded-t-2xl sticky top-0 z-10 shrink-0">
          <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-nexa-primary to-nexa-secondary rounded-lg flex items-center justify-center shadow-lg shadow-nexa-primary/20">
                  <span className="text-white text-2xl font-extrabold tracking-tight font-sans">N</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Sobre a <span className="text-nexa-primary">Nexa</span></h2>
          </div>
          <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-nexa-primary/20 rounded-full transition-colors duration-300 z-20"
          >
              <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 text-gray-300 space-y-6">
          <div className="flex items-start gap-4">
            <Rocket className="w-6 h-6 text-nexa-primary shrink-0 mt-1"/>
            <div>
              <h3 className="font-bold text-white text-lg mb-1">Nossa Missão</h3>
              <p>
                A Nexa surgiu do desejo genuíno de transformar a comunicação entre
                clientes e vendedores, independentemente do ramo de atuação. Nosso
                objetivo é facilitar o entendimento, fortalecer a confiança e criar
                uma experiência mais eficiente para ambos os lados.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <Building className="w-6 h-6 text-nexa-primary shrink-0 mt-1"/>
            <div>
              <h3 className="font-bold text-white text-lg mb-1">O Que Fazemos</h3>
              <p>
                Oferecemos landing pages modernas e personalizadas para a
                sua empresa, desenvolvidas com foco em desempenho, clareza e
                conversão. Unimos criatividade, tecnologia e inovação para entregar soluções digitais de qualidade.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 my-4"></div>

          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-nexa-primary shrink-0 mt-1"/>
            <div>
              <h3 className="font-bold text-white text-lg mb-1">Os Fundadores</h3>
              <p>
                A Nexa foi idealizada e criada por dois jovens programadores, <span className="font-semibold text-nexa-primary/90">Raul B.</span> e <span className="font-semibold text-nexa-primary/90">Kaua M.</span>, apaixonados por transformar ideias em realidade digital.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Action Button */}
        <div className="p-5 sm:p-6 border-t border-gray-800 bg-gray-900/60 rounded-b-2xl sticky bottom-0 z-10 shrink-0">
            <button 
                onClick={onGoToPricing}
                className="w-full bg-gradient-to-r from-nexa-primary to-nexa-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-nexa-primary/40 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
                Vem fazer parte
            </button>
        </div>
      </div>
    </div>
  );
};
