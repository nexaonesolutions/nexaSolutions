import React from 'react';
import { motion, MotionValue, useTransform, useMotionTemplate } from 'framer-motion';
import { FileCode, GitBranch, Check, Minus, Square, X } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface HeroMockupProps {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

const CodeLine: React.FC<{ children: React.ReactNode; delay: number; totalDuration: number; lineNumber: number }> = ({ children, delay, totalDuration, lineNumber }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const duration = prefersReducedMotion ? 0 : totalDuration;

  return (
    <div className="flex items-start leading-relaxed group/line">
      <span className="w-8 text-gray-600 text-right mr-4 select-none shrink-0 text-xs font-mono pt-[2px] group-hover/line:text-gray-400 transition-colors">{lineNumber}</span>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 'auto', opacity: 1 }}
        transition={{ duration, delay, ease: 'linear' }}
        className="whitespace-nowrap overflow-hidden text-gray-300 text-xs sm:text-sm font-mono"
      >
        {children}
      </motion.div>
    </div>
  );
};

const CodeAnimator: React.FC = () => {
  // VS Code Dark+ inspired theme
  const Keyword = ({ children }: { children: React.ReactNode }) => <span className="text-[#C586C0]">{children}</span>; // Purple
  const Component = ({ children }: { children: React.ReactNode }) => <span className="text-[#4EC9B0]">{children}</span>; // Teal/Green
  const Function = ({ children }: { children: React.ReactNode }) => <span className="text-[#DCDCAA]">{children}</span>; // Yellow
  const Prop = ({ children }: { children: React.ReactNode }) => <span className="text-[#9CDCFE]">{children}</span>; // Light Blue
  const String = ({ children }: { children: React.ReactNode }) => <span className="text-[#CE9178]">{children}</span>; // Orange
  const Punctuation = ({ children }: { children: React.ReactNode }) => <span className="text-[#D4D4D4]">{children}</span>; // Gray
  const Plain = ({ children }: { children: React.ReactNode }) => <span className="text-[#D4D4D4]">{children}</span>;

  const codeLines = [
    { delay: 0.5, duration: 0.4, content: <><Keyword>import</Keyword> <Plain>React</Plain> <Keyword>from</Keyword> <String>'react'</String><Punctuation>;</Punctuation></> },
    { delay: 1.0, duration: 0.6, content: <><Keyword>import</Keyword> <Punctuation>{'{'}</Punctuation> <Component>Hero</Component> <Punctuation>{'}'}</Punctuation> <Keyword>from</Keyword> <String>'./components'</String><Punctuation>;</Punctuation></> },
    { delay: 1.7, duration: 0.0, content: <br/> },
    { delay: 1.8, duration: 0.8, content: <><Keyword>export</Keyword> <Keyword>const</Keyword> <Function>App</Function> <Punctuation>=</Punctuation> <Punctuation>()</Punctuation> <Keyword>=&gt;</Keyword> <Punctuation>{'{'}</Punctuation></> },
    { delay: 2.7, duration: 0.4, content: <><Plain>&nbsp;&nbsp;</Plain><Keyword>return</Keyword> <Punctuation>(</Punctuation></> },
    { delay: 3.2, duration: 0.6, content: <><Plain>&nbsp;&nbsp;&nbsp;&nbsp;</Plain><Punctuation>&lt;</Punctuation><Component>Hero</Component></> },
    { delay: 3.9, duration: 0.8, content: <><Plain>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Plain><Prop>title</Prop><Punctuation>=</Punctuation><String>"Inovação Digital"</String></> },
    { delay: 4.8, duration: 0.8, content: <><Plain>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Plain><Prop>subtitle</Prop><Punctuation>=</Punctuation><String>"Transforme o Futuro"</String></> },
    { delay: 5.7, duration: 0.5, content: <><Plain>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Plain><Prop>fullWidth</Prop></> },
    { delay: 6.3, duration: 0.4, content: <><Plain>&nbsp;&nbsp;&nbsp;&nbsp;</Plain><Punctuation>/&gt;</Punctuation></> },
    { delay: 6.8, duration: 0.3, content: <><Plain>&nbsp;&nbsp;</Plain><Punctuation>);</Punctuation></> },
    { delay: 7.2, duration: 0.3, content: <><Punctuation>{'};'}</Punctuation></> },
  ];

  const lastLine = codeLines[codeLines.length - 1];
  const totalAnimationTime = lastLine.delay + lastLine.duration;

  return (
    <div className="flex flex-col font-mono">
      {codeLines.map((line, index) => (
        <CodeLine key={index} delay={line.delay} totalDuration={line.duration} lineNumber={index + 1}>
          {line.content}
        </CodeLine>
      ))}
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: totalAnimationTime }}
      >
         <span className="w-8 mr-4 shrink-0"></span>
         <motion.span
            className="w-2 h-4 bg-nexa-primary inline-block"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              times: [0, 0.5, 0.5, 1],
              ease: "linear",
            }}
          />
      </motion.div>
    </div>
  );
};

