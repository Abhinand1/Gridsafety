import React, { useState } from 'react';
import { SecurityGuide } from '../types';

interface SecurityChecklistProps {
  data: SecurityGuide;
}

export const SecurityChecklist: React.FC<SecurityChecklistProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  return (
    <div className="w-full mt-4 mb-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
      
      {/* Header / Tabs */}
      <div className="flex border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('ios')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'ios'
              ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white'
              : 'bg-gray-50 dark:bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <i className="fa-brands fa-apple text-lg mb-0.5"></i> iOS / iPhone
        </button>
        <button
          onClick={() => setActiveTab('android')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'android'
              ? 'bg-white dark:bg-white/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-gray-50 dark:bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <i className="fa-brands fa-android text-lg mb-0.5"></i> Android
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'ios' ? 'bg-gray-800 dark:bg-white' : 'bg-emerald-500'}`}></div>
            <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                {activeTab === 'ios' ? 'Apple Security Lockdown' : 'Android Hardening Protocol'}
            </h3>
        </div>

        <ul className="space-y-3">
            {(() => {
                const rawData = activeTab === 'ios' ? (data.ios || (data as any).iOS || (data as any).IOS) : (data.android || (data as any).Android || (data as any).ANDROID);
                const steps = Array.isArray(rawData) ? rawData : (typeof rawData === 'string' ? rawData.split('\n').filter(s => s.trim()) : []);
                return steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
                            activeTab === 'ios' 
                            ? 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400' 
                            : 'border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        }`}>
                            <span className="text-[10px] font-mono">{idx + 1}</span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-200 leading-tight pt-0.5">{step}</span>
                    </li>
                ));
            })()}
        </ul>

        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-white/5 text-center">
            <p className="text-[10px] text-gray-400">
                <i className="fa-solid fa-shield-halved mr-1"></i>
                Perform these steps immediately if you suspect unauthorized access.
            </p>
        </div>
      </div>
    </div>
  );
};