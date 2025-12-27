
import React from 'react';
import { Instagram, Linkedin, Twitter, Github, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { footerTheme } from './footerTheme';
import { footerStyle } from './footerStyle';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

interface FooterProps {
  onAboutUsClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAboutUsClick }) => {
  const { t } = useLanguage();

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  return (
    <motion.footer
      id="contact"
      className="relative bg-nexa-dark border-t border-gray-900 pt-16 pb-8"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={footerStyle}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: 'transparent',
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: '#ffffff',
            },
            links: {
              color: '#ffffff',
              distance: 150,
              enable: true,
              opacity: 0.1,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 30,
            },
            opacity: {
              value: 0.1,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-16">
          <motion.div variants={footerStyle} className="col-span-1 md:col-span-1 text-left">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-nexa-primary to-nexa-secondary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-extrabold font-sans">N</span>
              </div>
              <span className="text-xl font-bold text-white">NEXA</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('footer.desc')}
            </p>
          </motion.div>
          
          <motion.div variants={footerStyle} className="text-left">
            <ul className="space-y-4 text-sm text-gray-500">
              <li><button onClick={onAboutUsClick} className="hover:text-nexa-primary transition-colors text-left">{t('footer.links.about')}</button></li>
              <li><Link to="/portfolio" className="hover:text-nexa-primary transition-colors">{t('nav.portfolio')}</Link></li>
              <li><a href="#" className="hover:text-nexa-primary transition-colors">{t('footer.links.careers')}</a></li>
            </ul>
          </motion.div>
          
          <motion.div variants={footerStyle} className="text-left">
            <h4 className="text-white font-bold mb-6">{t('footer.services')}</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/planos" className="hover:text-nexa-primary transition-colors">Landing Pages</Link></li>
              <li><Link to="/manutencao" className="hover:text-nexa-primary transition-colors">{t('nav.maintenance')}</Link></li>
              <li><a href="#" className="hover:text-nexa-primary transition-colors">Design UI/UX</a></li>
            </ul>
          </motion.div>
          
          <motion.div variants={footerStyle} className="text-center md:text-left">
            <h4 className="text-white font-bold mb-6">{t('footer.social')}</h4>
            <div className="flex gap-4 justify-start">
              <motion.a whileHover="hover" whileTap="tap" variants={footerTheme} href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-nexa-primary hover:text-black transition-all">
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a whileHover="hover" whileTap="tap" variants={footerTheme} href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-nexa-primary hover:text-black transition-all">
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a whileHover="hover" whileTap="tap" variants={footerTheme} href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-nexa-primary hover:text-black transition-all">
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a whileHover="hover" whileTap="tap" variants={footerTheme} href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-nexa-primary hover:text-black transition-all">
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a whileHover="hover" whileTap="tap" variants={footerTheme} href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-nexa-primary hover:text-black transition-all">
                <Facebook className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-y-8 md:gap-4 py-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} NEXA Digital. {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-white transition-colors">{t('footer.links.terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.links.privacy')}</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
