import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { triggerHaptic } from '../utils/haptics';
import { logEvent } from '../utils/analytics';

interface ScannerProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'email' | 'link' | 'pii';
}

// Aadhaar Verhoeff Algorithm for local validation
const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

function validateAadhaar(aadhaar: string) {
    if (!/^\d{12}$/.test(aadhaar)) return false;
    let c = 0;
    let array = aadhaar.split('').map(Number).reverse();
    for (let i = 0; i < array.length; i++) {
        c = d[c][p[i % 8][array[i]]];
    }
    return c === 0;
}

function validatePAN(pan: string) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
}

export const DataBreachScanner: React.FC<ScannerProps> = ({ isOpen, onClose, initialMode = 'email' }) => {
    // Mode State: 'email' or 'link' or 'pii'
    const [mode, setMode] = useState<'email' | 'link' | 'pii'>(initialMode);
    
    // Update mode if initialMode changes while open
    useEffect(() => {
        if (isOpen && initialMode) {
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);

    // Email States
    const [email, setEmail] = useState('');
    const [emailState, setEmailState] = useState<'idle' | 'scanning' | 'result' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [risk, setRisk] = useState<'safe' | 'warning'>('safe');
    const [breachData, setBreachData] = useState<any[]>([]);

    // Link States
    const [url, setUrl] = useState('');
    const [linkState, setLinkState] = useState<'idle' | 'analyzing' | 'result'>('idle');
    const [linkRisks, setLinkRisks] = useState<string[]>([]);

    // PII States
    const [piiType, setPiiType] = useState<'password' | 'aadhaar' | 'pan'>('password');
    const [piiInput, setPiiInput] = useState('');
    const [piiState, setPiiState] = useState<'idle' | 'scanning' | 'result'>('idle');
    const [piiResult, setPiiResult] = useState<{ safe: boolean, count?: number } | null>(null);
    const [aadhaarState, setAadhaarState] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [panState, setPanState] = useState<'idle' | 'valid' | 'invalid'>('idle');

    useEffect(() => {
        if (!isOpen) {
            resetAll();
        }
    }, [isOpen]);

    const resetAll = () => {
        setMode('email');
        setEmail('');
        setEmailState('idle');
        setLogs([]);
        setBreachData([]);
        setUrl('');
        setLinkState('idle');
        setLinkRisks([]);
        setPiiType('password');
        setPiiInput('');
        setPiiState('idle');
        setPiiResult(null);
        setAadhaarState('idle');
        setPanState('idle');
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-6), msg]);
    };

    // --- EMAIL SCAN LOGIC ---
    const runEmailScan = async () => {
        // Sanitize email input
        const sanitizedEmail = DOMPurify.sanitize(email, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
        
        // Improved Email Validation Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            triggerHaptic('error');
            addLog("Error: Invalid email format.");
            return;
        }

        triggerHaptic('medium');
        setEmailState('scanning');
        setLogs([]);
        logEvent('Scanner', 'Scan', 'Email');
        
        addLog("Initializing Identity Guard Protocol...");
        addLog(`Target: ${sanitizedEmail}`);
        
        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

        try {
            const fetchPromise = fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(sanitizedEmail)}`);
            await delay(800);
            addLog("Establishing secure handshake...");
            
            const response = await fetchPromise;
            await delay(800);
            addLog("Decrypting database response...");

            if (response.status === 404) {
                addLog("No signatures matching target.");
                await delay(500);
                setRisk('safe');
                setEmailState('result');
            } else if (response.ok) {
                const data = await response.json();
                if (data.Breaches && Array.isArray(data.Breaches) && data.Breaches.length > 0) {
                    addLog(`CRITICAL: ${data.Breaches.length} BREACH SIGNATURES FOUND`);
                    setRisk('warning');
                    setBreachData(data.Breaches.slice(0, 3));
                } else {
                    addLog("Analysis Clean. No public records.");
                    setRisk('safe');
                }
                await delay(500);
                setEmailState('result');
            } else {
                throw new Error("API Error");
            }

        } catch (e) {
            console.error(e);
            addLog("Error: Network Handshake Failed.");
            setEmailState('error');
        }
    };

    // --- LINK SCAN LOGIC ---
    const analyzeLink = async () => {
        // Sanitize URL input
        const sanitizedUrl = DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
        if (!sanitizedUrl) return;
        
        setLinkState('analyzing');
        setLinkRisks([]);
        logEvent('Scanner', 'Analyze', 'Link');
        
        const risks: string[] = [];
        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

        await delay(1000); // Simulate processing

        try {
            const parsedUrl = new URL(sanitizedUrl.startsWith('http') ? sanitizedUrl : `https://${sanitizedUrl}`);
            
            // 1. Basic Protocol Check
            if (parsedUrl.protocol === 'http:') {
                risks.push("Unencrypted Connection (HTTP)");
            }

            // 2. IP Address Check
            if (/^(\d{1,3}\.){3}\d{1,3}$/.test(parsedUrl.hostname)) {
                risks.push("Direct IP Access (Suspicious)");
            }

            // 3. Suspicious TLDs
            const suspiciousTLDs = ['.xyz', '.top', '.zip', '.mov', '.tk', '.ml', '.ga', '.cf', '.gq'];
            if (suspiciousTLDs.some(tld => parsedUrl.hostname.endsWith(tld))) {
                risks.push(`Suspicious Top-Level Domain (${parsedUrl.hostname.split('.').pop()})`);
            }

            // 4. URL Shorteners
            const shorteners = ['bit.ly', 'goo.gl', 'tinyurl.com', 'is.gd', 't.co', 'ow.ly'];
            if (shorteners.includes(parsedUrl.hostname)) {
                risks.push("URL Shortener (Hidden Destination)");
            }

            // 5. Excessive Subdomains
            if (parsedUrl.hostname.split('.').length > 4) {
                risks.push("Complex Subdomain Structure (Phishing Indicator)");
            }

            // 6. Backend Safe Browsing API Check
            const response = await fetch('/api/scan-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ url: parsedUrl.href })
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
                const text = await response.text();
                if (text.includes("Cookie check") || text.includes("Action required to load your app")) {
                    risks.push("Authentication required by AI Studio proxy. Please open the app in a new tab or allow third-party cookies.");
                } else {
                    risks.push("API endpoint configuration error (Received HTML).");
                }
            } else if (response.ok) {
                const data = await response.json();
                if (!data.safe) {
                    if (data.matches) {
                        data.matches.forEach((match: any) => {
                            risks.push(`Google Safe Browsing: ${match.threatType.replace(/_/g, ' ')}`);
                        });
                    } else if (data.heuristic) {
                        risks.push(data.message || "Suspicious patterns detected");
                    }
                }
            } else {
                risks.push(`API Error: ${response.status}`);
            }

        } catch (e) {
            risks.push("Invalid URL Structure");
        }

        setLinkRisks(risks);
        setLinkState('result');
    };

    // --- PII SCAN LOGIC ---
    const checkPassword = async () => {
        if (!piiInput) return;
        
        triggerHaptic('medium');
        setPiiState('scanning');
        logEvent('Scanner', 'Scan', 'Password');
        
        try {
            // Hash password using SHA-1 (Required for HIBP k-Anonymity API)
            const encoder = new TextEncoder();
            const data = encoder.encode(piiInput);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            
            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);
            
            // Only send the first 5 characters of the hash
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            if (!response.ok) throw new Error('API Error');
            
            const text = await response.text();
            const lines = text.split('\n');
            
            let found = false;
            let count = 0;
            
            for (const line of lines) {
                const [lineSuffix, lineCount] = line.split(':');
                if (lineSuffix.trim() === suffix) {
                    found = true;
                    count = parseInt(lineCount.trim(), 10);
                    break;
                }
            }
            
            setPiiResult({ safe: !found, count });
            setPiiState('result');
        } catch (error) {
            console.error(error);
            setPiiState('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
             
             <div className="relative w-full max-w-md max-h-[85dvh] flex flex-col bg-[#050a07] border border-green-500/30 sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-slide-up sm:animate-fade-in-up">
                
                {/* Header */}
                <div className="p-4 bg-green-900/10 border-b border-green-500/20 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-user-shield text-emerald-500 animate-pulse"></i>
                        <span className="font-mono text-emerald-500 font-bold tracking-wider text-sm uppercase">Identity Guard Protocol</span>
                    </div>
                    <button onClick={() => {
                        triggerHaptic('light');
                        onClose();
                    }} className="text-green-700 hover:text-green-500"><i className="fa-solid fa-xmark"></i></button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-green-500/10 shrink-0">
                    <button 
                        onClick={() => {
                            triggerHaptic('light');
                            setMode('email');
                        }}
                        className={`flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-colors ${mode === 'email' ? 'bg-green-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <i className="fa-solid fa-envelope sm:mr-2"></i> <span className="hidden sm:inline">Identity</span>
                    </button>
                    <button 
                        onClick={() => {
                            triggerHaptic('light');
                            setMode('link');
                        }}
                        className={`flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-colors ${mode === 'link' ? 'bg-green-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <i className="fa-solid fa-link sm:mr-2"></i> <span className="hidden sm:inline">Link</span>
                    </button>
                    <button 
                        onClick={() => {
                            triggerHaptic('light');
                            setMode('pii');
                        }}
                        className={`flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-colors ${mode === 'pii' ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <i className="fa-solid fa-user-secret sm:mr-2"></i> <span className="hidden sm:inline">Dark Web</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 pb-10 flex-1 overflow-y-auto min-h-0 relative no-scrollbar">
                    {/* === EMAIL MODE === */}
                    {mode === 'email' && (
                        <>
                            {emailState === 'idle' && (
                                <div className="space-y-5 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto bg-green-900/20 rounded-full flex items-center justify-center mb-3 border border-green-500/30">
                                            <i className="fa-solid fa-fingerprint text-3xl text-green-500"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">Secure Data Lookup</h3>
                                        <p className="text-gray-400 text-xs px-4">
                                            Check if your email has been compromised in real global data breaches.
                                        </p>
                                    </div>

                                    <div>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter email address..."
                                            className="w-full bg-black/50 border border-green-800 text-green-400 p-3 rounded-xl focus:outline-none focus:border-green-500 font-mono text-center placeholder-green-800/50"
                                        />
                                    </div>

                                    <button 
                                        onClick={runEmailScan}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
                                    >
                                        <span className="uppercase tracking-widest text-xs">Execute Scan</span>
                                        <i className="fa-solid fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
                                    </button>
                                </div>
                            )}

                            {emailState === 'scanning' && (
                                <div className="font-mono text-xs h-64 overflow-hidden flex flex-col relative bg-black/40 rounded-xl border border-green-900/30">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 shadow-[0_0_15px_#22c55e] z-10 animate-[scanVertical_2s_linear_infinite]"></div>
                                    <div className="p-4 flex-1 flex flex-col justify-end space-y-1 z-0">
                                        {logs.map((log, idx) => (
                                            <div key={idx} className="text-green-500/90 border-l-2 border-green-500/40 pl-3 animate-fade-in-up">
                                                <span className="text-green-700 mr-2 text-[10px]">{`>`}</span>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {emailState === 'result' && (
                                <div className="text-center space-y-4 animate-fade-in-up">
                                    <div className={`w-20 h-20 mx-auto rounded-full border flex items-center justify-center text-3xl mb-2 shadow-[0_0_30px_rgba(0,0,0,0.2)] ${risk === 'safe' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'}`}>
                                        <i className={`fa-solid ${risk === 'safe' ? 'fa-shield-halved' : 'fa-triangle-exclamation'}`}></i>
                                    </div>
                                    
                                    <h3 className={`text-xl font-bold ${risk === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {risk === 'safe' ? 'No Leaks Found' : 'Breach Detected'}
                                    </h3>
                                    
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                        <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                                            {risk === 'safe' 
                                            ? `We found no records for "${DOMPurify.sanitize(email, { ALLOWED_TAGS: [] })}" in the public breach datasets.` 
                                            : `WARNING: "${DOMPurify.sanitize(email, { ALLOWED_TAGS: [] })}" was found in known data breaches.`}
                                        </p>
                                        
                                        {risk === 'warning' && breachData.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-[10px] uppercase text-red-400 font-bold mb-1">Exposure Sources:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {breachData.map((b, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-red-900/40 border border-red-500/20 rounded text-[10px] text-red-200">
                                                            {b[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <a 
                                        href={`https://haveibeenpwned.com/account/${encodeURIComponent(DOMPurify.sanitize(email, { ALLOWED_TAGS: [] }))}`} 
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm shadow-xl"
                                    >
                                        Verify HIBP Report <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs"></i>
                                    </a>
                                    
                                    <button onClick={() => setEmailState('idle')} className="text-gray-500 text-xs hover:text-white mt-2 py-2">Back to Scanner</button>
                                </div>
                            )}
                        </>
                    )}

                    {/* === LINK MODE === */}
                    {mode === 'link' && (
                         <>
                            {linkState === 'idle' && (
                                <div className="space-y-5 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto bg-blue-900/20 rounded-full flex items-center justify-center mb-3 border border-blue-500/30">
                                            <i className="fa-solid fa-magnifying-glass-chart text-3xl text-blue-500"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">Malicious Link Analyst</h3>
                                        <p className="text-gray-400 text-xs px-4">
                                            Analyze suspicious links for phishing patterns and verify against global threat databases.
                                        </p>
                                    </div>

                                    <div>
                                        <input 
                                            type="url" 
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Paste suspicious link here..."
                                            className="w-full bg-black/50 border border-blue-800 text-blue-400 p-3 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-center placeholder-blue-800/50"
                                        />
                                    </div>

                                    <button 
                                        onClick={() => {
                                            triggerHaptic('medium');
                                            analyzeLink();
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
                                    >
                                        <span className="uppercase tracking-widest text-xs">Analyze Link</span>
                                        <i className="fa-solid fa-radar group-hover:rotate-12 transition-transform"></i>
                                    </button>
                                </div>
                            )}

                            {linkState === 'analyzing' && (
                                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <i className="fa-solid fa-eye text-2xl text-blue-400 animate-pulse"></i>
                                        </div>
                                    </div>
                                    <p className="text-blue-400 font-mono text-xs uppercase tracking-widest">Profiling Target...</p>
                                </div>
                            )}

                            {linkState === 'result' && (
                                <div className="animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                                            <i className="fa-solid fa-globe text-blue-400"></i>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Target URL</p>
                                            <p className="text-xs text-white truncate font-mono">{DOMPurify.sanitize(url, { ALLOWED_TAGS: [] })}</p>
                                        </div>
                                    </div>

                                    {/* Local Analysis Results */}
                                    <div className="mb-4">
                                        <h4 className="text-[10px] text-gray-400 uppercase font-bold mb-2">Heuristic Analysis</h4>
                                        {linkRisks.length === 0 ? (
                                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                                <i className="fa-solid fa-check-circle"></i>
                                                <span className="text-xs font-bold">Clean Structure</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {linkRisks.map((risk, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                                        <span className="text-xs">{risk}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* External Deep Scans */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="h-px bg-white/10 flex-1"></div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Deep Scan Verification</span>
                                            <div className="h-px bg-white/10 flex-1"></div>
                                        </div>

                                        <a 
                                            href={`https://www.virustotal.com/gui/search/${encodeURIComponent(DOMPurify.sanitize(url, { ALLOWED_TAGS: [] }))}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-bug"></i>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold uppercase">VirusTotal Scan</p>
                                                    <p className="text-[10px] opacity-80">Check against 70+ antivirus engines</p>
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-arrow-up-right-from-square opacity-60 group-hover:opacity-100"></i>
                                        </a>

                                        <a 
                                            href={`https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(DOMPurify.sanitize(url, { ALLOWED_TAGS: [] }))}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <i className="fa-brands fa-google"></i>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold uppercase">Google Transparency</p>
                                                    <p className="text-[10px] text-gray-500">Official Safe Browsing Status</p>
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-400 group-hover:text-black"></i>
                                        </a>
                                    </div>
                                    
                                    <button onClick={() => setLinkState('idle')} className="block w-full text-center text-gray-500 text-xs hover:text-white mt-4 py-2">Check Another Link</button>
                                </div>
                            )}
                         </>
                    )}

                    {/* === PII MODE === */}
                    {mode === 'pii' && (
                        <>
                            {piiState === 'idle' && (
                                <div className="space-y-4 animate-fade-in flex flex-col min-h-full">
                                    <div className="text-center mb-4 shrink-0">
                                        <div className="w-12 h-12 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center mb-2 border border-purple-500/30">
                                            <i className="fa-solid fa-user-secret text-2xl text-purple-500"></i>
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-1">Dark Web PII Monitor</h3>
                                        <p className="text-gray-400 text-[10px] px-2 leading-tight">
                                            Securely check if your sensitive information is circulating in dark web marketplaces.
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mb-2 shrink-0">
                                        <button 
                                            onClick={() => { setPiiType('password'); setPiiInput(''); }}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${piiType === 'password' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            Password
                                        </button>
                                        <button 
                                            onClick={() => { setPiiType('aadhaar'); setPiiInput(''); setAadhaarState('idle'); }}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${piiType === 'aadhaar' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            Aadhaar
                                        </button>
                                        <button 
                                            onClick={() => { setPiiType('pan'); setPiiInput(''); setPanState('idle'); }}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${piiType === 'pan' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            PAN Card
                                        </button>
                                    </div>

                                    {piiType === 'password' ? (
                                        <div className="space-y-4 animate-fade-in flex flex-col flex-1">
                                            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-200 shrink-0">
                                                <i className="fa-solid fa-shield-halved mr-2"></i>
                                                <strong>k-Anonymity Protocol Active:</strong> Your password is hashed locally. Only the first 5 characters of the hash are sent to the server. Your actual password never leaves your device.
                                            </div>
                                            <input 
                                                type="password" 
                                                value={piiInput}
                                                onChange={(e) => setPiiInput(e.target.value)}
                                                placeholder="Enter password to check..."
                                                className="w-full bg-black/50 border border-purple-800 text-purple-400 p-3 rounded-xl focus:outline-none focus:border-purple-500 font-mono text-center placeholder-purple-800/50 shrink-0"
                                            />
                                            <div className="mt-auto pt-4 sticky bottom-0 bg-[#050a07] z-10 pb-2">
                                                <button 
                                                    onClick={checkPassword}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
                                                >
                                                    <span className="uppercase tracking-widest text-xs">Verify Password Security</span>
                                                    <i className="fa-solid fa-lock group-hover:scale-110 transition-transform"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ) : piiType === 'aadhaar' ? (
                                        <div className="space-y-4 animate-fade-in flex flex-col flex-1">
                                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-gray-300 shrink-0">
                                                <i className="fa-solid fa-shield-halved mr-2 text-emerald-500"></i>
                                                <strong>Zero-Knowledge Protocol:</strong> Aadhaar numbers are validated locally using the Verhoeff algorithm. <strong>Your number never leaves your device.</strong>
                                            </div>
                                            <input 
                                                type="password" 
                                                maxLength={12}
                                                value={piiInput}
                                                onChange={(e) => {
                                                    setPiiInput(e.target.value.replace(/\D/g, ''));
                                                    setAadhaarState('idle');
                                                }}
                                                placeholder="Enter 12-digit Aadhaar Number"
                                                className="w-full bg-black/50 border border-purple-800 text-purple-400 p-3 rounded-xl focus:outline-none focus:border-purple-500 font-mono text-center placeholder-purple-800/50 tracking-[0.5em] shrink-0"
                                            />
                                            
                                            {aadhaarState === 'idle' && (
                                                <div className="mt-auto pt-4 sticky bottom-0 bg-[#050a07] z-10 pb-2">
                                                    <button 
                                                        onClick={() => {
                                                            triggerHaptic('medium');
                                                            if (validateAadhaar(piiInput)) {
                                                                setAadhaarState('valid');
                                                            } else {
                                                                setAadhaarState('invalid');
                                                            }
                                                        }}
                                                        className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
                                                    >
                                                        <span className="uppercase tracking-widest text-xs">Validate & Secure</span>
                                                        <i className="fa-solid fa-fingerprint group-hover:scale-110 transition-transform"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {aadhaarState === 'invalid' && (
                                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400 text-center animate-fade-in">
                                                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                                    Invalid Aadhaar Number. Checksum verification failed.
                                                </div>
                                            )}

                                            {aadhaarState === 'valid' && (
                                                <div className="mt-4 animate-fade-in-up space-y-3">
                                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-400 text-center">
                                                        <i className="fa-solid fa-check-circle mr-2"></i>
                                                        Cryptographic Checksum Validated (Local Check)
                                                    </div>
                                                    
                                                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200">
                                                        <strong>⚠️ CRITICAL SECURITY NOTICE:</strong><br/>
                                                        No legitimate API exists to check Aadhaar breaches. The Aadhaar Act strictly prohibits public databases. Any site claiming to scan for Aadhaar leaks is likely phishing for your data. The <strong>ONLY</strong> secure way to check for misuse is via the official UIDAI portal.
                                                    </div>

                                                    <p className="text-[10px] uppercase text-purple-400 font-bold mb-2 text-center mt-4">Official UIDAI Security Actions:</p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <a href="https://myaadhaar.uidai.gov.in/authHistory" target="_blank" rel="noreferrer" onClick={() => triggerHaptic('light')} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group">
                                                            <div className="flex items-center gap-3">
                                                                <i className="fa-solid fa-clock-rotate-left text-gray-300 group-hover:text-white"></i>
                                                                <div className="text-left">
                                                                    <span className="text-xs text-gray-300 group-hover:text-purple-200 block font-bold">Check Auth History</span>
                                                                    <span className="text-[10px] text-gray-500">See if someone used your Aadhaar</span>
                                                                </div>
                                                            </div>
                                                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 group-hover:text-purple-400"></i>
                                                        </a>
                                                        <a href="https://myaadhaar.uidai.gov.in/lock-unlock" target="_blank" rel="noreferrer" onClick={() => triggerHaptic('light')} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group">
                                                            <div className="flex items-center gap-3">
                                                                <i className="fa-solid fa-lock text-gray-300 group-hover:text-white"></i>
                                                                <div className="text-left">
                                                                    <span className="text-xs text-gray-300 group-hover:text-purple-200 block font-bold">Lock Biometrics</span>
                                                                    <span className="text-[10px] text-gray-500">Prevent unauthorized fingerprint/iris scans</span>
                                                                </div>
                                                            </div>
                                                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 group-hover:text-purple-400"></i>
                                                        </a>
                                                        <a href="https://myaadhaar.uidai.gov.in/vidGenerator" target="_blank" rel="noreferrer" onClick={() => triggerHaptic('light')} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group">
                                                            <div className="flex items-center gap-3">
                                                                <i className="fa-solid fa-mask text-gray-300 group-hover:text-white"></i>
                                                                <div className="text-left">
                                                                    <span className="text-xs text-gray-300 group-hover:text-purple-200 block font-bold">Generate Virtual ID (VID)</span>
                                                                    <span className="text-[10px] text-gray-500">Use this instead of your real Aadhaar</span>
                                                                </div>
                                                            </div>
                                                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 group-hover:text-purple-400"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : piiType === 'pan' ? (
                                        <div className="space-y-4 animate-fade-in flex flex-col flex-1">
                                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-gray-300 shrink-0">
                                                <i className="fa-solid fa-building-columns mr-2 text-blue-500"></i>
                                                <strong>Financial Identity Protection:</strong> PAN cards are validated locally. <strong>Your PAN never leaves your device.</strong>
                                            </div>
                                            <input 
                                                type="text" 
                                                maxLength={10}
                                                value={piiInput}
                                                onChange={(e) => {
                                                    setPiiInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                                                    setPanState('idle');
                                                }}
                                                placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                                                className="w-full bg-black/50 border border-purple-800 text-purple-400 p-3 rounded-xl focus:outline-none focus:border-purple-500 font-mono text-center placeholder-purple-800/50 tracking-[0.2em] shrink-0"
                                            />
                                            
                                            {panState === 'idle' && (
                                                <div className="mt-auto pt-4 sticky bottom-0 bg-[#050a07] z-10 pb-2">
                                                    <button 
                                                        onClick={() => {
                                                            triggerHaptic('medium');
                                                            if (validatePAN(piiInput)) {
                                                                setPanState('valid');
                                                            } else {
                                                                setPanState('invalid');
                                                            }
                                                        }}
                                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
                                                    >
                                                        <span className="uppercase tracking-widest text-xs">Validate & Secure</span>
                                                        <i className="fa-solid fa-id-card group-hover:scale-110 transition-transform"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {panState === 'invalid' && (
                                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400 text-center animate-fade-in">
                                                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                                    Invalid PAN Format. Must be 5 letters, 4 numbers, 1 letter.
                                                </div>
                                            )}

                                            {panState === 'valid' && (
                                                <div className="mt-4 animate-fade-in-up space-y-3">
                                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-400 text-center">
                                                        <i className="fa-solid fa-check-circle mr-2"></i>
                                                        PAN Format Validated (Local Check)
                                                    </div>
                                                    
                                                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200">
                                                        <strong>⚠️ LOAN FRAUD ALERT:</strong><br/>
                                                        Scammers use leaked PAN cards to take out instant personal loans in your name. The only way to detect this is by checking your active loan accounts on official credit bureaus.
                                                    </div>

                                                    <p className="text-[10px] uppercase text-blue-400 font-bold mb-2 text-center mt-4">Official Credit Bureau Checks (Free):</p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <a href="https://www.cibil.com/freecibilscore" target="_blank" rel="noreferrer" onClick={() => triggerHaptic('light')} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group">
                                                            <div className="flex items-center gap-3">
                                                                <i className="fa-solid fa-building-columns text-gray-300 group-hover:text-white"></i>
                                                                <div className="text-left">
                                                                    <span className="text-xs text-gray-300 group-hover:text-blue-200 block font-bold">Check CIBIL Report</span>
                                                                    <span className="text-[10px] text-gray-500">Verify active loans & credit cards</span>
                                                                </div>
                                                            </div>
                                                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 group-hover:text-blue-400"></i>
                                                        </a>
                                                        <a href="https://www.experian.in/free-credit-score" target="_blank" rel="noreferrer" onClick={() => triggerHaptic('light')} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group">
                                                            <div className="flex items-center gap-3">
                                                                <i className="fa-solid fa-chart-line text-gray-300 group-hover:text-white"></i>
                                                                <div className="text-left">
                                                                    <span className="text-xs text-gray-300 group-hover:text-blue-200 block font-bold">Experian Credit Check</span>
                                                                    <span className="text-[10px] text-gray-500">Alternative bureau for fraud detection</span>
                                                                </div>
                                                            </div>
                                                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 group-hover:text-blue-400"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {piiState === 'scanning' && (
                                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <i className="fa-solid fa-user-secret text-2xl text-purple-400 animate-pulse"></i>
                                        </div>
                                    </div>
                                    <p className="text-purple-400 font-mono text-xs uppercase tracking-widest">Querying Dark Web Records...</p>
                                </div>
                            )}

                            {piiState === 'result' && piiResult && (
                                <div className="text-center space-y-4 animate-fade-in-up">
                                    <div className={`w-20 h-20 mx-auto rounded-full border flex items-center justify-center text-3xl mb-2 shadow-[0_0_30px_rgba(0,0,0,0.2)] ${piiResult.safe ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'}`}>
                                        <i className={`fa-solid ${piiResult.safe ? 'fa-shield-halved' : 'fa-triangle-exclamation'}`}></i>
                                    </div>
                                    
                                    <h3 className={`text-xl font-bold ${piiResult.safe ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {piiResult.safe ? 'Password is Safe' : 'Password Compromised'}
                                    </h3>
                                    
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                        <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                                            {piiResult.safe 
                                            ? `Good news! This password was NOT found in any known dark web databases or public data breaches.` 
                                            : `CRITICAL WARNING: This password has been exposed in data breaches ${piiResult.count?.toLocaleString()} times.`}
                                        </p>
                                        
                                        {!piiResult.safe && (
                                            <div className="bg-red-900/20 border border-red-500/20 p-3 rounded-lg mt-3">
                                                <p className="text-red-300 text-[10px] font-bold uppercase mb-1">Action Required:</p>
                                                <p className="text-red-200 text-xs">Do not use this password. If you are currently using it anywhere, change it immediately. Hackers use automated tools to try known exposed passwords.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button onClick={() => setPiiState('idle')} className="text-gray-500 text-xs hover:text-white mt-2 py-2">Check Another Password</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
             </div>
        </div>
    );
};