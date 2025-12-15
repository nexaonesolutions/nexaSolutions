
import React, { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePlanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, size, id: Date.now() };
    
    setRipples((prev) => [...prev, newRipple]);

    // Cleanup ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    // Delay navigation slightly to visualize the effect
    setTimeout(() => {
      navigate('/planos');
    }, 300);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nexa-secondary/20 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nexa-primary/20 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Tag Wrapper */}
        <div className="flex justify-center opacity-0 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border-nexa-primary/30 text-nexa-primary text-sm font-medium mb-8 animate-float">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexa-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nexa-primary"></span>
            </span>
            {t('hero.tag')}
          </div>
        </div>
        
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight opacity-0 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          {t('hero.title1')} <br />
          <span className="gradient-text">{t('hero.title2')}</span> {t('hero.title3')}
        </h1>
        
        <p 
          className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 leading-relaxed opacity-0 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          {t('hero.subtitle')}
        </p>
        
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
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
            className="w-full sm:w-auto px-6 sm:px-8 py-4 glass-effect text-white text-lg font-medium rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            {t('hero.cta_secondary')}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        {/* Stats */}
        <div 
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-800 pt-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '800ms' }}
        >
          <div>
            <div className="text-3xl font-bold text-white">300+</div>
            <div className="text-sm text-gray-500 mt-1">{t('hero.stats.projects')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">98%</div>
            <div className="text-sm text-gray-500 mt-1">{t('hero.stats.clients')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">3x</div>
            <div className="text-sm text-gray-500 mt-1">{t('hero.stats.conversion')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">24h</div>
            <div className="text-sm text-gray-500 mt-1">{t('hero.stats.support')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
