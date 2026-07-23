import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthSafe } from '../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { Menu, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Only run infinite animations on desktop (non-touch) to avoid mobile GPU overhead
const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

interface NavbarProps {
  onAboutUsClick: () => void;
  flow?: 'landing' | 'purchase'; // Added flow prop
}

export const Navbar: React.FC<NavbarProps> = ({ onAboutUsClick, flow = 'landing' }) => { // Default flow to 'landing'
  const { t } = useLanguage();
  const auth = useAuthSafe();
  const user = auth?.user || null;
  const logout = auth?.logout || (() => { });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isHoveringNexa, setIsHoveringNexa] = useState(false);
  const location = useLocation();

  const letterAnimation = {
    rest: (delay: number) => isTouch ? {} : ({
      y: [0, 0, -10, 0, 0],
      scaleY: [1, 0.8, 1.1, 0.8, 1],
      scaleX: [1, 1.2, 0.9, 1.2, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 1,
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeInOut",
        delay: delay,
      },
    }),
    hover: { y: 0, scaleY: 1, scaleX: 1 },
  };

  const dustAnimation = {
    rest: (custom: { delay: number; x: number; y: number }) => isTouch ? {} : ({
      y: [0, custom.y],
      x: ['-50%', `${custom.x}px`],
      opacity: [0, 0, 1, 0],
      scale: [0, 1, 0],
      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 1, delay: custom.delay, times: [0, 0.79, 0.8, 1], ease: "easeOut" },
    }),
    hover: { opacity: 0 },
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efeito para garantir o scroll para a seção correta ao navegar entre páginas
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // Definition of NavItem type
  interface NavItem {
    name: string;
    href: string;
  }

  const truncate = (s: string, max = 18) => {
    if (!s) return '';
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  };

  // Navigation items for the Landing Page
  const landingNavItems: NavItem[] = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.portfolio'), href: '/portfolio' },
    { name: t('nav.plans'), href: '/planos' },
    { name: t('nav.testimonials'), href: '/#testimonials' },
  ];

  // Navigation items for the plan purchase flow
  const purchaseNavItems: NavItem[] = [
    { name: t('nav.backToPlans'), href: '/planos' }, // Using literal string for now
    { name: t('nav.support'), href: '/suporte' }, // Using literal string for now
  ];

  // Choose the set of links based on the 'flow' prop
  const currentNavItems = flow === 'landing' ? landingNavItems : purchaseNavItems;

  const AuthButton: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
    // Base classes for the logout/login buttons
    const primaryButtonClasses = "px-5 py-2.5 bg-gradient-to-r from-nexa-primary to-nexa-secondary text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity";
    const authActionClasses = `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isMobile ? 'w-full justify-center' : ''}`;

    if (user) {
      return (
        <div className={`flex items-center ${isMobile ? 'w-full flex-col gap-4' : 'gap-3'}`}>
          {!isMobile && (
            <>
              <Link to="/perfil" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors group mr-2 whitespace-nowrap">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-600 group-hover:border-nexa-primary transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xs border border-gray-600 group-hover:border-nexa-primary transition-colors">
                    {(user.name || 'U').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                  </div>
                )}
                <span className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Olá,</span>
                  <span className="font-bold text-white group-hover:text-nexa-primary max-w-[10rem] truncate">{truncate((user.name || '').split(' ')[0], 18)}</span>
                </span>
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold rounded-lg hover:bg-amber-500/30 transition-all whitespace-nowrap"
                >
                  Painel Admin
                </Link>
              )}
              <Link
                to="/perfil"
                className={`${primaryButtonClasses} flex items-center justify-center`}
              >
                {t('auth.profile')}
              </Link>
              <button
                onClick={() => logout()}
                className={`${authActionClasses} bg-white/5 text-gray-300 hover:bg-red-500/20 hover:text-red-300`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
          {isMobile && (
            <>
              <div className="flex items-center gap-3 w-full px-2 mb-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-nexa-primary"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm border-2 border-nexa-primary">
                    {(user.name || 'U').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Logado como</span>
                  <span className="font-bold text-white">{user.name}</span>
                </div>
              </div>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-5 py-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold rounded-lg text-center mb-2"
                >
                  Painel Admin
                </Link>
              )}
              <Link
                to="/perfil"
                onClick={() => setIsMenuOpen(false)}
                className={`${primaryButtonClasses} block w-full text-left`}
              >
                {t('auth.profile')}
              </Link>
              <button
                onClick={() => logout()}
                className={`${authActionClasses} bg-red-500/10 text-red-400`}
              >
                <LogOut className="w-4 h-4" />
                <span>{t('auth.logout')}</span>
              </button>
            </>
          )}
        </div>
      );
    }
    return (
      <Link
        to="/login"
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
        className={`${authActionClasses} ${isMobile
            ? 'bg-nexa-primary text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
          }`}
      >
        <LogIn className="w-4 h-4" />
        <span>{t('auth.login')}</span>
      </Link>
    );
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (id.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const targetId = id.substring(2);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled || isMenuOpen ? 'glass-effect' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" aria-label="NEXA - Ir para a página inicial" className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-nexa-primary to-nexa-secondary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-extrabold font-sans">N</span>
              </div>
              <span className="text-xl font-bold text-white">Nexa Solutions</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {currentNavItems.map(item => (
                <NavLink key={item.name} to={item.href} end={item.href === '/'} onClick={(e) => handleScroll(e, item.href)} className={({ isActive }) => {
                  const isHashLink = item.href.includes('#');
                  const isActuallyActive = isHashLink
                    ? isActive && location.hash === item.href.substring(item.href.indexOf('#'))
                    : isActive;
                  return `text-sm font-medium transition-colors ${isActuallyActive ? 'text-nexa-primary' : 'text-gray-300 hover:text-white'}`;
                }}>
                  {item.name}
                </NavLink>
              ))}
              {flow === 'landing' && (
                <button onClick={onAboutUsClick} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  {t('nav.about')}
                </button>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-transparent hover:border-gray-700"
                title={theme === 'nexa' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              >
                {theme === 'nexa' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <LanguageSelector />
              <AuthButton />

            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Abrir menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                className="p-3 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden fixed inset-0 z-50 bg-nexa-card/95 backdrop-blur-lg overflow-y-auto"
            initial={{ opacity: 0, y: '-20%' }}
            animate={{ opacity: 1, y: '0%' }}
            exit={{ opacity: 0, y: '-20%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex items-center justify-between h-16 md:h-20 px-4 sm:px-6">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-nexa-primary to-nexa-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-extrabold font-sans">N</span>
                </div>
                <span className="text-xl font-bold text-white">Nexa Solutions</span>
              </Link>
              <div
                className="flex items-center gap-1 font-mono text-sm font-bold tracking-widest select-none"
                onMouseEnter={() => setIsHoveringNexa(true)}
                onMouseLeave={() => setIsHoveringNexa(false)}
              >
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-cyan-500 hover:text-red-500 transition-colors w-4 text-center relative group"
                >
                  <motion.span className="group-hover:hidden inline-block relative" variants={letterAnimation} custom={0} animate={isHoveringNexa ? "hover" : "rest"}>
                    N
                    <motion.div className="absolute bottom-[-2px] left-1/2 w-0.5 h-0.5 bg-gray-400/70 rounded-full" style={{ x: "-50%" }} variants={dustAnimation} custom={{ delay: 0, x: -6, y: -4 }} animate={isHoveringNexa ? "hover" : "rest"} />
                    <motion.div className="absolute bottom-[-2px] left-1/2 w-0.5 h-0.5 bg-gray-400/70 rounded-full" style={{ x: "-50%" }} variants={dustAnimation} custom={{ delay: 0, x: 6, y: -4 }} animate={isHoveringNexa ? "hover" : "rest"} />
                  </motion.span>
                  <span className="hidden group-hover:block">X</span>
                </button>
                <motion.span
                  className="text-cyan-500/50 inline-block"
                  variants={letterAnimation}
                  custom={0.1}
                  animate={isHoveringNexa ? "hover" : "rest"}
                >E</motion.span>
                <motion.span
                  className="text-cyan-500/50 inline-block"
                  variants={letterAnimation}
                  custom={0.2}
                  animate={isHoveringNexa ? "hover" : "rest"}
                >X</motion.span>
                <motion.span
                  className="text-cyan-500/50 inline-block"
                  variants={letterAnimation}
                  custom={0.3}
                  animate={isHoveringNexa ? "hover" : "rest"}
                >A</motion.span>
              </div>
            </div>

            <nav className="flex flex-col gap-2 p-4">
              {currentNavItems.map(item => (
                <NavLink key={item.name} to={item.href} end={item.href === '/'} onClick={(e) => { handleScroll(e, item.href); setIsMenuOpen(false); }} className={({ isActive }) => {
                  const isHashLink = item.href.includes('#');
                  const isActuallyActive = isHashLink
                    ? isActive && location.hash === item.href.substring(item.href.indexOf('#'))
                    : isActive;
                  return `block w-full text-left p-4 rounded-lg text-lg font-medium transition-colors ${isActuallyActive ? 'bg-nexa-primary text-black' : 'text-gray-300 hover:bg-white/5'}`;
                }}>
                  {item.name}
                </NavLink>
              ))}
              {flow === 'landing' && (
                <button onClick={() => { onAboutUsClick(); setIsMenuOpen(false); }} className="block w-full text-left p-4 rounded-lg text-lg font-medium text-gray-300 hover:bg-white/5 transition-colors">
                  {t('nav.about')}
                </button>
              )}


              <div className="border-t border-white/10 my-4"></div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-transparent hover:border-gray-700"
                    title={theme === 'nexa' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                  >
                    {theme === 'nexa' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <LanguageSelector />
                </div>
                <div className="w-full max-w-xs pt-2">
                  <AuthButton isMobile={true} />
                </div>

              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};