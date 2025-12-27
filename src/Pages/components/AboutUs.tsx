
import React, { useRef, useState } from 'react';
import { X, Building, Users, Rocket, Minus, ChevronsLeftRight } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface AboutUsProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToPricing: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ isOpen, onClose, onGoToPricing }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-400, 400], [3, -3]);
  const rotateY = useTransform(x, [-400, 400], [-3, 3]);
  const [isHoveringNexa, setIsHoveringNexa] = useState(false); // Declare isHoveringNexa here

  const letterAnimation = {
    rest: (delay: number) => ({
      y: [0, 0, -10, 0, 0],
      scaleY: [1, 0.8, 1.1, 0.8, 1],
      scaleX: [1, 1.2, 0.9, 1.2, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 1,
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeInOut",
        delay: delay,
      },
    }),
    hover: { y: 0, scaleY: 1, scaleX: 1 },
  };

  const dustAnimation = {
    rest: (custom: { delay: number; x: number; y: number }) => ({
      y: [0, custom.y],
      x: ['-50%', `${custom.x}px`],
      opacity: [0, 0, 1, 0],
      scale: [0, 1, 0],
      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 1, delay: custom.delay, times: [0, 0.79, 0.8, 1], ease: "easeOut" },
    }),
    hover: { opacity: 0 },
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-4"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '2000px' }}
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        className="relative bg-black/60 border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10 w-full max-w-lg md:max-w-2xl grid grid-rows-[auto_1fr_auto] max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        style={{ rotateX, rotateY, transition: 'all 0.1s ease-out' }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 z-10">
          <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-1 font-mono text-sm font-bold tracking-widest select-none"
                onMouseEnter={() => setIsHoveringNexa(true)}
                onMouseLeave={() => setIsHoveringNexa(false)}
              >
                <button 
                  onClick={onClose}
                  className="text-cyan-500 hover:text-red-500 transition-colors w-4 text-center relative group"
                >
                  <motion.span className="group-hover:hidden inline-block relative" variants={letterAnimation} custom={0} animate={isHoveringNexa ? "hover" : "rest"}>
                    N
                    <motion.div className="absolute bottom-[-2px] left-1/2 w-0.5 h-0.5 bg-gray-400/70 rounded-full" style={{ x: "-50%" }} variants={dustAnimation} custom={{delay: 0, x: -6, y: -4}} animate={isHoveringNexa ? "hover" : "rest"} />
                    <motion.div className="absolute bottom-[-2px] left-1/2 w-0.5 h-0.5 bg-gray-400/70 rounded-full" style={{ x: "-50%" }} variants={dustAnimation} custom={{delay: 0, x: 6, y: -4}} animate={isHoveringNexa ? "hover" : "rest"} />
                  </motion.span>
                  <span className="hidden group-hover:block">X</span>
                </button>
                <motion.span 
                  className="text-cyan-500/50 inline-block"
                  variants={letterAnimation}
                  custom={0.1}
                  animate={isHoveringNexa ? "hover" : "rest"}
                >E</motion.span>
                <motion.span 
                  className="text-cyan-500/50 inline-block"
                  variants={letterAnimation}
                  custom={0.2}
                  animate={isHoveringNexa ? "hover" : "rest"}
                >X</motion.span>
                <motion.span 
                  className="text-cyan-500/50 inline-block"
                  variants={letterAnimation}
                  custom={0.3}
                  animate={isHoveringNexa ? "hover" : "rest"}
                >A</motion.span>
              </div>
              <span className="ml-4 text-sm font-mono text-gray-500">Sobre a Nexa</span>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 text-gray-300 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1"><Rocket className="w-5 h-5 text-cyan-400"/></div>
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
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1"><Building className="w-5 h-5 text-cyan-400"/></div>
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
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1"><Users className="w-5 h-5 text-cyan-400"/></div>
            <div>
              <h3 className="font-bold text-white text-lg mb-1">Os Fundadores</h3>
              <p>
                A Nexa foi idealizada e criada por dois jovens programadores, <span className="font-semibold text-nexa-primary/90">Raul B.</span> e <span className="font-semibold text-nexa-primary/90">Kaua M.</span>, apaixonados por transformar ideias em realidade digital.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Action Button */}
        <div className="p-4 sm:p-6 border-t border-gray-800 bg-gray-900/80 z-10">
            <button 
                onClick={onGoToPricing}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border-2 border-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-bold py-2.5 sm:py-3 px-6 rounded-lg shadow-lg hover:shadow-cyan-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out"
            >
                Vem fazer parte
            </button>
        </div>
      </motion.div>
    </div>
  );
};
