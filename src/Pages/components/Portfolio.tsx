import React, { useState, useMemo } from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PortfolioDetailModal from './PortfolioDetailModal';

const items = [
  { id: 1, title: "Beauty", category: "Cosmetics", imageUrl: "/Portfolio/Beauty.jpeg" },
  { id: 2, title: "Cineverse", category: "Entertainment", imageUrl: "/Portfolio/Cineverse.jpeg" },
  { id: 3, title: "Imperial", category: "Jewelry", imageUrl: "/Portfolio/Imperial.jpeg" },
  { id: 4, title: "Scatambulo", category: "Consulting", imageUrl: "/Portfolio/Scatambulo.jpeg" },
  { id: 5, title: "UrbanCut", category: "Barbershop", imageUrl: "/Portfolio/UrbanCut.jpeg" },
];

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
}

export const OptimizedImage = ({ imageUrl, title }: { imageUrl: string; title: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center z-0">
          <ImageIcon className="w-8 h-8 text-gray-700 opacity-50" />
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={title} 
        width="800"
        height="600"
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transform transition-transform duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 grayscale group-hover:grayscale-0
          ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}
        `}
      />
    </div>
  );
};

export const Portfolio: React.FC = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(item => item.category)))], []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') {
      return items;
    }
    return items.filter(item => item.category === activeFilter);
  }, [activeFilter]);
  
  const handleItemClick = (item: PortfolioItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };


  return (
    <section className="py-12 bg-nexa-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
            <p className="text-gray-400 text-lg max-w-2xl">
                {t('portfolio.intro')}
            </p>
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <button 
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                            activeFilter === category 
                            ? 'bg-nexa-primary text-black' 
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-gray-800 bg-gray-900 transition-all duration-500
                hover:border-nexa-primary/80 hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)] hover:-translate-y-1
              "
            >
              {/* Image Component with Lazy Loading */}
              <OptimizedImage imageUrl={item.imageUrl} title={item.title} />

              {/* Shine/Reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20"></div>

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 z-20 pointer-events-none"></div>
              
              {/* Content Information */}
              <div className="absolute bottom-0 left-0 p-8 z-30 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <div className="overflow-hidden mb-2">
                  <span className="text-nexa-primary text-xs font-bold tracking-[0.2em] uppercase block transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors duration-300">{item.title}</h3>
                <div className="h-1 w-0 group-hover:w-12 bg-nexa-primary mt-4 transition-all duration-500 delay-100 rounded-full"></div>
              </div>

              {/* External Link Icon appearing on hover */}
              <div className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0 delay-100">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 hover:scale-110 transition-all">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedItem && (
        <PortfolioDetailModal item={selectedItem} onClose={closeModal} />
      )}
    </section>
  );
};
