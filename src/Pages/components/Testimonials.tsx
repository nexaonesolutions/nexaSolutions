import React, { useState, useMemo, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Helper for star ratings
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1 text-nexa-primary">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-600'}`} />
    ))}
  </div>
);

export const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const rawItems = t('testimonials.items');
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = useMemo(() => [
    { id: 1, name: "Ricardo Silva", company: "StartTech", data: rawItems[0], avatarUrl: "https://picsum.photos/seed/avatar1/100/100", rating: 5 },
    { id: 2, name: "Mariana Costa", company: "Beleza Pura", data: rawItems[1], avatarUrl: "https://picsum.photos/seed/avatar2/100/100", rating: 5 },
    { id: 3, name: "Felipe Santos", company: "FS Consultoria", data: rawItems[2], avatarUrl: "https://picsum.photos/seed/avatar3/100/100", rating: 4 },
    { id: 4, name: "Juliana Alves", company: "Gourmet Foods", data: { ...rawItems[0], content: "A visibilidade da nossa marca cresceu exponencialmente. O design intuitivo e moderno da nossa nova landing page foi um sucesso." }, avatarUrl: "https://picsum.photos/seed/avatar4/100/100", rating: 5 },
    { id: 5, name: "Bruno Gomes", company: "Inova Fitness", data: { ...rawItems[1], content: "Estamos extremamente satisfeitos com o resultado. A página superou nossas expectativas em performance e design." }, avatarUrl: "https://picsum.photos/seed/avatar5/100/100", rating: 5 },
  ], [rawItems]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
   useEffect(() => {
    const slideInterval = setInterval(nextTestimonial, 5000); // Auto-slide every 5 seconds
    return () => clearInterval(slideInterval);
  }, [currentIndex]);

  return (
    <section id="testimonials" className="py-24 bg-nexa-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-nexa-primary/5 rounded-full blur-[80px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('testimonials.title')}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-nexa-primary to-nexa-secondary mx-auto rounded-full"></div>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden relative h-[420px] sm:h-[320px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="absolute w-full h-full transition-all duration-500 ease-in-out"
                style={{
                  transform: `translateX(${(index - currentIndex) * 100}%) scale(0.8)`,
                  opacity: index === currentIndex ? 1 : 0,
                }}
              >
                <div 
                  className="bg-nexa-dark border border-gray-800 p-8 rounded-2xl relative h-full flex flex-col justify-between transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `scale(${index === currentIndex ? 1 : 0.8})`,
                  }}
                >
                  <Quote className="w-10 h-10 text-gray-800 absolute top-6 right-6" />
                  <div className="flex-1">
                    <StarRating rating={testimonial.rating} />
                    <p className="text-gray-300 leading-relaxed my-6 relative z-10">
                      "{testimonial.data.content}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-auto">
                    <img 
                      src={testimonial.avatarUrl} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full border-2 border-nexa-primary/30"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-gray-500">{testimonial.data.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute top-1/2 -left-4 md:-left-16 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 hover:scale-110 transition-all z-20"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute top-1/2 -right-4 md:-right-16 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 hover:scale-110 transition-all z-20"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
