import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_SETTINGS } from '../lib/graphql';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const authContext = useAuth();
  const user = authContext?.user;
  const refetchUser = authContext?.refetchUser;
  const [theme, setThemeState] = useState(() => {
    // Initialize theme from localStorage on first render
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme && ['light', 'dark'].includes(savedTheme)) ? savedTheme : 'light';
  });
  const [updateSettings] = useMutation(UPDATE_SETTINGS);

  // Initialize theme from user settings or localStorage
  useEffect(() => {
    if (user?.settings?.theme) {
      // User is logged in, use their saved preference
      setThemeState(user.settings.theme);
      localStorage.setItem('theme', user.settings.theme);
    } else {
      // User not logged in or no preference, check localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setThemeState(savedTheme);
      } else {
        // Default to light theme
        setThemeState('light');
      }
    }
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = async (newTheme) => {
    if (!['light', 'dark'].includes(newTheme)) {
      console.error('Invalid theme:', newTheme);
      return;
    }

    // Update local state immediately for better UX
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // If user is logged in, save to backend
    if (user) {
      try {
        await updateSettings({
          variables: {
            settings: {
              theme: newTheme
            }
          }
        });
        
        // Refetch user to update the context
        await refetchUser();
      } catch (error) {
        console.error('Failed to save theme preference:', error);
        // Don't revert the theme - local storage is already updated
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
