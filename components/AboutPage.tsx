 import React from 'react';
import { motion } from 'motion/react';
import { triggerHaptic } from '../utils/haptics';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutPage: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const features = [
        {
            title: "Leaked Photo Takedowns",
            description: "We use StopNCII technology to generate secure hashes of your private images directly on your device. These hashes are then used to block the images from being uploaded to major platforms without the images ever leaving your phone.",
            icon: "fa-camera-retro",
            color: "text-rose-500",
            bgColor: "bg-rose-500/10"
        },
        {
            title: "Hacked Account Recovery",
            description: "Step-by-step recovery guides for Instagram, WhatsApp, Facebook, and Email accounts. We provide direct links to official recovery portals and security hardening steps.",
            icon: "fa-user-shield",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Legal Complaint Drafting",
            description: "Generate professional, factual police complaints and legal notices for cybercrimes. Our drafts follow official formats while ensuring no complex legal jargon is misused.",
            icon: "fa-file-signature",
            color: "text-amber-500",
            bgColor: "bg-amber-500/10"
        },
        {
            title: "Device Security Audit",
            description: "Check your Android or iOS device for common security risks, spyware indicators, and unauthorized administrative apps. Get a personalized security checklist.",
            icon: "fa-mobile-screen-button",
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10"
        },
        {
            title: "Deepfake Detection & Removal",
            description: "Guidance on identifying AI-generated deepfakes and the specific legal routes to have them removed from search engines and social media.",
            icon: "fa-mask",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10"
        },
        {
            title: "Emergency SOS Support",
            description: "Instant access to 1930 (Financial Fraud), 112 (Emergency), and mental health helplines like Tele-MANAS and DISHA for immediate assistance.",
            icon: "fa-life-ring",
            color: "text-red-500",
            bgColor: "bg-red-500/10"
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl max-h-[90dvh] bg-[#0a0f0c] border border-green-500/20 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)] flex flex-col"
            >
                {/* Header Section */}
                <div className="relative p-6 sm:p-8 bg-gradient-to-b from-green-500/10 to-transparent border-b border-white/5 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                    <i className="fa-solid fa-shield-cat text-white text-lg"></i>
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">GRID SAFETY AI</h2>
                            </div>
                            <p className="text-xs font-bold text-green-500/80 uppercase tracking-[0.2em]">Your Digital Guardian</p>
                        </div>
                        <button 
                            onClick={() => { triggerHaptic('light'); onClose(); }}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar">
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-4 h-[2px] bg-green-500"></span>
                            What I Can Do
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {features.map((f, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-green-500/30 transition-all group">
                                    <div className={`w-10 h-10 rounded-xl ${f.bgColor} ${f.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <i className={`fa-solid ${f.icon} text-lg`}></i>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-1">{f.title}</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{f.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-4 h-[2px] bg-green-500"></span>
                            How To Use
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                                <div className="text-xl font-black text-green-500/20">01</div>
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">Chat Naturally</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Just type your problem like "Someone is blackmailing me" or "My Instagram was hacked". I'll understand and guide you.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="text-xl font-black text-white/5">02</div>
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">Use Command Center</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Click the <span className="text-green-500 font-bold">More +</span> button to access specialized tools like the Takedown Generator or UPI Scam reporter.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="text-xl font-black text-white/5">03</div>
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">Follow Action Plans</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">I generate structured action plans with buttons and links. Click them to perform actions directly on official platforms.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="p-6 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/5 border border-green-500/20 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto text-green-500">
                            <i className="fa-solid fa-user-lock text-xl"></i>
                        </div>
                        <h4 className="text-sm font-bold text-white">Privacy First Architecture</h4>
                        <p className="text-[11px] text-green-100/60 leading-relaxed">
                            Grid Safety is designed to be completely private. Your messages are processed in real-time and are never stored on any database. Evidence hashes are generated locally on your device.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-black/50 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <i className="fa-solid fa-code text-green-500"></i>
                        Open Source Project
                    </div>
                    <button 
                        onClick={() => { triggerHaptic('medium'); onClose(); }}
                        className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_20px_rgba(34,197,94,0.2)] active:scale-95"
                    >
                        Got It, Thanks!
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
