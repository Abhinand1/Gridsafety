import React from 'react';
import { motion } from 'motion/react';

interface ProtectionStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'password' | '2fa' | 'device' | 'privacy';
}

interface ProtectionVisualizerProps {
  steps: ProtectionStep[];
}

export const ProtectionVisualizer: React.FC<ProtectionVisualizerProps> = ({ steps }) => {
  if (!steps || !Array.isArray(steps)) return null;

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'password': return 'from-blue-500 to-indigo-600 shadow-blue-500/20';
      case '2fa': return 'from-emerald-500 to-teal-600 shadow-emerald-500/20';
      case 'device': return 'from-purple-500 to-fuchsia-600 shadow-purple-500/20';
      case 'privacy': return 'from-amber-500 to-orange-600 shadow-amber-500/20';
      default: return 'from-gray-500 to-gray-600 shadow-gray-500/20';
    }
  };

  return (
    <div className="w-full mt-3 mb-2 space-y-2.5">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400">
          <i className="fa-solid fa-shield-check text-sm"></i>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white leading-none">Future Protection Plan</h3>
          <p className="text-[8px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">STRENGTHEN YOUR DIGITAL DEFENSES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white dark:bg-[#1a2420] border border-gray-100 dark:border-white/5 rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="flex items-start gap-2.5 relative z-10">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryStyles(step.category)} flex items-center justify-center text-white text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                <i className={`${(step.icon || 'fa-shield').includes(' ') ? (step.icon || 'fa-shield') : `fa-solid ${step.icon || 'fa-shield'}`}`}></i>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{step.title}</h4>
                  <span className="shrink-0 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded whitespace-nowrap">
                    STEP {index + 1}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-snug line-clamp-2">
                  {step.description}
                </p>
              </div>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute right-0 bottom-0 text-3xl font-black text-black/[0.02] dark:text-white/[0.02] select-none pointer-events-none translate-x-2 translate-y-2">
              {step.category.toUpperCase()}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-md p-2 mt-2">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <i className="fa-solid fa-circle-info text-[10px]"></i>
          <p className="text-[9px] font-bold leading-tight">
            Pro Tip: Use unique passwords & a manager like Bitwarden.
          </p>
        </div>
      </div>
    </div>
  );
};
