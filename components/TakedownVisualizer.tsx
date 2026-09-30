import React from 'react';
import { TakedownStep } from '../types';

interface TakedownVisualizerProps {
  steps: TakedownStep[];
}

export const TakedownVisualizer: React.FC<TakedownVisualizerProps> = ({ steps }) => {
  // CRITICAL FIX: Ensure steps is an array before mapping
  if (!steps || !Array.isArray(steps)) {
      return null;
  }

  return (
    <div className="w-full mt-4 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Immediate Action Plan</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <div 
            key={step.id || index}
            className="group relative overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl p-4 transition-all hover:scale-[1.02] shadow-sm hover:shadow-lg hover:shadow-green-500/10"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Number Watermark - Fixed positioning to prevent cutoff */}
            <div className="absolute right-4 top-2 text-5xl font-black text-black/5 dark:text-white/5 select-none pointer-events-none">
                0{index + 1}
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-green-500/20">
                <i className={`${(step.icon || 'fa-shield-halved').includes(' ') ? (step.icon || 'fa-shield-halved') : `fa-solid ${step.icon || 'fa-shield-halved'}`}`}></i>
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">{step.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3 pr-8">
                    {step.description}
                </p>
                
                {step.actionUrl && (
                    <a 
                        href={step.actionUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-wide rounded-md hover:opacity-90 transition-opacity"
                    >
                        {step.actionLabel || "Execute Action"} <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                )}
              </div>
            </div>
            
            {/* Progress Line */}
            {index !== steps.length - 1 && (
                 <div className="absolute left-[29px] -bottom-4 w-0.5 h-6 bg-gray-200 dark:bg-white/10 z-0"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};