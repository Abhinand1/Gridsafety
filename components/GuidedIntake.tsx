import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
}

export const GuidedIntake: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
    const [category, setCategory] = useState<string | null>(null);
    const [details, setDetails] = useState({
        platform: '',
        date: '',
        description: '',
        perpetrator: ''
    });

    if (!isOpen) return null;

    const categories = [
        { id: 'financial', icon: 'fa-money-bill-wave', label: 'Financial Fraud / Scam' },
        { id: 'harassment', icon: 'fa-user-ninja', label: 'Cyberbullying / Stalking' },
        { id: 'ncii', icon: 'fa-camera', label: 'Non-Consensual Images (NCII)' },
        { id: 'hacking', icon: 'fa-user-secret', label: 'Account Hacked' }
    ];

    const handleGenerate = () => {
        triggerHaptic('success');
        const prompt = `I need help drafting a formal complaint or taking action for the following incident:
Category: ${category}
Platform/App involved: ${details.platform || 'Not specified'}
Date of incident: ${details.date || 'Not specified'}
Perpetrator details (if known): ${details.perpetrator || 'Unknown'}
Description of what happened: ${details.description}

Please provide a structured response with immediate steps and a draft complaint if applicable.`;
        onSubmit(prompt);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-md max-h-[85dvh] flex flex-col bg-[#050a07] border border-blue-500/30 sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-slide-up sm:animate-fade-in-up">
                
                {/* Header */}
                <div className="p-4 bg-blue-900/10 border-b border-blue-500/20 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-list text-blue-500"></i>
                        <span className="font-mono text-blue-500 font-bold tracking-wider text-sm uppercase">Guided Intake</span>
                    </div>
                    <button onClick={() => { triggerHaptic('light'); onClose(); }} className="text-blue-700 hover:text-blue-500">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-5 pb-10 space-y-6 flex-1 min-h-0 no-scrollbar">
                    {!category ? (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-white text-center">What happened?</h3>
                            <p className="text-xs text-gray-400 text-center mb-4">Select a category so we can guide you better.</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => { triggerHaptic('medium'); setCategory(cat.label); }}
                                        className="bg-black/50 border border-blue-800/30 hover:bg-blue-900/20 hover:border-blue-500/50 p-4 rounded-xl flex flex-col items-center gap-3 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <i className={`fa-solid ${cat.icon} text-blue-400 text-xl`}></i>
                                        </div>
                                        <span className="text-xs font-bold text-gray-300 text-center">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-white">Incident Details</h3>
                                <button onClick={() => setCategory(null)} className="text-xs text-blue-400 hover:text-blue-300">Change Category</button>
                            </div>
                            
                            <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-200 mb-4">
                                <strong>Category:</strong> {category}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Platform / App</label>
                                    <input type="text" placeholder="e.g., Instagram, WhatsApp, Phone Call" value={details.platform} onChange={e => setDetails({...details, platform: e.target.value})} className="w-full bg-black/50 border border-blue-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Date of Incident</label>
                                    <input type="date" value={details.date} onChange={e => setDetails({...details, date: e.target.value})} className="w-full bg-black/50 border border-blue-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Perpetrator (if known)</label>
                                    <input type="text" placeholder="Username, Phone number, or 'Unknown'" value={details.perpetrator} onChange={e => setDetails({...details, perpetrator: e.target.value})} className="w-full bg-black/50 border border-blue-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Brief Description</label>
                                    <textarea placeholder="What exactly happened?" value={details.description} onChange={e => setDetails({...details, description: e.target.value})} className="w-full bg-black/50 border border-blue-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 text-sm min-h-[100px] resize-none"></textarea>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={!details.description.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-colors mt-4 flex items-center justify-center gap-2"
                            >
                                Generate Action Plan <i className="fa-solid fa-wand-magic-sparkles"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
