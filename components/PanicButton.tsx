import React from 'react';

interface PanicButtonProps {
  onPanic?: () => void;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ onPanic }) => {
  const handlePanic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Clear App State (Chat, etc.)
    if (onPanic) {
        onPanic();
    }

    // 2. Clear Storage
    localStorage.clear();
    sessionStorage.clear();

    // 3. Safe Redirect (replaces history)
    window.location.replace("https://www.google.com/search?q=weather");
  };

  return (
    <button
      onClick={handlePanic}
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
      aria-label="Exit app immediately for safety"
      title="Closes and redirects away from this page"
    >
      <i className="fa-solid fa-right-from-bracket text-sm"></i>
    </button>
  );
};