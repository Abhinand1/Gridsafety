import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { triggerHaptic } from '../utils/haptics';
import { logEvent } from '../utils/analytics';

interface TakedownGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
}

type ContentType = 'ncii' | 'dmca' | 'harassment' | 'impersonation';
type Platform = 'google' | 'meta' | 'x' | 'reddit' | 'other';

export const TakedownGenerator: React.FC<TakedownGeneratorProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<1 | 2>(1);
    
    // Form State
    const [platform, setPlatform] = useState<Platform>('meta');
    const [contentType, setContentType] = useState<ContentType>('ncii');
    const [url, setUrl] = useState('');
    const [legalName, setLegalName] = useState('');
    const [email, setEmail] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');
    
    // Output State
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setPlatform('meta');
            setContentType('ncii');
            setUrl('');
            setLegalName('');
            setEmail('');
            setAdditionalDetails('');
            setGeneratedText('');
            setCopied(false);
        }
    }, [isOpen]);

    const handleGenerate = () => {
        triggerHaptic('medium');
        logEvent('Takedown', 'Generate', contentType);
        
        const sanitizedUrl = DOMPurify.sanitize(url).trim();
        const sanitizedName = DOMPurify.sanitize(legalName).trim() || '[Your Legal Name]';
        const sanitizedEmail = DOMPurify.sanitize(email).trim() || '[Your Email Address]';
        const sanitizedDetails = DOMPurify.sanitize(additionalDetails).trim();
        
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        let template = '';

        if (contentType === 'dmca') {
            template = `SUBJECT: Notice of Copyright Infringement - DMCA Takedown Request

To the Designated Copyright Agent for ${getPlatformName(platform)},

My name is ${sanitizedName}. A website or user that your company hosts (or links to) is infringing on at least one copyright owned by me.

An exclusive right that I own is being violated by material available upon your site at the following URL(s):
${sanitizedUrl}

${sanitizedDetails ? `Additional Details:\n${sanitizedDetails}\n` : ''}
I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

The information in this notification is accurate, and under penalty of perjury, I am the owner, or an agent authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.

Please act expeditiously to remove or disable access to this material as required by the Digital Millennium Copyright Act (DMCA).

Sincerely,
${sanitizedName}
${sanitizedEmail}
${date}`;
        } else if (contentType === 'ncii') {
            template = `SUBJECT: URGENT: Removal Request for Non-Consensual Intimate Imagery (NCII)

To the Trust and Safety Team at ${getPlatformName(platform)},

My name is ${sanitizedName}. I am writing to urgently request the immediate removal of non-consensual intimate imagery (NCII) depicting me, which violates your Terms of Service and community guidelines regarding sexual exploitation and non-consensual content.

The offending content is located at the following URL(s):
${sanitizedUrl}

${sanitizedDetails ? `Additional Context:\n${sanitizedDetails}\n` : ''}
I did not consent to the distribution, publication, or hosting of this imagery. Its continued presence on your platform is causing severe emotional distress and constitutes a severe violation of my privacy rights.

Please confirm receipt of this message and notify me once the content has been permanently removed and the offending account has been actioned.

Sincerely,
${sanitizedName}
${sanitizedEmail}
${date}`;
        } else if (contentType === 'harassment') {
            template = `SUBJECT: Report of Severe Harassment and Terms of Service Violation

To the Trust and Safety Team at ${getPlatformName(platform)},

My name is ${sanitizedName}. I am writing to formally report a severe and ongoing campaign of harassment and targeted abuse that violates your platform's Terms of Service and community guidelines.

The abusive content/behavior is located at the following URL(s):
${sanitizedUrl}

${sanitizedDetails ? `Specific Details of Harassment:\n${sanitizedDetails}\n` : ''}
This behavior is targeted, malicious, and creates an unsafe environment. I request that your moderation team review this content immediately and take appropriate action against the offending account(s) to prevent further abuse.

Please notify me of the actions taken regarding this report.

Sincerely,
${sanitizedName}
${sanitizedEmail}
${date}`;
        } else if (contentType === 'impersonation') {
            template = `SUBJECT: URGENT: Report of Account Impersonation and Identity Theft

To the Trust and Safety Team at ${getPlatformName(platform)},

My name is ${sanitizedName}. I am writing to report an account that is impersonating me, which is a direct violation of your community guidelines and Terms of Service.

The impersonating account/content is located at the following URL:
${sanitizedUrl}

${sanitizedDetails ? `Additional Evidence of Impersonation:\n${sanitizedDetails}\n` : ''}
This account is using my name, likeness, or personal information without my authorization to deceive others. This identity theft is causing reputational harm and distress.

I request the immediate suspension and removal of the impersonating account. I am prepared to provide government-issued identification to verify my identity if required by your security team.

Sincerely,
${sanitizedName}
${sanitizedEmail}
${date}`;
        }

        setGeneratedText(template);
        setStep(2);
    };

    const getPlatformName = (p: Platform) => {
        switch(p) {
            case 'google': return 'Google';
            case 'meta': return 'Meta (Facebook/Instagram)';
            case 'x': return 'X (formerly Twitter)';
            case 'reddit': return 'Reddit';
            case 'other': return 'the Platform';
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedText);
            setCopied(true);
            triggerHaptic('success');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            triggerHaptic('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#111] sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] animate-slide-up sm:animate-fade-in border border-gray-200 dark:border-white/10">
                
                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <i className="fa-solid fa-file-contract"></i>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Takedown Generator</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Draft formal removal requests</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 pb-10 min-h-0 custom-scrollbar">
                    {step === 1 ? (
                        <div className="space-y-5">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                                <i className="fa-solid fa-circle-info mt-0.5"></i>
                                <p className="text-xs leading-relaxed">
                                    This tool generates legally-sound templates for content removal. <strong>Do not use this for false claims</strong>, as that may constitute perjury.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Platform</label>
                                    <select 
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value as Platform)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    >
                                        <option value="meta">Meta (Facebook/Instagram)</option>
                                        <option value="google">Google / YouTube</option>
                                        <option value="x">X (Twitter)</option>
                                        <option value="reddit">Reddit</option>
                                        <option value="other">Other Platform</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Violation Type</label>
                                    <select 
                                        value={contentType}
                                        onChange={(e) => setContentType(e.target.value as ContentType)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    >
                                        <option value="ncii">Non-Consensual Intimate Imagery (NCII)</option>
                                        <option value="harassment">Severe Harassment / Bullying</option>
                                        <option value="impersonation">Impersonation / Identity Theft</option>
                                        <option value="dmca">Copyright Infringement (DMCA)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Target URL</label>
                                    <input 
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Your Legal Name</label>
                                        <input 
                                            type="text"
                                            value={legalName}
                                            onChange={(e) => setLegalName(e.target.value)}
                                            placeholder="Jane Doe"
                                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Contact Email</label>
                                        <input 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="jane@example.com"
                                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Additional Context (Optional)</label>
                                    <textarea 
                                        value={additionalDetails}
                                        onChange={(e) => setAdditionalDetails(e.target.value)}
                                        placeholder="Briefly explain the situation..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Generated Request</h3>
                                <button 
                                    onClick={() => setStep(1)}
                                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                    Edit Details
                                </button>
                            </div>
                            
                            <div className="relative group">
                                <textarea 
                                    readOnly
                                    value={generatedText}
                                    className="w-full h-64 p-4 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-300 font-mono leading-relaxed resize-none custom-scrollbar focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                                <button 
                                    onClick={handleCopy}
                                    className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <i className="fa-solid fa-check text-emerald-500"></i> : <i className="fa-regular fa-copy"></i>}
                                </button>
                            </div>

                            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl">
                                <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wide mb-2">Next Steps</h4>
                                <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1.5 list-disc pl-4">
                                    <li>Copy the text above.</li>
                                    <li>Locate the platform's official Trust & Safety or Copyright contact form/email.</li>
                                    <li>Paste this text and submit. Keep a record of your submission.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-none p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#111]">
                    {step === 1 ? (
                        <button 
                            onClick={handleGenerate}
                            disabled={!url}
                            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:dark:bg-gray-800 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-purple-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Legal Draft
                        </button>
                    ) : (
                        <button 
                            onClick={handleCopy}
                            className="w-full py-3.5 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-black font-bold rounded-xl transition-colors text-sm shadow-xl flex items-center justify-center gap-2"
                        >
                            {copied ? (
                                <><i className="fa-solid fa-check"></i> Copied to Clipboard</>
                            ) : (
                                <><i className="fa-regular fa-copy"></i> Copy to Clipboard</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
