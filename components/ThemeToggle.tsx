import React from 'react';
import { Theme } from '../types';

interface ThemeToggleProps {
  currentTheme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-all active:scale-95 focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle Theme"
    >
      {currentTheme === Theme.LIGHT ? (
        <i className="fa-solid fa-moon text-sm"></i>
      ) : (
        <i className="fa-solid fa-sun text-sm"></i>
      )}
    </button>
  );
};