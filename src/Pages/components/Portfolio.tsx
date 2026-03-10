import React, { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Image as ImageIcon, Cpu, FolderOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import portfolioData from './portfolio-data.json';
import { ProjectGrid } from './ProjectGrid';
import { ProjectCard } from './ProjectCard';

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

// Componente de Skeleton para carregamento
const PortfolioSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-gray-900/40 rounded-xl overflow-hidden h-[450px] border border-gray-800/50 animate-pulse">
        <div className="h-56 bg-gray-800/50" />
        <div className="p-6 space-y-4">
          <div className="h-7 bg-gray-800/50 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-800/30 rounded w-full" />
            <div className="h-3 bg-gray-800/30 rounded w-5/6" />
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-6 w-20 bg-gray-800/30 rounded-full" />
            <div className="h-6 w-20 bg-gray-800/30 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const Portfolio: React.FC = () => {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setItems(portfolioData);
      setLoading(false);
    }, 800); // Pequeno delay para suavizar a transição e mostrar o skeleton
    return () => clearTimeout(timer);
  }, []);

  // Traduções dinâmicas baseadas no idioma
  const processedItems = useMemo(() => {
    let langKey = 'en';
    if (language === 'pt-BR' || language === 'pt-PT') langKey = 'pt';
    else if (language === 'es') langKey = 'es';

    return items.map(item => ({
      ...item,
      category: item.category[langKey] || item.category['en'],
      description: item.description[langKey] || item.description['en'],
      highlights: item.highlights[langKey] || item.highlights['en'],
    }));
  }, [items, language]);

  const allLabel = t('portfolio.all', 'All');
  const viewProjectLabel = t('portfolio.view_project', 'VIEW PROJECT');

  const [activeFilter, setActiveFilter] = useState(allLabel);

  // Typewriter effect state
  const [typewriterText, setTypewriterText] = useState({ part1: '', part2: '' });

  useEffect(() => {
    const text1 = "SELECTED";
    const text2 = "WORKS";
    let i = 0;

    const timer = setInterval(() => {
      if (i <= text1.length) {
        setTypewriterText(prev => ({ ...prev, part1: text1.slice(0, i) }));
      } else if (i <= text1.length + text2.length) {
        setTypewriterText(prev => ({ ...prev, part2: text2.slice(0, i - text1.length) }));
      } else {
        clearInterval(timer);
      }
      i++;
    }, 100);
    return () => clearInterval(timer);
  }, []);

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

  const [visibleItems, setVisibleItems] = useState(6);

  // Reseta a paginação quando o filtro muda
  useEffect(() => {
    setVisibleItems(6);
  }, [activeFilter]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(0, visibleItems);
  }, [filteredItems, visibleItems]);

  const handleLoadMore = (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("[NEXA] Loading more projects. Current visible:", visibleItems);
    setVisibleItems(prev => prev + 6);
  };

  if (loading) {
    return (
      <section className="py-20 bg-black relative overflow-hidden min-h-screen">
        {/* Background duplicado para consistência visual durante o load */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 pt-10">
            <div className="h-12 w-64 bg-gray-800/50 rounded animate-pulse mb-4" />
            <div className="h-4 w-96 bg-gray-800/30 rounded animate-pulse" />
          </div>
          <PortfolioSkeleton />
        </div>
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
                className={`relative px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 border ${activeFilter === category
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-800'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <ProjectGrid>
            <AnimatePresence mode='popLayout'>
              {paginatedItems.map((item: any) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  key={item.id}
                >
                  <ProjectCard
                    title={item.title}
                    shortDescription={item.description}
                    imageSrc={item.imageUrl}
                    technologies={item.highlights}
                    fullDescription={
                      <div>
                        <p className="text-gray-300 leading-relaxed mb-6">{item.description}</p>
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                          <Cpu size={16} className="text-cyan-500" /> Destaques do Projeto:
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                          {item.highlights.map((highlight: string, index: number) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </ProjectGrid>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-gray-800 rounded-3xl bg-gray-900/20 mt-8"
          >
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('portfolio.no_projects', 'Nenhum projeto encontrado')}</h3>
            <p className="text-gray-500 max-w-md">
              {t('portfolio.no_projects_desc', 'Não há projetos nesta categoria no momento. Tente selecionar outra categoria.')}
            </p>
          </motion.div>
        )}

        {visibleItems < filteredItems.length && (
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-6 text-sm font-mono flex items-center justify-center gap-2">
              <span className="w-12 h-[1px] bg-gray-800"></span>
              Mostrando {Math.min(visibleItems, filteredItems.length)} de {filteredItems.length} projetos
              <span className="w-12 h-[1px] bg-gray-800"></span>
            </p>
            <button
              onClick={handleLoadMore}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-transparent border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/10 transition-all duration-500 hover:border-cyan-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            >
              <span className="font-bold tracking-wider uppercase text-xs">Carregar Mais Projetos</span>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse group-hover:scale-150 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
