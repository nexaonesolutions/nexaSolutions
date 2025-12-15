import React from 'react';
import { X } from 'lucide-react';
import { OptimizedImage } from './Portfolio'; // Assuming OptimizedImage is exported from Portfolio.tsx

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  seed: string;
}

interface PortfolioDetailModalProps {
  item: PortfolioItem;
  onClose: () => void;
}

const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="relative bg-nexa-card/80 border border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row max-h-[90vh] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-nexa-primary/20 rounded-full p-2 transition-colors duration-300 z-20"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Image Section */}
        <div className="md:w-1/2 w-full h-64 md:h-auto rounded-t-2xl md:rounded-l-2xl md:rounded-r-none overflow-hidden">
           {/* Re-using the OptimizedImage component might not be ideal if we want a different behavior/aspect-ratio. Let's create a simpler one for the modal. */}
           <img 
             src={`https://picsum.photos/seed/${item.seed}/1200/900`} 
             alt={item.title} 
             className="w-full h-full object-cover"
           />
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 w-full p-8 md:p-10 flex flex-col overflow-y-auto">
            <div>
                <span className="text-nexa-primary text-xs font-bold tracking-[0.2em] uppercase">{item.category}</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2 mb-6">{item.title}</h2>
                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <h4>Project Highlights</h4>
                    <ul>
                        <li>Advanced UI/UX Design</li>
                        <li>Integration with external APIs</li>
                        <li>Optimized for performance and SEO</li>
                        <li>Fully responsive across all devices</li>
                    </ul>
                </div>
            </div>
            <div className="mt-auto pt-8">
                 <a 
                    href="#" 
                    onClick={(e) => e.preventDefault()} // Prevent navigation for this demo
                    className="inline-block w-full text-center px-8 py-4 bg-nexa-primary text-black rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                >
                    Visit Website
                </a>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PortfolioDetailModal;
