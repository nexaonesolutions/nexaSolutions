import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [isPartyMode, setIsPartyMode] = useState(false);

  const handleEasterEgg = () => {
    if (isPartyMode) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setIsPartyMode(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nexa-dark text-white text-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nexa-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      {isPartyMode && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
                left: `${Math.random() * 100}%`,
                top: -20
              }}
              animate={{
                y: ['0vh', '100vh'],
                rotate: [0, 360],
                x: [0, (Math.random() - 0.5) * 200]
              }}
              transition={{
                duration: Math.random() * 2 + 3,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="relative inline-block mb-8">
           <motion.div
             animate={{ 
               y: [0, -10, 0],
               rotate: [0, 5, -5, 0]
             }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           >
             <FileQuestion className="w-32 h-32 text-nexa-primary opacity-80 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
           </motion.div>
        </div>

        <h1 
          onClick={handleEasterEgg}
          className="text-6xl md:text-8xl font-extrabold mb-4 tracking-tight relative cursor-pointer select-none transition-transform active:scale-95"
          title={isPartyMode ? "Party Mode!" : "Clique 5 vezes..."}
        >
          <span className={isPartyMode ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-pulse" : "glitch-text"} data-text="404">404</span>
        </h1>
        <h2 className="text-2xl font-bold mb-4 text-gray-200">
          Página Não Encontrada
        </h2>
        
        <p className="text-gray-400 mb-10 leading-relaxed">
          Opa! Parece que você tentou acessar uma área desconhecida do sistema. O link pode estar quebrado ou a página foi removida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border border-gray-700 hover:bg-gray-800 text-gray-300 transition-all"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-nexa-primary text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-900/20"
          >
            <Home size={18} />
            Ir para o Início
          </Link>

          <button
            onClick={() => {
              const subject = encodeURIComponent("Relato de Link Quebrado (404)");
              const body = encodeURIComponent(`Encontrei um link quebrado em: ${window.location.href}\n\nOrigem: ${document.referrer || 'Desconhecida'}`);
              window.location.href = `mailto:suporte@nexa.com?subject=${subject}&body=${body}`;
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            <AlertTriangle size={18} />
            Reportar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
