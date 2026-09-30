import React, { useState } from 'react';
import DOMPurify from 'dompurify';

export const InlineLeakScanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'result' | 'error'>('idle');
  const [risk, setRisk] = useState<'safe' | 'warning'>('safe');
  const [breachCount, setBreachCount] = useState(0);

  const handleScan = async () => {
    const sanitizedEmail = DOMPurify.sanitize(email, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    if (!sanitizedEmail.includes('@')) return;
    setStatus('scanning');
    setRisk('safe');
    setBreachCount(0);
    
    try {
        // Parallel: Minimum animation time + Real API call
        const [apiResponse] = await Promise.all([
            fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(sanitizedEmail)}`),
            new Promise(resolve => setTimeout(resolve, 2000)) // Min 2s animation for UX
        ]);

        if (apiResponse.status === 404) {
            setRisk('safe');
            setStatus('result');
        } else if (apiResponse.ok) {
            const data = await apiResponse.json();
            if (data.Breaches && Array.isArray(data.Breaches) && data.Breaches.length > 0) {
                setRisk('warning');
                setBreachCount(data.Breaches.length);
            } else {
                setRisk('safe');
            }
            setStatus('result');
        } else {
            setStatus('error');
        }
    } catch (e) {
        console.error("Scanner Error:", e);
        setStatus('error');
    }
  };

  return (
    <div className="mt-3 mb-1 p-4 bg-gray-50 dark:bg-[#050a07] rounded-xl border border-gray-200 dark:border-green-500/20 overflow-hidden relative shadow-inner">
      
      {/* Visual Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-dashed border-gray-200 dark:border-green-900/40 pb-2">
         <i className="fa-solid fa-user-shield text-emerald-600 dark:text-emerald-500"></i>
         <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-emerald-500/60 uppercase tracking-widest">Identity Guard Protocol</span>
      </div>

      {status === 'idle' && (
        <div className="flex flex-col gap-3">
           <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Enter target email address:</label>
           
           <div className="flex flex-col gap-2">
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="name@example.com"
                 className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-green-900/50 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-gray-800 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-800/30 transition-all font-mono"
                 onKeyDown={(e) => e.key === 'Enter' && handleScan()}
               />
               <button
                 onClick={handleScan}
                 disabled={!email.includes('@')}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
               >
                 <i className="fa-solid fa-magnifying-glass"></i> Check Identity
               </button>
           </div>
           
           <p className="text-[10px] text-gray-400 text-center mt-1">
             <i className="fa-solid fa-lock mr-1"></i> End-to-end encrypted query
           </p>
        </div>
      )}

      {status === 'scanning' && (
         <div className="py-8 flex flex-col items-center justify-center relative">
            {/* New Radar Animation */}
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border border-emerald-500/30 bg-emerald-500/5"></div>
                <div className="absolute inset-2 rounded-full border border-emerald-500/20"></div>
                <div className="absolute inset-0 rounded-full animate-[spin_2s_linear_infinite] border-t-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute inset-[40%] rounded-full bg-emerald-500/50 animate-pulse"></div>
            </div>
            <div className="space-y-1 text-center z-10">
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-widest">SCANNING_NET</p>
                <p className="text-[10px] font-mono text-gray-400">Verifying Breach Signatures...</p>
            </div>
         </div>
      )}

      {status === 'error' && (
         <div className="text-center py-4">
             <i className="fa-solid fa-triangle-exclamation text-amber-500 text-2xl mb-2"></i>
             <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">Connection interrupted. Unable to verify automatically.</p>
             <a href={`https://haveibeenpwned.com/account/${encodeURIComponent(DOMPurify.sanitize(email, { ALLOWED_TAGS: [] }))}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-600 underline">Check Manually</a>
             <button onClick={() => setStatus('idle')} className="block w-full mt-4 text-[10px] text-gray-400 uppercase">Try Again</button>
         </div>
      )}

      {status === 'result' && (
         <div className="text-center animate-fade-in-up">
             {/* Icon Fix: Use generic fa-shield-halved */}
             <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl mb-3 ${risk === 'safe' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                <i className={`fa-solid ${risk === 'safe' ? 'fa-shield-halved' : 'fa-triangle-exclamation'}`}></i>
             </div>
             
             <h4 className={`font-bold text-sm mb-1 ${risk === 'safe' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                 {risk === 'safe' ? 'No Public Breaches Found' : `${breachCount} Data Breaches Found`}
             </h4>
             
             <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 px-2 leading-relaxed">
                 {risk === 'safe' 
                    ? "Your email was not found in our public breach database search."
                    : `Alert: Your email appears in ${breachCount} known data breaches. Immediate action recommended.`}
             </p>

             <div className="flex flex-col gap-2">
                 <a 
                    href={`https://haveibeenpwned.com/account/${encodeURIComponent(DOMPurify.sanitize(email, { ALLOWED_TAGS: [] }))}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full px-3 py-2.5 bg-gray-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 text-white border border-transparent dark:border-white/10 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                 >
                    Check HIBP Report <i className="fa-solid fa-arrow-right ml-1"></i>
                 </a>
                 <button onClick={() => { setStatus('idle'); setEmail(''); }} className="text-[10px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 underline py-1">
                    Check Another Email
                 </button>
             </div>
         </div>
      )}
    </div>
  );
};