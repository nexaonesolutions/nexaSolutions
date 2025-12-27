import React, { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Image as ImageIcon, Cpu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import portfolioData from './portfolio-data.json';
import { ProjectGrid } from './ProjectGrid';
import { ProjectCard } from './ProjectCard';
import cardStyles from './ProjectCard.module.css';

interface PortfolioItem {
  id: number;
  title: string;
  category: { [key: string]: string };
  imageUrl: string;
  liveUrl: string;
  githubUrl?: string;
  description: { [key: string]: string };
  highlights: { [key: string]: string[] };
}

export const OptimizedImage = ({ imageUrl, title }: { imageUrl: string; title: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center z-0">
          <ImageIcon className="w-8 h-8 text-gray-700 opacity-50" />
        </div>
      )}
      <picture>
        <source srcSet={imageUrl.replace('.jpg', '.webp')} type="image/webp" media="(max-width: 768px)" />
        <source srcSet={imageUrl.replace('.jpg', '.webp')} type="image/webp" />
        <img
          src={imageUrl}
          alt={title}
          width="800"
          height="600"
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transform transition-all duration-500 ease-in-out group-hover:scale-105
          ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}
        `}
        />
      </picture>
    </div>
  );
};

export const Portfolio: React.FC = () => {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setItems(portfolioData);
    setLoading(false);
  }, []);
  
  // Traduções dinâmicas baseadas no idioma
  const processedItems = useMemo(() => {
    const lang = language || 'en';
    return items.map(item => ({
      ...item,
      category: item.category[lang] || item.category['en'],
      description: item.description[lang] || item.description['en'],
      highlights: item.highlights[lang] || item.highlights['en'],
    }));
  }, [items, language]);

  const allLabel = t('portfolio.all', 'All');
  const viewProjectLabel = t('portfolio.view_project', 'VIEW PROJECT');

  const [activeFilter, setActiveFilter] = useState(allLabel);

  // Typewriter effect state
  const [typewriterText, setTypewriterText] = useState({ part1: '', part2: '' });

  const typingAudio = useMemo(() => new Audio('/sounds/typing.mp3'), []);

  useEffect(() => {
    const text1 = "SELECTED";
    const text2 = "WORKS";
    let i = 0;

    // Função para tocar o som de tecla
    const playTypingSound = () => {
      typingAudio.volume = 0.15; // Volume sutil
      typingAudio.currentTime = 0;
      typingAudio.play().catch(() => {}); // Ignora bloqueios de autoplay do navegador
    };

    const timer = setInterval(() => {
      if (i <= text1.length) {
        setTypewriterText(prev => ({ ...prev, part1: text1.slice(0, i) }));
        if (i > 0 && i < text1.length) playTypingSound();
      } else if (i <= text1.length + text2.length) {
        setTypewriterText(prev => ({ ...prev, part2: text2.slice(0, i - text1.length) }));
        if (i > text1.length && i < text1.length + text2.length) playTypingSound();
      } else {
        clearInterval(timer);
      }
      i++;
    }, 100);
    return () => clearInterval(timer);
  }, [typingAudio]);

  // Reseta o filtro quando o idioma muda para evitar inconsistências
  useEffect(() => {
    setActiveFilter(allLabel);
  }, [language, allLabel]);

  const categories = useMemo(() => [allLabel, ...Array.from(new Set(processedItems.map(item => item.category)))], [processedItems, allLabel]);

  const filteredItems = useMemo(() => {
    if (activeFilter === allLabel) {
      return processedItems;
    }
    return processedItems.filter(item => item.category === activeFilter);
  }, [activeFilter, processedItems, allLabel]);
  
  const [visibleItems, setVisibleItems] = useState(3);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(0, visibleItems);
  }, [filteredItems, visibleItems]);

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 3);
  };

  if (loading) {
    return (
      <section className="py-20 bg-black relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-cyan-400">Loading Portfolio...</div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black relative overflow-hidden min-h-screen">
      {/* Cyberpunk Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
      
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 border-b border-cyan-900/30 pb-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2 text-cyan-500">
                <Cpu className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-mono tracking-[0.2em] uppercase">System.Portfolio.Init</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight min-h-[3.5rem]">
                <span className="text-cyan-400">{typewriterText.part1}</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {typewriterText.part2}
                </span>
                <span className="animate-pulse text-cyan-400 ml-1">_</span>
              </h2>
              <p className="text-gray-400 text-lg font-light border-l-2 border-cyan-500/50 pl-4">
                {t('portfolio.intro')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <button 
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={`relative px-5 py-2 text-sm font-mono uppercase tracking-wider transition-all duration-300 border-l-2 [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)] ${
                            activeFilter === category 
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.3)]' 
                            : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-cyan-500/50'
                        }`}
                    >
                        {category}
                        {activeFilter === category && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 shadow-[0_0_15px_2px_rgba(34,211,238,0.5)]" />
                        )}
                    </button>
                ))}
            </div>
        </div>

        {paginatedItems.length > 0 ? (
          <ProjectGrid>
            {paginatedItems.map((item: any) => (
              <ProjectCard
                key={item.id}
                title={item.title}
                shortDescription={item.description}
                imageSrc={item.imageUrl}
                technologies={item.highlights}
                fullDescription={
                  <div>
                    <p>{item.description}</p>
                    <h4 className={cardStyles.modalSubheading}>
                      Destaques do Projeto:
                    </h4>
                    <ul className={cardStyles.modalList}>
                      {item.highlights.map((highlight: string, index: number) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <a 
                        href={item.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cardStyles.modalButton}
                      >
                        Ver Projeto Online <ExternalLink size={16} />
                      </a>
                      {item.githubUrl && (
                        <a 
                          href={item.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`${cardStyles.modalButton} ${cardStyles.modalButtonSecondary}`}
                        >
                          Ver Código
                        </a>
                      )}
                    </div>
                  </div>
                }
              />
            ))}
          </ProjectGrid>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-500 mt-8"
          >
            Nenhum projeto encontrado nesta categoria.
          </motion.div>
        )}
        
        {visibleItems < filteredItems.length && (
          <div className="mt-16 text-center">
            <button
              onClick={handleLoadMore}
              className="group relative px-8 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border-2 border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all duration-300 rounded-lg"
            >
              <div className="absolute inset-0 w-1 bg-cyan-500 transition-all duration-300 group-hover:w-full opacity-10" />
              <div className="relative flex items-center justify-center gap-2 font-mono uppercase tracking-widest text-sm">
                <span>Load More</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
