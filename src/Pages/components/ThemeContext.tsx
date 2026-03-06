import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

// Define os temas disponíveis
export type Theme = 'nexa' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Cria o contexto com um valor padrão undefined para garantir que o provider seja usado.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook customizado para usar o contexto do tema de forma segura.
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Componente Provedor do Tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('theme') as Theme | null;
      if (savedTheme && ['nexa', 'light'].includes(savedTheme)) {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'nexa';
  });

  // Efeito para gerenciar a classe de transição e evitar animação na carga inicial.
  // Isso previne um "flash" de animação quando a página é carregada com um tema não padrão.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('no-transition');
    const timer = setTimeout(() => {
      root.classList.remove('no-transition');
    }, 10); // Um pequeno atraso é suficiente.
    return () => clearTimeout(timer);
  }, []);

  // Efeito para aplicar a classe ao elemento <html> e salvar a escolha do usuário.
  useEffect(() => {
    const root = window.document.documentElement;

    // Lista de todos os temas antigos para limpeza
    const allThemes = ['theme-nexa', 'theme-cyber', 'theme-amanhecer', 'theme-crepusculo', 'theme-sereno', 'theme-luxo'];
    root.classList.remove(...allThemes, 'dark', 'light'); // Also remove 'dark' and 'light' to ensure clean state

    if (theme === 'light') {
      root.classList.add('light');
    } else { // theme === 'nexa'
      root.classList.add('dark');
      root.classList.add('theme-nexa');
    }

    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'nexa' ? 'light' : 'nexa'));
  };

  // O valor do contexto é memoizado para evitar re-renderizações desnecessárias.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};