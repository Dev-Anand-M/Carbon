/**
 * @fileoverview Theme context provider for dark/light mode.
 * Respects user's system preference and persists choice.
 * @module contexts/ThemeContext
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getStoredData, setStoredData } from '../services/storageService.js';
import { STORAGE_KEYS } from '../utils/constants.js';

/** @type {React.Context} */
const ThemeContext = createContext(null);

/**
 * Theme context provider component.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    /* Check stored preference first */
    const stored = getStoredData(STORAGE_KEYS.THEME);
    if (stored === 'dark' || stored === 'light') return stored;

    /* Fall back to system preference */
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  /* Apply theme to document */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    setStoredData(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  /* Listen for system theme changes */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const stored = getStoredData(STORAGE_KEYS.THEME);
      /* Only auto-switch if user hasn't explicitly chosen */
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  }, []);

  const isDark = theme === 'dark';

  const contextValue = useMemo(() => ({
    theme,
    isDark,
    toggleTheme,
    setTheme,
  }), [theme, isDark, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme context.
 * @returns {Object} Theme context value.
 * @throws {Error} If used outside ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
