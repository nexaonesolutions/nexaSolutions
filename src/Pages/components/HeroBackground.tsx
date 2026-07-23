import React from 'react';
import { motion } from 'framer-motion';
import { Code, Zap, Shield } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const FloatingIcons: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-1/4 left-[10%] text-nexa-primary/20 hidden lg:block"
      >
        <Code size={48} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} 
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
        className="absolute bottom-1/3 right-[10%] text-nexa-secondary/20 hidden lg:block"
      >
        <Zap size={48} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
        className="absolute top-1/3 right-[20%] text-white/10 hidden lg:block"
      >
        <Shield size={32} />
      </motion.div>
    </>
  );
};

export const HeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Reduced blur on mobile: blur-[64px] sm:blur-[128px] to avoid GPU freeze on weak devices */}
      <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-nexa-secondary/20 rounded-full blur-[64px] sm:blur-[128px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-nexa-primary/20 rounded-full blur-[64px] sm:blur-[128px] animate-pulse-slow delay-1000"></div>
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
      <div className="hidden sm:block absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <FloatingIcons />
    </div>
  );
};