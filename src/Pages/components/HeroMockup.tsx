import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { Globe } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface HeroMockupProps {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

const CodeLine: React.FC<{ children: React.ReactNode; delay: number; totalDuration: number }> = ({ children, delay, totalDuration }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const duration = prefersReducedMotion ? 0 : totalDuration;

  return (
    <motion.p
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{ duration, delay, ease: 'linear' }}
      className="whitespace-nowrap overflow-hidden text-gray-400"
    >
      {children}
    </motion.p>
  );
};

const CodeAnimator: React.FC = () => {
  const Tag = ({ children }: { children: React.ReactNode }) => <span className="text-pink-400">{children}</span>;
  const Attr = ({ children }: { children: React.ReactNode }) => <span className="text-green-400">{children}</span>;
  const Str = ({ children }: { children: React.ReactNode }) => <span className="text-yellow-300">{children}</span>;
  const Plain = ({ children }: { children: React.ReactNode }) => <span className="text-gray-200">{children}</span>;

  const codeLines = [
    { delay: 1.0, duration: 0.8, content: <><Tag>&lt;HeroSection</Tag> <Attr>client:visible</Attr><Tag>&gt;</Tag></> },
    { delay: 2.0, duration: 0.5, content: <><Plain>  &lt;</Plain><Tag>Title</Tag><Plain>&gt;</Plain></> },
    { delay: 2.7, duration: 1.8, content: <Plain>    Transforme sua Visão em Realidade Digital.</Plain> },
    { delay: 4.7, duration: 0.5, content: <><Plain>  &lt;/</Plain><Tag>Title</Tag><Plain>&gt;</Plain></> },
    { delay: 5.4, duration: 1.5, content: <><Plain>  &lt;</Plain><Tag>Button</Tag> <Attr>href</Attr>=<Str>"/planos"</Str><Plain>&gt;</Plain></> },
    { delay: 7.1, duration: 0.8, content: <><Plain>    Comece Agora</Plain></> },
    { delay: 8.1, duration: 0.5, content: <><Plain>  &lt;/</Plain><Tag>Button</Tag><Plain>&gt;</Plain></> },
    { delay: 8.8, duration: 0.8, content: <><Tag>&lt;/HeroSection&gt;</Tag></> },
  ];

  const totalAnimationTime = codeLines[codeLines.length - 1].delay + codeLines[codeLines.length - 1].duration;

  return (
    <>
      {codeLines.map((line, index) => (
        <CodeLine key={index} delay={line.delay} totalDuration={line.duration}>
          {line.content}
        </CodeLine>
      ))}
      <motion.span
        className="w-2 h-4 bg-nexa-primary inline-block ml-1"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: totalAnimationTime + 0.2 }}
      />
    </>
  );
};

export const HeroMockup: React.FC<HeroMockupProps> = ({ rotateX, rotateY }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.8, ease: "easeOut" }}
      style={{ rotateX, rotateY, perspective: 1200 }}
      className="mt-20 relative w-full max-w-5xl mx-auto"
    >
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -10, boxShadow: "0 25px 50px -12px rgba(34, 211, 238, 0.25)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative bg-nexa-card/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden transform-style-3d group"
      >
        {/* Cabeçalho do Mockup */}
        <div className="h-10 bg-gray-900/80 border-b border-white/5 flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="mx-auto bg-black/40 px-4 py-1 rounded-md text-[10px] text-gray-500 font-mono flex items-center gap-2">
            <Globe size={10} /> nexa-digital.com
          </div>
        </div>
        
        {/* Corpo do Mockup com animação de código */}
        <div className="p-6 font-mono text-xs h-[300px] opacity-80 overflow-hidden">
          <CodeAnimator />
        </div>
        
        {/* Gradiente de sobreposição para profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-nexa-dark via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};