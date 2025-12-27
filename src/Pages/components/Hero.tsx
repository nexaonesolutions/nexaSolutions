import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import AnimatedStat from './AnimatedStat';
import { useRipple } from '../../hooks/useRipple';
import { useParallax } from '../../hooks/useParallax';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { HeroBackground } from './HeroBackground';
import { HeroMockup } from './HeroMockup';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { ripples, createRipple } = useRipple();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { rotateX, rotateY } = useParallax(containerRef, { offsetX: [-5, 5], offsetY: [5, -5] });

  const handlePlanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    createRipple(e);

    // Delay navigation slightly to visualize the effect
    setTimeout(() => {
      navigate('/planos');
    }, 300);
  };
  
  const initial = prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 };
  const transition = (delay: number) => prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden"
    >
      {/* Background Elements */}
      <HeroBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Tag Wrapper */}
        <motion.div 
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0)}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-nexa-primary/30 text-nexa-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexa-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nexa-primary"></span>
            </span>
            {t('hero.tag')}
          </div>
        </motion.div>
        
        <motion.h1 
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.2)}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight relative"
        >
          <span className="glitch-text" data-text={t('hero.title1')}>
            {t('hero.title1')}
          </span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexa-primary to-nexa-secondary animate-gradient-x">{t('hero.title2')}</span> 
          <span className="glitch-text" data-text={t('hero.title3')}>{t('hero.title3')}</span>
        </motion.h1>
        
        <motion.p 
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.4)}
          className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>
        
        <motion.div 
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.6)}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a 
            href="/planos"
            onClick={handlePlanClick}
            className="group relative w-full sm:w-auto justify-center px-6 sm:px-8 py-4 bg-white text-black text-lg font-bold rounded-full overflow-hidden flex items-center gap-2 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all duration-300 cursor-pointer"
          >
            {/* Ripple Effects */}
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="absolute bg-black/10 rounded-full animate-ripple pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
            
            <span className="relative z-10">{t('hero.cta_primary')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-nexa-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out z-0 opacity-20"></div>
          </a>
          
          <Link 
            to="/portfolio" 
            className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white text-lg font-medium rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            {t('hero.cta_secondary')}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </motion.div>

        {/* 3D Mockup Visual */}
        <HeroMockup rotateX={rotateX} rotateY={rotateY} />

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-800 pt-10"
        >
          <AnimatedStat value={300} suffix="+" label={t('hero.stats.projects')} />
          <AnimatedStat value={98} suffix="%" label={t('hero.stats.clients')} />
          <AnimatedStat value={3} suffix="x" label={t('hero.stats.conversion')} />
          <AnimatedStat value={24} suffix="h" label={t('hero.stats.support')} />
        </motion.div>
      </div>
    </section>
  );
};
