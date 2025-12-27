import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, ExternalLink, ChevronRight, Code, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  liveUrl: string;
  description: string;
  highlights: string[];
}

interface PortfolioDetailModalProps {
  item: PortfolioItem;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

// Subcomponente para o conteúdo do projeto para isolar o estado e animação
const ProjectContent: React.FC<{ item: PortfolioItem }> = ({ item }) => {
  const [typedDescription, setTypedDescription] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    if (item.description) {
      setTypedDescription('');
      setIsTyping(true);
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < item.description.length) {
          setTypedDescription(prev => prev + item.description.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 15); // Velocidade da digitação
      return () => clearInterval(typingInterval);
    }
  }, [item.description]);

  useEffect(() => {
    const scrollableElement = scrollRef.current;

    const checkScroll = () => {
      if (scrollableElement) {
        const isScrollable = scrollableElement.scrollHeight > scrollableElement.clientHeight;
        const isAtBottom = scrollableElement.scrollHeight - scrollableElement.scrollTop <= scrollableElement.clientHeight + 2; // 2px buffer
        setShowScrollIndicator(isScrollable && !isAtBottom);
      }
    };

    const checkTimer = setTimeout(checkScroll, 500); // Check after content renders
    
    scrollableElement?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(checkTimer);
      scrollableElement?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [item, typedDescription]); // Re-check as typewriter adds content

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col lg:flex-row h-full w-full"
    >
      {/* Seção da Imagem */}
      <div className="w-full lg:w-3/5 relative group border-b lg:border-b-0 lg:border-r border-cyan-900/20 bg-black h-64 sm:h-80 lg:h-auto shrink-0 overflow-hidden">
          <motion.img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
          />
          {/* Cyberpunk Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-cyan-900/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.7)_50%)] bg-[size:100%_2px] opacity-30 animate-scanline pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_0_80px_20px_rgba(0,0,0,0.9)] pointer-events-none" />
      </div>

      {/* Seção de Detalhes */}
      <div 
        ref={scrollRef}
        className="relative w-full lg:w-2/5 bg-black/40 backdrop-blur-xl font-mono p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col flex-1 min-h-0 touch-pan-y"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Top Fade */}
        <div className="sticky top-0 z-10 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 h-12 bg-gradient-to-b from-black to-transparent pointer-events-none shrink-0" />

        <div className="flex-grow space-y-6">
          {/* Detalhes do Projeto */}
          <div className="terminal-command">
            <div className="pl-4 text-gray-200 text-sm leading-relaxed mt-2 ml-2">
                <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight glitch-text" data-text={item.title}>{item.title}</h2>
                <p className="text-cyan-400/80">{item.category}</p>
            </div>
          </div>

          {/* Descrição do Projeto */}
          <div className="terminal-command">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line min-h-[120px] border-l-2 border-cyan-900/30 pl-4 mt-2 ml-2">
              {typedDescription}
              {isTyping && <span className="animate-pulse bg-white w-2 h-4 inline-block ml-1"></span>}
            </p>
          </div>

          {/* Destaques (Highlights) */}
          <div className="terminal-command pt-4 border-t border-cyan-900/20">
            <p className="text-cyan-400 text-xs flex items-center gap-2 mb-3"><Code size={14} /><span>Tecnologias e Destaques</span></p>
            <ul className="space-y-2 pl-4 mt-2 ml-2">
              {item.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm group">
                  <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Botão de Ação - movido para o final com flexbox */}
        <div className="mt-auto pt-6">
            <a 
                href={item.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full group relative px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border-2 border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all duration-300 rounded-lg block text-center"
            >
              <div className="absolute inset-0 w-1 bg-cyan-500 transition-all duration-300 group-hover:w-full opacity-10" />
              <div className="relative flex items-center justify-center gap-2 font-mono uppercase tracking-widest text-sm">
                <span>Acessar Projeto</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
        </div>

        {/* Bottom Fade */}
        <div className="sticky bottom-0 z-10 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none shrink-0" />

        {showScrollIndicator && (
          <div className="sticky bottom-0 w-full flex justify-center pointer-events-none py-2 z-20">
            <motion.div
              className="w-8 h-8 bg-cyan-900/50 border border-cyan-500/30 rounded-full flex items-center justify-center"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({ item, onClose, onNext, onPrev }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHoveringNexa, setIsHoveringNexa] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Parallax effect logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-400, 400], [3, -3]);
  const rotateY = useTransform(x, [-400, 400], [-3, 3]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!modalRef.current || isMaximized) return;
    const rect = modalRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      handleClose();
    }
  };

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Aguarda a animação terminar
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMaximized) {
          setIsMaximized(false);
        } else {
          handleClose();
        }
      }
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, isMaximized]);

  return createPortal(
    <div 
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${isMaximized ? 'p-0' : 'p-4 sm:p-6'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '2000px' }}
    >
      {/* Backdrop com Blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Janela do Terminal */}
      <motion.div 
        ref={modalRef}
        drag={isMaximized ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        className={`relative bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col 
          ${isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-5xl rounded-lg'}
          ${isMinimized ? 'h-auto' : (isMaximized ? 'h-full' : 'max-h-[85vh] lg:h-[600px] lg:max-h-[90vh]')}
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
        style={{ rotateX, rotateY, transition: 'all 0.1s ease-out' }}
      >
        {/* Visual Drag Handle */}
        {!isMaximized && (
          <motion.div 
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full sm:hidden z-50 pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Cabeçalho do Terminal */}
        <div 
          className="bg-gray-900/90 border-b border-gray-800 p-3 flex items-center justify-between select-none shrink-0 cursor-grab active:cursor-grabbing"
          onDoubleClick={handleMaximize}
        >
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-1 font-mono text-sm font-bold tracking-widest select-none"
              onMouseEnter={() => setIsHoveringNexa(true)}
              onMouseLeave={() => setIsHoveringNexa(false)}
            >
              <button 
                onClick={handleClose}
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
            <div className="ml-4 flex items-center gap-2 text-xs font-mono text-gray-500">
              <Terminal className="w-3 h-3" />
              <span>{item.title}</span>
            </div>
          </div>
          <div className="text-xs font-mono text-cyan-500/50 hidden sm:block">
            NEXA_OS
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className={`flex-1 overflow-hidden relative bg-black/20 transition-[height] duration-300 ${isMinimized ? 'h-0' : 'h-full'}`}>
          {!isMinimized && (
            <AnimatePresence mode="wait">
                <ProjectContent key={item.id} item={item} />
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
    , document.body
  );
};

export default PortfolioDetailModal;