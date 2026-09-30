import React from 'react';
import { KERALA_CYBER_CONTACTS } from '../constants';
import { triggerHaptic } from '../utils/haptics';
import { logEvent } from '../utils/analytics';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CyberInfoModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative bg-white dark:bg-[#0a150e] w-full max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 pb-10 transform transition-all animate-slide-up sm:animate-fade-in border border-white/20 dark:border-green-900/40 overflow-y-auto max-h-[85dvh] no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-600">
            Emergency Contacts
          </h2>
          <button onClick={() => {
            triggerHaptic('light');
            onClose();
          }} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4">
          {/* National Cyber Helpline */}
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-red-500 uppercase font-bold tracking-wider">Cyber Crime Helpline</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{KERALA_CYBER_CONTACTS.helpline}</p>
            </div>
            <a href={`tel:${KERALA_CYBER_CONTACTS.helpline}`} onClick={() => {
                triggerHaptic('medium');
                logEvent('CyberInfo', 'Call', 'Helpline');
            }} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 transition-transform">
              <i className="fa-solid fa-phone"></i>
            </a>
          </div>

          {/* Mental Health Support */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
             <div className="flex items-center gap-2 mb-3">
                <i className="fa-solid fa-heart-pulse text-blue-500"></i>
                <h3 className="font-bold text-gray-700 dark:text-blue-100 text-sm">Mental Health Support (24/7)</h3>
             </div>
             <div className="grid grid-cols-2 gap-3">
                 <a href={`tel:${KERALA_CYBER_CONTACTS.mental_health.tele_manas}`} onClick={() => triggerHaptic('medium')} className="flex flex-col items-center justify-center p-2 bg-white dark:bg-white/5 rounded-xl border border-blue-100 dark:border-blue-500/20 hover:border-blue-400 transition-colors">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Tele-MANAS</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{KERALA_CYBER_CONTACTS.mental_health.tele_manas}</span>
                 </a>
                 <a href={`tel:${KERALA_CYBER_CONTACTS.mental_health.disha}`} onClick={() => triggerHaptic('medium')} className="flex flex-col items-center justify-center p-2 bg-white dark:bg-white/5 rounded-xl border border-blue-100 dark:border-blue-500/20 hover:border-blue-400 transition-colors">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">DISHA Kerala</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{KERALA_CYBER_CONTACTS.mental_health.disha}</span>
                 </a>
             </div>
          </div>

          {/* Kerala Cyber Dome */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-green-900/10 border border-emerald-100 dark:border-green-900/30">
            <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-building-shield text-emerald-600 dark:text-emerald-400"></i>
                <h3 className="font-semibold text-gray-800 dark:text-green-50">{KERALA_CYBER_CONTACTS.cyberdome.name}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              {KERALA_CYBER_CONTACTS.cyberdome.address}
            </p>
            <div className="flex gap-2">
                 <a href={`mailto:${KERALA_CYBER_CONTACTS.cyberdome.email}`} onClick={() => triggerHaptic('medium')} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg text-center transition-colors">
                    Email Police
                 </a>
                 <a href={KERALA_CYBER_CONTACTS.cyberdome.website} onClick={() => triggerHaptic('medium')} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white text-xs font-medium rounded-lg text-center transition-colors hover:bg-gray-50 dark:hover:bg-white/10">
                    Website
                 </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                In case of immediate physical danger, dial <strong>{KERALA_CYBER_CONTACTS.emergency}</strong>
            </p>
        </div>
      </div>
    </div>
  );
};