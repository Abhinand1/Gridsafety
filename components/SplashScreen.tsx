import React, { useEffect, useState } from 'react';

interface SplashProps {
  onFinish: () => void;
}

const SplashLogo = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
      <path d="M12 2L2 7L4 17C4 17 6.5 22 12 22C17.5 22 20 17 20 17L22 7L12 2Z" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V18" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
      <path d="M7 9L17 9" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
      <path d="M8 14L16 14" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
    </svg>
);

export const SplashScreen: React.FC<SplashProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 800); 
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div 
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020402] transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="absolute w-64 h-64 border border-green-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute w-80 h-80 border border-emerald-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        
        {/* Glow */}
        <div className="absolute inset-0 bg-green-500/10 blur-[80px] rounded-full animate-pulse-slow"></div>
        
        {/* Logo Container */}
        <div className="relative w-32 h-32 bg-gradient-to-b from-[#0a1f0d] to-black rounded-[2rem] border border-green-500/30 shadow-[0_0_30px_rgba(0,255,157,0.15)] flex items-center justify-center mb-10 z-10 animate-fade-in-up">
          <SplashLogo />
          
          {/* Glass Shine */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Text */}
        <div className="text-center z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
                 <span className="text-4xl font-light text-white tracking-wide">Grid</span>
                 <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]">Safety</span>
            </div>
            
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-4"></div>
            
            <p className="text-xs text-green-400/80 tracking-[0.3em] uppercase font-medium">
                Cyber Safety Tool
            </p>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
         <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[bounce_1s_infinite] delay-0 shadow-[0_0_8px_#22c55e]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[bounce_1s_infinite] delay-100 shadow-[0_0_8px_#22c55e]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[bounce_1s_infinite] delay-200 shadow-[0_0_8px_#22c55e]"></div>
         </div>
         <p className="text-[9px] text-green-700/70 font-mono uppercase tracking-widest">Initializing Secure Channel...</p>
      </div>
    </div>
  );
};