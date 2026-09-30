import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { PanicButton } from './components/PanicButton';
import { ChatInterface } from './components/ChatInterface';
import { SplashScreen } from './components/SplashScreen';
import { Theme } from './types';
import { saveSession } from './services/storageService';
import { triggerHaptic } from './utils/haptics';
import { initGA, logPageView, logEvent } from './utils/analytics';

import { ErrorBoundary } from './components/ErrorBoundary';

const CyberInfoModal = lazy(() => import('./components/CyberInfoModal').then(module => ({ default: module.CyberInfoModal })));
const DataBreachScanner = lazy(() => import('./components/DataBreachScanner').then(module => ({ default: module.DataBreachScanner })));
const SupportLocator = lazy(() => import('./components/SupportLocator').then(module => ({ default: module.SupportLocator })));
const TakedownGenerator = lazy(() => import('./components/TakedownGenerator').then(module => ({ default: module.TakedownGenerator })));
const UpiFraudToolkit = lazy(() => import('./components/UpiFraudToolkit').then(module => ({ default: module.UpiFraudToolkit })));

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
    <path d="M12 2L2 7L4 17C4 17 6.5 22 12 22C17.5 22 20 17 20 17L22 7L12 2Z" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6V18" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
    <path d="M7 9L17 9" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
    <path d="M8 14L16 14" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
    <defs>
      <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4ade80" />
        <stop offset="1" stopColor="#10b981" />
      </linearGradient>
    </defs>
  </svg>
);

