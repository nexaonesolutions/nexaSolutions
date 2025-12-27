import React, { createContext, useState, useEffect, useMemo } from 'react';

// Define the shape of the context data
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  isDarkMode: boolean;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define the props for the provider
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get the theme from local storage or default to 'theme-nexa'
    return localStorage.getItem('theme') || 'theme-nexa';
  });

  // Apply the theme class to the html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-nexa', 'theme-cyber', 'theme-amanhecer');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDarkMode = useMemo(() => {
    // The 'amanhecer' theme is the light theme
    return theme !== 'theme-amanhecer';
  }, [theme]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    isDarkMode,
  }), [theme, isDarkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
