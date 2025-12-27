import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import styles from './Debug.module.css';

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
    const savedTheme = window.localStorage.getItem('theme') as Theme | null;
    return savedTheme && ['nexa', 'light'].includes(savedTheme) ? savedTheme : 'nexa';
  });
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState<{ type: 'log' | 'warn' | 'error'; message: string }[]>([]);
  const [filterErrors, setFilterErrors] = useState(false);

  // Captura logs do console apenas em desenvolvimento e no iPhone
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && /iPhone/i.test(window.navigator.userAgent)) {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      const handleLog = (type: 'log' | 'warn' | 'error', args: any[]) => {
        setLogs(prev => {
          const msg = args.map(arg => {
            if (typeof arg === 'object') {
              try { return JSON.stringify(arg); } catch { return String(arg); }
            }
            return String(arg);
          }).join(' ');
          return [{ type, message: msg }, ...prev].slice(0, 50);
        });
      };

      console.log = (...args: any[]) => { originalLog(...args); handleLog('log', args); };
      console.warn = (...args: any[]) => { originalWarn(...args); handleLog('warn', args); };
      console.error = (...args: any[]) => { originalError(...args); handleLog('error', args); };

      return () => {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);

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
      {process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && /iPhone/i.test(window.navigator.userAgent) && (
        <>
          <button className={styles.debugButton} onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? '✕' : '🐞'}
          </button>
          {showDebug && (
            <div className={styles.debugPanel}>
              <p className={styles.panelHeader}>CONSOLE / DEBUG</p>
              <p className={styles.panelInfo}>Tema: {theme}</p>
              <p className={styles.panelInfo}>Resolução: {window.innerWidth}x{window.innerHeight}</p>
              <p className={styles.panelInfo}>Scroll Y: {window.scrollY}</p>
              <div className={styles.logsContainer}>
                <div className={styles.logsHeader}>
                  <p className={styles.logsTitle}>LOGS:</p>
                  <button
                    onClick={() => setFilterErrors(!filterErrors)}
                    className={`${styles.filterButton} ${filterErrors ? styles.filterButtonActive : ''}`}
                  >
                    {filterErrors ? '⚠ Erros/Avisos' : 'Todos'}
                  </button>
                </div>
                {logs.filter(log => !filterErrors || log.type === 'warn' || log.type === 'error').map((log, i) => (
                  <p key={i} className={`${styles.logEntry} ${
                    log.type === 'error' ? styles.logError :
                    log.type === 'warn' ? styles.logWarn :
                    styles.logLog
                  }`}>
                    {'> '}{log.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </ThemeContext.Provider>
  );
};