import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';
import { Menu, X, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  onAboutUsClick: () => void;
  flow?: 'landing' | 'purchase'; // Added flow prop
}

export const Navbar: React.FC<NavbarProps> = ({ onAboutUsClick, flow = 'landing' }) => { // Default flow to 'landing'
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Definition of NavItem type
  interface NavItem {
    name: string;
    href: string;
  }

  // Navigation items for the Landing Page
  const landingNavItems: NavItem[] = [
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
              <Link to="/perfil" className="text-sm text-gray-300 hover:text-white transition-colors">
                Olá, <span className="font-bold text-white hover:text-nexa-primary">{user.name.split(' ')[0]}</span>
              </Link>
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
        className={`${authActionClasses} ${
          isMobile
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
      e.preventDefault();
      const targetId = id.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
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
              <span className="text-xl font-bold text-white">NEXA</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {currentNavItems.map(item => (
                <NavLink key={item.name} to={item.href} onClick={(e) => handleScroll(e, item.href)} className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-nexa-primary' : 'text-gray-300 hover:text-white'}`}>
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
              <ThemeSelector />
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

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 z-50 bg-nexa-card/95 backdrop-blur-lg overflow-y-auto animate-fade-in-down"
        >
          <div className="flex items-center justify-between h-16 md:h-20 px-4 sm:px-6">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-nexa-primary to-nexa-secondary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-extrabold font-sans">N</span>
              </div>
              <span className="text-xl font-bold text-white">NEXA</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fechar menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className="p-3 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 p-4">
            {currentNavItems.map(item => (
              <NavLink key={item.name} to={item.href} onClick={(e) => {handleScroll(e, item.href); setIsMenuOpen(false);}} className={({ isActive }) => `block w-full text-left p-4 rounded-lg text-lg font-medium transition-colors ${isActive ? 'bg-nexa-primary text-black' : 'text-gray-300 hover:bg-white/5'}`}>
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
                  <ThemeSelector />
                  <LanguageSelector />
                </div>
                <div className="w-full max-w-xs pt-2">
                    <AuthButton isMobile={true} />
                </div>

            </div>
          </nav>
        </div>
      )}
    </>
  );
};