// Add global type for aistudio
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return Theme.DARK;
    }
    return Theme.LIGHT;
  });
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'email' | 'link' | 'pii'>('email');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isTakedownOpen, setIsTakedownOpen] = useState(false);
  const [isUpiFraudOpen, setIsUpiFraudOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    initGA();
    logPageView(window.location.pathname);
  }, []);

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    triggerHaptic('light');
    const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    setTheme(newTheme);
    logEvent('Theme', 'Toggle', newTheme);
  };

  const handlePanic = () => {
      triggerHaptic('heavy');
      logEvent('Action', 'Panic', 'Triggered');
      // Clear session storage
      saveSession([]); 
      localStorage.clear();
      sessionStorage.clear();
      
      // Force ChatInterface to remount and clear state
      setChatKey(prev => prev + 1);

      // Reset state (though DOM replacement will kill React anyway, this is for safety)
      setIsInfoOpen(false);
      setIsScannerOpen(false);
      setIsSupportOpen(false);
      setIsTakedownOpen(false);
  };

  return (
    <>
    {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col transition-colors duration-500 overflow-hidden">
      
      {/* Background: Sharp Grid Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-r from-[#f3f4f6] to-[#f3f4f6] dark:from-[#020402] dark:to-[#020402] transition-colors duration-500">
          
          {/* Grid Layer */}
          <div className="absolute inset-0 
            /* Light Mode: Visible grey grid */
            bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
            /* Dark Mode: Subtle green technical grid */
            dark:bg-[linear-gradient(to_right,rgba(34,197,94,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.07)_1px,transparent_1px)] 
            bg-[size:24px_24px] blur-[0.5px]">
          </div>

          {/* Clean Top Spotlight */}
          <div className="absolute top-0 left-0 right-0 h-[60vh] 
            bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.05),transparent_70%)] 
            dark:bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.15),transparent_70%)]">
          </div>
          
          {/* Bottom Fade Mask */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#f3f4f6] dark:from-[#020402] to-transparent"></div>
      </div>

      {/* App Container */}
      <div className="relative z-10 w-full h-full mx-auto max-w-[600px] flex flex-col backdrop-blur-[2px] sm:border-x sm:border-white/20 dark:sm:border-green-900/20 shadow-2xl shadow-black/20">
          
          {/* Header - Fixed Height, No Scroll */}
          <header className="flex-none z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-[#18201d]/80 border-b border-gray-200/50 dark:border-green-900/30 transition-colors pt-safe">
            <div className="px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                    onClick={() => {
                        triggerHaptic('light');
                        setIsInfoOpen(true);
                        logEvent('Modal', 'Open', 'CyberInfo');
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900/5 dark:bg-green-900/10 hover:bg-green-500/10 border border-transparent dark:border-green-500/20 transition-all hover:scale-105 group"
                >
                  <LogoIcon />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-light text-gray-800 dark:text-gray-300 tracking-wide">Grid</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-green-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">Safety</span>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-3">
                 <button
                    onClick={() => {
                        triggerHaptic('medium');
                        setIsSupportOpen(true);
                        logEvent('Modal', 'Open', 'SupportLocator');
                    }}
                    className="h-9 w-9 sm:h-9 sm:w-auto sm:px-3 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center sm:gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors border border-blue-100 dark:border-blue-900/30"
                    title="Nearby SOS Support"
                 >
                    <i className="fa-solid fa-map-location-dot text-sm"></i>
                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide">SOS Support</span>
                 </button>

                 <button
                    onClick={() => {
                        triggerHaptic('medium');
                        setIsScannerOpen(true);
                        logEvent('Modal', 'Open', 'DataBreachScanner');
                    }}
                    className="h-9 w-9 sm:h-9 sm:w-auto sm:px-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center sm:gap-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                    title="Identity Guard Protocol"
                 >
                    <i className="fa-solid fa-user-shield text-sm"></i>
                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide">Identity Guard</span>
                 </button>
                 
                 <ThemeToggle currentTheme={theme} onToggle={toggleTheme} />
                 <PanicButton onPanic={handlePanic} />
              </div>
            </div>
          </header>

          {/* Main Content - Takes remaining height */}
          <main className="flex-1 w-full relative overflow-hidden">
            <ErrorBoundary>
              <ChatInterface 
                  key={chatKey} 
                  onInfoClick={() => {
                      triggerHaptic('light');
                      setIsInfoOpen(true);
                      logEvent('Modal', 'Open', 'CyberInfo');
                  }}
                  onOpenTakedown={() => {
                      triggerHaptic('medium');
                      setIsTakedownOpen(true);
                      logEvent('Modal', 'Open', 'TakedownGenerator');
                  }}
                  onOpenUpiFraud={() => {
                      triggerHaptic('medium');
                      setIsUpiFraudOpen(true);
                      logEvent('Modal', 'Open', 'UpiFraudToolkit');
                  }}
                  onOpenScanner={(mode?: 'email' | 'link' | 'pii') => {
                      triggerHaptic('medium');
                      if (mode) setScannerMode(mode);
                      else setScannerMode('email');
                      setIsScannerOpen(true);
                      logEvent('Modal', 'Open', `DataBreachScanner_${mode || 'email'}`);
                  }}
                  onOpenSupport={() => {
                      triggerHaptic('medium');
                      setIsSupportOpen(true);
                      logEvent('Modal', 'Open', 'SupportLocator');
                  }}
              />
            </ErrorBoundary>
          </main>
      </div>

      {/* Crawlable Static Text for SEO/AEO */}
      <section aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <h1>Grid Safety — Free AI Help for Cyber Harassment Victims in India</h1>
        <p>Grid Safety is a free, AI-powered safety tool for cyber harassment victims in India. Get help with leaked photo takedowns, deepfake removal, hacked account recovery, device security, and filing cybercrime complaints with Indian authorities.</p>
        <p>Call the national cybercrime helpline: 1930. File complaints at cybercrime.gov.in.</p>
        <p>Grid Safety is open source, mobile-first, and completely free to use.</p>
      </section>

      {/* Modals */}
      <Suspense fallback={null}>
        <CyberInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
        <DataBreachScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} initialMode={scannerMode} />
        <SupportLocator isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        <TakedownGenerator isOpen={isTakedownOpen} onClose={() => setIsTakedownOpen(false)} />
        <UpiFraudToolkit isOpen={isUpiFraudOpen} onClose={() => setIsUpiFraudOpen(false)} />
      </Suspense>
      
    </div>
    </>
  );
};

export default App;