export const HeroMockup: React.FC<HeroMockupProps> = ({ rotateX, rotateY }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const codeX = useTransform(rotateY, [-5, 5], [-15, 15]);
  const codeY = useTransform(rotateX, [-5, 5], [-15, 15]);

  const glareX = useTransform(rotateY, [-5, 5], ["0%", "100%"]);
  const glareY = useTransform(rotateX, [-5, 5], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.15) 0%, transparent 60%)`;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.5, ease: "easeOut" }}
      style={{ rotateX, rotateY, perspective: 1200, transformStyle: "preserve-3d" }}
      className="mt-16 relative w-full max-w-3xl mx-auto hidden md:block"
    >
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.01, y: -5, boxShadow: "0 25px 50px -12px rgba(34, 211, 238, 0.15)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative bg-[#1e1e1e] border border-gray-800 rounded-lg shadow-2xl overflow-hidden group"
      >
        {/* Editor Header */}
        <div 
          className="h-9 bg-[#2d2d2d] border-b border-[#1e1e1e] flex items-center px-4 justify-between select-none shadow-sm"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex gap-2 group/traffic">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] group-hover/traffic:brightness-90 transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] group-hover/traffic:brightness-90 transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] group-hover/traffic:brightness-90 transition-all" />
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 bg-[#1e1e1e] rounded-t-md text-xs text-gray-300 border-t border-l border-r border-transparent shadow-sm">
            <FileCode size={12} className="text-[#4EC9B0]" />
            <span>App.tsx</span>
          </div>
          
          <div className="flex gap-3 opacity-50">
             <Minus size={12} className="text-gray-400" />
             <Square size={10} className="text-gray-400" />
             <X size={12} className="text-gray-400" />
          </div>
        </div>
        
        {/* Editor Body */}
        <div className="p-4 sm:p-6 bg-[#1e1e1e] min-h-[300px] relative overflow-hidden" style={{ transform: "translateZ(0px)" }}>
          <motion.div style={{ x: codeX, y: codeY }}>
            <CodeAnimator />
          </motion.div>
        </div>
        
        {/* Status Bar */}
        <div 
          className="h-6 bg-[#007acc] flex items-center px-3 text-[10px] text-white justify-between font-sans select-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
          style={{ transform: "translateZ(20px)" }}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded cursor-pointer"><GitBranch size={10} /> <span>main</span></div>
                <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded cursor-pointer"><Check size={10} /> <span>0 errors</span></div>
            </div>
            <div className="flex items-center gap-3">
                <span className="hover:bg-white/10 px-1 rounded cursor-pointer">Ln 12, Col 1</span>
                <span className="hover:bg-white/10 px-1 rounded cursor-pointer">UTF-8</span>
                <span className="hover:bg-white/10 px-1 rounded cursor-pointer">TypeScript React</span>
            </div>
        </div>
        
        {/* Glow Effect Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-nexa-primary/5 via-transparent to-nexa-secondary/5 pointer-events-none mix-blend-overlay" 
          style={{ transform: "translateZ(40px)" }}
        />
        
        {/* Dynamic Glare */}
        <motion.div 
          className="absolute inset-0 rounded-lg pointer-events-none mix-blend-overlay"
          style={{ background: glareBackground, transform: "translateZ(60px)" }}
        />
      </motion.div>
    </motion.div>
  );
};