import React from 'react';
import { X, Building, Users, Rocket } from 'lucide-react';

interface AboutUsModalProps {
  onClose: () => void;
}

const AboutUsModal: React.FC<AboutUsModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 saturate-180 flex justify-center items-center z-50 animate-fade-in p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-card/90 glass-effect border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-lg md:max-w-2xl grid grid-rows-[auto_1fr_auto] max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/95 z-10">
          <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <span className="text-white text-xl sm:text-2xl font-extrabold tracking-tight font-sans">N</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight">
                Sobre a <span className="text-primary">Nexa</span>
              </h2>
          </div>
          <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-cyan-500/20 rounded-full transition-colors duration-300"
              aria-label="Fechar"
          >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 text-gray-300 space-y-5 sm:space-y-6">
          
          {/* Item 1 */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500 shrink-0 mt-1"/>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg mb-1">Nossa Missão</h3>
              <p className="text-sm sm:text-base leading-relaxed text-gray-400 sm:text-gray-300">
                A Nexa surgiu do desejo genuíno de transformar a comunicação entre
                clientes e vendedores. Nosso objetivo é facilitar o entendimento, fortalecer a confiança e criar
                uma experiência mais eficiente para ambos os lados.
              </p>
            </div>
          </div>
          
          {/* Item 2 */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-1"/>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg mb-1">O Que Fazemos</h3>
              <p className="text-sm sm:text-base leading-relaxed text-gray-400 sm:text-gray-300">
                Oferecemos landing pages modernas e personalizadas para a
                sua empresa, desenvolvidas com foco em desempenho, clareza e
                conversão. Unimos criatividade, tecnologia e inovação.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 my-2 sm:my-4"></div>

          {/* Item 3 - Fundadores */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-1"/>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg mb-1">Os Fundadores</h3>
              <p className="text-sm sm:text-base leading-relaxed text-gray-400 sm:text-gray-300">
                A Nexa foi idealizada e criada por dois jovens programadores, <span className="font-semibold text-primary/90">Raul B.</span> e <span className="font-semibold text-primary/90">Kaua M.</span>, apaixonados por transformar ideias em realidade digital.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Action Button */}
        <div className="p-4 sm:p-6 border-t border-gray-800 bg-gray-900/95 z-10">
            <button 
                onClick={onClose} // TODO: This should probably go to pricing
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-2.5 sm:py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out text-sm sm:text-base"
            >
                Vem fazer parte
            </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUsModal;
