// contexts/ThemeContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppDispatch } from '@/store';
import { setActiveFeature } from '@/store/slices/bibleSlice';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleActiveFeature: (feature: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  toggleActiveFeature: () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user has a preference stored
    const storedPreference = localStorage.getItem('darkMode');
    if (storedPreference) {
      setIsDarkMode(storedPreference === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Store user preference
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  const toggleActiveFeature = (feature: string | null) => {
    dispatch(setActiveFeature(feature));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, toggleActiveFeature }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};