import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Message, EmailDraft, TakedownStep, SecurityGuide, ProtectionStep } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { loadSession, saveSession } from '../services/storageService';
import { WELCOME_MESSAGE, INITIAL_SUGGESTIONS, EXTENDED_SUGGESTIONS } from '../constants';
import { TakedownVisualizer } from './TakedownVisualizer';
import { ProtectionVisualizer } from './ProtectionVisualizer';
import { SecurityChecklist } from './SecurityChecklist';
import { InlineLeakScanner } from './InlineLeakScanner';
import { GuidedIntake } from './GuidedIntake';
import { AboutPage } from './AboutPage';
import { triggerHaptic } from '../utils/haptics';
import { logEvent } from '../utils/analytics';

interface ChatProps {
    onInfoClick: () => void;
    onOpenTakedown?: () => void;
    onOpenUpiFraud?: () => void;
    onOpenScanner?: () => void;
    onOpenSupport?: () => void;
}

const MarkdownRenderer: React.FC<{ text: string; isUser: boolean; onCommand: () => void; onOpenScanner?: (mode: 'email' | 'link' | 'pii') => void }> = ({ text, isUser, onCommand, onOpenScanner }) => {
    return (
        <ReactMarkdown
            components={{
                a: ({ href, children }) => {
                    if (href === '#command-center' || href === 'command:center') {
                        return (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onCommand();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 ml-1 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all uppercase tracking-wide shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95"
                            >
                                {children} <i className="fa-solid fa-layer-group text-[10px]"></i>
                            </button>
                        );
                    }
                    if (href?.startsWith('#scanner-')) {
                        const mode = href.replace('#scanner-', '') as 'email' | 'link' | 'pii';
                        return (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onOpenScanner) onOpenScanner(mode);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 ml-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all uppercase tracking-wide shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95"
                            >
                                {children} <i className="fa-solid fa-user-shield text-[10px]"></i>
                            </button>
                        );
                    }
                    return (
                        <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`underline ${isUser ? 'text-white decoration-white/50' : 'text-blue-600 dark:text-blue-400 decoration-blue-500/30'}`}
                        >
                            {children}
                        </a>
                    );
                },
                p: ({ children }) => {
                    const textContent = React.Children.toArray(children).reduce<string>((acc, child) => {
                        if (typeof child === 'string') return acc + child;
                        if (React.isValidElement(child) && typeof child.props.children === 'string') return acc + child.props.children;
                        return acc;
                    }, '');
                    
                    if (textContent.includes('Privacy Note:')) {
                        return (
                            <div className="bg-amber-50/30 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-800/20 rounded-xl p-3 my-3 text-amber-700 dark:text-amber-400 text-[11px] flex items-start gap-2.5 opacity-90 shadow-sm">
                                <i className="fa-solid fa-triangle-exclamation mt-0.5 text-xs opacity-70"></i>
                                <div className="leading-relaxed font-medium">{children}</div>
                            </div>
                        );
                    }

                    if (textContent.includes('🛡️ Future Protection')) {
                        return (
                            <div className="flex items-center gap-2 mt-6 mb-3 text-emerald-600 dark:text-emerald-400">
                                <i className="fa-solid fa-shield-halved text-lg"></i>
                                <span className="text-sm font-black uppercase tracking-widest">{children}</span>
                            </div>
                        );
                    }

                    if (textContent.includes('ACT IMMEDIATELY')) {
                        return (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 my-2 text-red-500 text-xs font-black uppercase tracking-tighter text-center animate-pulse">
                                {children}
                            </div>
                        );
                    }

                    return <p className="mb-3 last:mb-0 leading-relaxed text-gray-700 dark:text-gray-200">{children}</p>;
                },
                ul: ({ children }) => <ul className="list-none mb-4 space-y-2.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-none mb-4 space-y-2.5 counter-reset-step">{children}</ol>,
                li: ({ children }) => {
                    return (
                        <li className="flex items-start gap-3 group">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors flex-shrink-0" />
                            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{children}</div>
                        </li>
                    );
                },
                h1: ({ children }) => (
                    <h1 className="text-xl font-black mb-4 mt-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                        {children}
                    </h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-lg font-black mb-3 mt-5 text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-white/5 pb-1">
                        {children}
                    </h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-sm font-bold mb-2 mt-4 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {children}
                    </h3>
                ),
                strong: ({ children }) => (
                    <strong className="font-black text-gray-900 dark:text-white bg-emerald-500/10 px-1 rounded">
                        {children}
                    </strong>
                ),
                h6: ({ children }) => <h6 className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-4 leading-tight">{children}</h6>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 italic my-2 opacity-80">{children}</blockquote>,
                code: ({ children, className }) => {
                    return (
                        <code className={`font-mono text-xs px-1 py-0.5 rounded ${isUser ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>
                            {children}
                        </code>
                    );
                },
                pre: ({ children }) => <pre className="overflow-x-auto p-2 rounded bg-black/5 dark:bg-black/30 my-2">{children}</pre>,
            }}
        >
            {text}
        </ReactMarkdown>
    );
};

export const ChatInterface: React.FC<ChatProps> = ({ onInfoClick, onOpenTakedown, onOpenUpiFraud, onOpenScanner, onOpenSupport }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const [showExtended, setShowExtended] = useState(false);
  const [isGuidedIntakeOpen, setIsGuidedIntakeOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMessages = loadSession();
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      setMessages([{
        id: 'init-1',
        role: 'model',
        text: WELCOME_MESSAGE,
        timestamp: Date.now()
      }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveSession(messages);
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  }, [messages, isLoading, suggestions, showExtended]); 

  // --- CRYPTOGRAPHY: Client-Side SHA-256 Hashing ---
  const computeSHA256 = async (file: File): Promise<string> => {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      triggerHaptic('medium');
      setIsLoading(true);
      logEvent('Chat', 'Upload', 'Evidence');
      
      try {
          // 1. Calculate Hash (Zero-Knowledge: File never leaves device)
          const hash = await computeSHA256(file);
          
          // 2. Clear input to allow re-selection
          event.target.value = '';

          // 3. Create Evidence Message
          const userMsg: Message = {
              id: Date.now().toString(),
              role: 'user',
              text: `Secure Evidence Upload: ${file.name}`,
              timestamp: Date.now(),
              evidenceHash: hash,
              fileName: file.name
          };

          // 4. Create Bot Response (No AI Processing)
          const botMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              text: "I have generated a secure digital fingerprint (SHA-256 hash) for your file. **Your file has not been uploaded to any server.**\n\nPlease copy this hash number and attach it with your official police complaint or platform report. It proves the evidence has not been tampered with.",
              timestamp: Date.now() + 1
          };

          setMessages(prev => [...prev, userMsg, botMsg]);
          setIsLoading(false);

      } catch (error) {
          console.error("Hashing failed", error);
          setIsLoading(false);
      }
  };

  const handleSend = async (text: string) => {
    // 1. Deep Sanitization for AI API Call (Requirement)
    let aiSanitized = text.replace(/<[^>]*>/g, '');
    aiSanitized = aiSanitized.replace(/<script|javascript:|onerror=|onload=/gi, '');
    aiSanitized = aiSanitized.trim();
    
    let isTruncated = false;
    if (aiSanitized.length > 1000) {
        aiSanitized = aiSanitized.substring(0, 1000);
        isTruncated = true;
    }

    // 2. Initial sanitization for display/local processing
    const displaySanitized = DOMPurify.sanitize(aiSanitized, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    
    if (!displaySanitized || isLoading) return;

    triggerHaptic('light');
    setInputValue('');
    setSuggestions([]); 
    setShowExtended(false); 
    logEvent('Chat', 'Message', 'Sent');

    // If truncated, show a warning as a system message
    if (isTruncated) {
        const warningMsg: Message = {
            id: `warning-${Date.now()}`,
            role: 'model',
            text: "⚠️ Message too long, trimmed to 1000 characters.",
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, warningMsg]);
    }

    if (displaySanitized === "Identity Guard Protocol" || displaySanitized === "Check Identity Leak" || displaySanitized === "Check if email is leaked" || displaySanitized === "Check for Leaks") {
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: displaySanitized, timestamp: Date.now() };
        const toolMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: "I've activated the Identity Guard Protocol. You can scan for email breaches or analyze suspicious links.", 
            timestamp: Date.now() + 1,
            widget: 'email-scanner'
        };
        setMessages(prev => [...prev, userMsg, toolMsg]);
        setTimeout(() => setSuggestions(INITIAL_SUGGESTIONS), 1000);
        return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: displaySanitized,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let accumulatedText = '';
      const modelMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: 'model',
        text: '',
        timestamp: Date.now() + 1
      }]);

      // Use aiSanitized for the API call (Requirement)
      const rawResponse = await sendMessageToGemini(messages, aiSanitized, (chunk) => {
        accumulatedText += chunk;
        let displayText = accumulatedText;
        // Hide JSON blocks and suggestions while streaming
        displayText = displayText.replace(/:::[\s\S]*?(?:::|$)/g, '');
        displayText = displayText.replace(/<<[\s\S]*?(?:>>|$)/g, '');
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, text: displayText.trim() } : msg
        ));
      });
      
      // Remove the temporary streaming message
      setMessages(prev => prev.filter(msg => msg.id !== modelMessageId));
      
      processGeminiResponse(rawResponse);
    } catch (error) {
      console.error("Chat error", error);
      setSuggestions(INITIAL_SUGGESTIONS);
      setIsLoading(false);
    }
  };

  // Helper to parse JSON safely, handling common LLM errors like newlines inside strings
  const safeParseJSON = (str: string): any => {
      try {
          return JSON.parse(str);
      } catch (e) {
          // Attempt 1: Remove structural newlines and control characters that might break parsing
          try {
              // This is a naive approach: if we just strip newlines, we might fix some issues,
              // but it removes them from string values too.
              const stripped = str.replace(/[\n\r\t]/g, ' ');
              return JSON.parse(stripped);
          } catch (e2) {
              // Attempt 2: Truncated JSON? Try to find last valid closing brace
              try {
                  const lastBrace = str.lastIndexOf('}');
                  if (lastBrace !== -1) {
                      const subStr = str.substring(0, lastBrace + 1);
                      return JSON.parse(subStr.replace(/[\n\r\t]/g, ' '));
                  }
              } catch (e3) {
                  console.error("JSON Recovery Failed", e3);
              }
              return null;
          }
      }
  };

  // Factored out response processing to reuse in file upload
  const processGeminiResponse = (rawResponse: string) => {
      let cleanText = rawResponse;
      let newSuggestions: string[] = [];
      let emailDraftData: EmailDraft | undefined;
      let takedownGuideData: TakedownStep[] | undefined;
      let securityGuideData: SecurityGuide | undefined;
      let protectionGuideData: ProtectionStep[] | undefined;

      // Regex Updates: Use [\s\S]*? for multiline content and (?:::|$) to handle missing closing tag
      
      // 1. TAKEDOWN JSON
      const takedownMatch = rawResponse.match(/:::TAKEDOWN_JSON::([\s\S]*?)(?:::|$)/);
      if (takedownMatch) {
          let jsonStr = takedownMatch[1].trim();
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          
          const parsed = safeParseJSON(jsonStr);
          if (parsed) {
              if (Array.isArray(parsed)) {
                  takedownGuideData = parsed;
              } else if (parsed.steps && Array.isArray(parsed.steps)) {
                  takedownGuideData = parsed.steps;
              }
              // Only remove text if parse succeeded
              cleanText = cleanText.replace(takedownMatch[0], '').trim();
          }
      }

      // 2. SECURITY JSON
      const securityMatch = rawResponse.match(/:::SECURITY_JSON::([\s\S]*?)(?:::|$)/);
      if (securityMatch) {
          let jsonStr = securityMatch[1].trim();
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          
          const parsed = safeParseJSON(jsonStr);
          if (parsed) {
              if (Array.isArray(parsed) && parsed.length > 0) {
                  securityGuideData = parsed[0];
              } else {
                  securityGuideData = parsed;
              }
              cleanText = cleanText.replace(securityMatch[0], '').trim();
          }
      }

      // 3. PROTECTION JSON
      const protectionMatch = rawResponse.match(/:::PROTECTION_JSON::([\s\S]*?)(?:::|$)/);
      if (protectionMatch) {
          let jsonStr = protectionMatch[1].trim();
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          
          const parsed = safeParseJSON(jsonStr);
          if (parsed) {
              if (Array.isArray(parsed)) {
                  protectionGuideData = parsed;
              } else if (parsed.steps && Array.isArray(parsed.steps)) {
                  protectionGuideData = parsed.steps;
              }
              cleanText = cleanText.replace(protectionMatch[0], '').trim();
          }
      }

      // 4. EMAIL JSON
      const emailMatch = rawResponse.match(/:::EMAIL_JSON::([\s\S]*?)(?:::|$)/);
      if (emailMatch) {
          let jsonStr = emailMatch[1].trim();
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          
          const parsed = safeParseJSON(jsonStr);
          if (parsed) {
              emailDraftData = parsed;
              cleanText = cleanText.replace(emailMatch[0], '').trim();
          }
      }

      // 4. WIDGET JSON
      let widgetType: string | undefined;
      const widgetMatch = rawResponse.match(/:::WIDGET_JSON::([\s\S]*?)(?:::|$)/);
      if (widgetMatch) {
          let jsonStr = widgetMatch[1].trim();
          const parsed = safeParseJSON(jsonStr);
          if (parsed && parsed.type) {
              widgetType = parsed.type;
              cleanText = cleanText.replace(widgetMatch[0], '').trim();
          }
      }

      const suggestionMatch = rawResponse.match(/<<Next:\s*(.*?)>>/);
      if (suggestionMatch) {
          cleanText = cleanText.replace(suggestionMatch[0], '').trim();
          newSuggestions = suggestionMatch[1].split('|').map(s => s.trim());
      }

      // --- AGGRESSIVE CLEANUP ---
      // 1. Remove trailing colons at end of text
      cleanText = cleanText.replace(/[:：]\s*$/, '').trim();
      
      // 2. Remove isolated colons on their own lines (caused by removing JSON blocks that were preceded by a colon)
      // Matches a line containing only a colon (with optional whitespace)
      cleanText = cleanText.replace(/^\s*[:：]\s*$/gm, '');

      // 3. Collapse multiple newlines (3 or more) into just 2 to prevent huge gaps
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanText,
        timestamp: Date.now(),
        emailDraft: emailDraftData,
        takedownGuide: takedownGuideData,
        securityGuide: securityGuideData,
        protectionGuide: protectionGuideData,
        widget: widgetType as any
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (newSuggestions.length > 0) {
          setSuggestions(newSuggestions);
      } else {
          setSuggestions(INITIAL_SUGGESTIONS);
      }
      setIsLoading(false);
  };

  const handleLaunchEmail = (draft: EmailDraft) => {
      triggerHaptic('medium');
      logEvent('Action', 'Email', 'Launch');
      const subject = encodeURIComponent(draft.subject);
      // Fix: Convert newlines to CRLF (%0D%0A) for correct rendering in email clients
      const body = encodeURIComponent(draft.body.replace(/\r?\n/g, '\r\n'));
      const mailtoLink = `mailto:${draft.to}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_self');
  };

  const copyToClipboard = async (text: string) => {
      triggerHaptic('light');
      logEvent('Action', 'Copy', 'Clipboard');
      try {
          await navigator.clipboard.writeText(text);
      } catch (err) {
          console.error("Failed to copy", err);
      }
  };

  const getCategoryColor = (category: string) => {
      switch (category) {
          case 'Emergency & Fraud': return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30';
          case 'Account Recovery': return 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30';
          case 'Legal Assistance': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30';
          case 'Device Security': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30';
          case 'Privacy Tools': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30';
          default: return 'text-gray-500 bg-gray-50';
      }
  };

  return (
    <div className="relative w-full h-full">
      {/* Hidden File Input */}
      <input 
        type="file" 
        id="file-upload"
        aria-label="Upload image or video evidence"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*"
      />

      {/* Messages Scroll Area */}
      <div className="absolute inset-0 overflow-y-auto p-4 space-y-6 no-scrollbar pb-48">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-[90%] sm:max-w-[85%] p-5 rounded-2xl text-sm sm:text-base leading-relaxed animate-fade-in border break-words overflow-hidden [overflow-wrap:anywhere] ${
                  isUser
                    ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-tr-sm border-green-500/50 shadow-lg shadow-green-500/10'
                    : 'bg-gradient-to-br from-white/90 to-white/90 dark:from-[#111816]/90 dark:to-[#111816]/90 backdrop-blur-xl text-gray-800 dark:text-gray-100 rounded-tl-sm border-gray-100 dark:border-green-900/20 shadow-md'
                }`}
              >
                {/* --- DIGITAL FINGERPRINT CARD --- */}
                {msg.evidenceHash && (
                    <div className="mb-3 bg-black/40 rounded-xl p-3 border border-emerald-500/30 font-mono">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                            <i className="fa-solid fa-file-shield text-lg"></i>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Evidence Secured</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs text-gray-300">
                                <span className="opacity-60">File:</span>
                                <span className="font-bold truncate max-w-[120px]">{msg.fileName}</span>
                            </div>
                            <div className="bg-black/50 p-2 rounded border border-white/5 relative group">
                                <p className="text-[10px] text-emerald-500/80 break-all leading-tight font-bold">
                                    {msg.evidenceHash}
                                </p>
                                <button 
                                    onClick={() => copyToClipboard(msg.evidenceHash!)}
                                    className="absolute right-1 top-1 p-1 bg-emerald-900/80 text-emerald-400 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    COPY
                                </button>
                            </div>
                            <p className="text-[9px] text-gray-500 italic text-center mt-1">
                                <i className="fa-solid fa-lock mr-1"></i>
                                SHA-256 Hash generated locally. File not uploaded.
                            </p>
                        </div>
                    </div>
                )}

                {msg.takedownGuide && (
                    <TakedownVisualizer steps={msg.takedownGuide} />
                )}

                {msg.securityGuide && (
                    <SecurityChecklist data={msg.securityGuide} />
                )}

                {msg.protectionGuide && (
                    <ProtectionVisualizer steps={msg.protectionGuide} />
                )}

                <div className={`markdown-content ${isUser ? 'text-white' : ''}`}>
                    <MarkdownRenderer text={msg.text} isUser={isUser} onCommand={() => setShowExtended(true)} onOpenScanner={onOpenScanner} />
                </div>

                {msg.widget === 'email-scanner' && (
                    <InlineLeakScanner />
                )}
                
                {msg.emailDraft && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                        <div className="bg-emerald-50 dark:bg-green-900/20 rounded-xl p-4 border border-emerald-100 dark:border-green-800/30">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-green-800/50 flex items-center justify-center text-emerald-600 dark:text-green-300 flex-shrink-0">
                                    <i className="fa-solid fa-envelope-open-text text-lg"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Draft Ready</p>
                                    <div className="flex items-baseline gap-1 overflow-hidden">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap flex-shrink-0">To:</span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{msg.emailDraft.to}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">Subject: {msg.emailDraft.subject}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleLaunchEmail(msg.emailDraft!)}
                                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                <span>Send Email Now</span>
                                <i className="fa-solid fa-paper-plane group-hover:translate-x-1 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                )}

                {!isUser && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                        <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1">
                           <i className="fa-solid fa-shield-cat text-xs text-green-500/50"></i> Grid Safety AI
                        </div>
                        <button 
                            onClick={() => copyToClipboard(msg.text)}
                            className="text-gray-400 hover:text-green-500 transition-colors p-1"
                            title="Copy"
                        >
                            <i className="fa-regular fa-copy text-xs"></i>
                        </button>
                    </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
           <div className="flex justify-start w-full">
             <div className="bg-white/90 dark:bg-[#111816]/90 p-4 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-green-900/20 shadow-sm backdrop-blur-md">
                <div className="flex flex-col gap-2">
                    <div className="flex space-x-2 items-center h-5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-mono uppercase tracking-widest animate-pulse">
                        Processing Securely...
                    </span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-white/70 dark:bg-[#020402]/80 backdrop-blur-2xl border-t border-gray-200/50 dark:border-green-900/20 pb-safe z-30 transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        
        {/* Quick Suggestion Chips */}
        {!isLoading && !showExtended && (
            <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                {suggestions.map((s, i) => (
                    <button 
                        key={i}
                        onClick={() => {
                            handleSend(s);
                            logEvent('Chat', 'Suggestion', s);
                        }}
                        className="flex-shrink-0 px-4 py-2 bg-gray-50/80 dark:bg-[#0a150e]/80 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs font-semibold text-gray-700 dark:text-green-100 rounded-xl border border-gray-200 dark:border-green-800/30 transition-all active:scale-95 shadow-sm whitespace-nowrap backdrop-blur-sm"
                    >
                        {s}
                    </button>
                ))}
                <button 
                    onClick={() => {
                        triggerHaptic('light');
                        setShowExtended(true);
                        logEvent('Chat', 'Menu', 'Extended');
                    }}
                    className="flex-shrink-0 px-4 py-2 text-xs font-bold rounded-xl border transition-all active:scale-95 shadow-sm whitespace-nowrap backdrop-blur-sm bg-gray-50/80 dark:bg-[#0a150e]/80 text-green-600 dark:text-green-400 border-gray-200 dark:border-green-800/30"
                >
                    More +
                </button>
            </div>
        )}

        {/* Extended Menu */}
        {showExtended && (
            <div className="px-4 pt-2 pb-2 animate-fade-in-up">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Command Center</span>
                    <button onClick={() => {
                        triggerHaptic('light');
                        setShowExtended(false);
                    }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-sm"></i>
                    </button>
                </div>
                
                <div className="bg-white/95 dark:bg-[#080f0b]/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-200 dark:border-green-900/30 shadow-2xl overflow-y-auto max-h-[60dvh] sm:max-h-64 no-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {EXTENDED_SUGGESTIONS.map((cat, idx) => (
                            <div key={idx} className={`rounded-xl p-3 border ${getCategoryColor(cat.category)} bg-opacity-30 dark:bg-opacity-10`}>
                                <div className="flex items-center gap-2 mb-3 opacity-90">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest opacity-80">{cat.category}</h4>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {cat.items.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (item === "Takedown Generator" && onOpenTakedown) {
                                                    onOpenTakedown();
                                                    setShowExtended(false);
                                                } else if (item === "About Grid Safety") {
                                                    setIsAboutOpen(true);
                                                    setShowExtended(false);
                                                } else if (item === "Report UPI Scam" && onOpenUpiFraud) {
                                                    onOpenUpiFraud();
                                                    setShowExtended(false);
                                                } else if (item === "Identity Guard Protocol" && onOpenScanner) {
                                                    onOpenScanner();
                                                    setShowExtended(false);
                                                } else if (item === "SOS Support Locator" && onOpenSupport) {
                                                    onOpenSupport();
                                                    setShowExtended(false);
                                                } else if (item === "Image Hash Creator") {
                                                    fileInputRef.current?.click();
                                                    setShowExtended(false);
                                                } else if (item === "Guided Intake") {
                                                    setIsGuidedIntakeOpen(true);
                                                    setShowExtended(false);
                                                } else {
                                                    handleSend(item);
                                                }
                                                logEvent('Chat', 'Suggestion', `Extended: ${item}`);
                                            }}
                                            className="text-xs py-2 px-3 bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-white/5 rounded-lg text-left text-gray-700 dark:text-gray-200 transition-all font-medium border border-transparent hover:border-black/5 dark:hover:border-white/10 shadow-sm"
                                        >
                                            {item === "Takedown Generator" && <i className="fa-solid fa-file-contract mr-1.5 text-purple-500"></i>}
                                            {item === "About Grid Safety" && <i className="fa-solid fa-circle-info mr-1.5 text-green-500"></i>}
                                            {item === "Report UPI Scam" && <i className="fa-solid fa-money-bill-transfer mr-1.5 text-red-500"></i>}
                                            {item === "Identity Guard Protocol" && <i className="fa-solid fa-user-shield mr-1.5 text-emerald-500"></i>}
                                            {item === "Image Hash Creator" && <i className="fa-solid fa-fingerprint mr-1.5 text-emerald-500"></i>}
                                            {item === "Guided Intake" && <i className="fa-solid fa-wand-magic-sparkles mr-1.5 text-blue-500"></i>}
                                            {item === "SOS Support Locator" && <i className="fa-solid fa-map-location-dot mr-1.5 text-blue-500"></i>}
                                            {item === "Secure My Accounts" && <i className="fa-solid fa-lock mr-1.5 text-blue-500"></i>}
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Input Bar */}
        <div className="p-4 pt-2">
            <div className="max-w-3xl mx-auto flex items-end space-x-2 sm:space-x-3">
                
                {/* --- ACTION MENU BUTTON --- */}
                <div className="relative">
                    <button
                        onClick={() => {
                            triggerHaptic('light');
                            setShowActionMenu(!showActionMenu);
                        }}
                        disabled={isLoading}
                        className={`flex-shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-300 border ${isLoading 
                            ? 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-300' 
                            : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-green-900/30 text-gray-500 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-green-900/20 active:scale-95'
                        }`}
                        title="Max 10MB — Images and Videos only"
                        aria-label="Attach image or video"
                    >
                        <i className={`fa-solid fa-plus text-lg transition-transform duration-300 ${showActionMenu ? 'rotate-45' : ''}`}></i>
                    </button>

                    {/* Action Popover */}
                    {showActionMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowActionMenu(false)}
                            />
                            <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-[#0a150e] border border-gray-200 dark:border-green-900/30 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up z-50">
                                <button
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        setShowActionMenu(false);
                                        setIsGuidedIntakeOpen(true);
                                        logEvent('Chat', 'Menu', 'GuidedIntake');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-green-900/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Guided Intake</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Step-by-step incident report</div>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setShowActionMenu(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-gray-100 dark:border-green-900/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <i className="fa-solid fa-fingerprint"></i>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Image Hash Creator</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Secure local evidence hash</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setShowActionMenu(false);
                                        setShowExtended(true);
                                        logEvent('Chat', 'Menu', 'CommandCenter');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-gray-100 dark:border-green-900/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <i className="fa-solid fa-layer-group"></i>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Safety Menu</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Access all safety tools</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setShowActionMenu(false);
                                        setIsAboutOpen(true);
                                        logEvent('Chat', 'Menu', 'About');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <i className="fa-solid fa-shield-cat"></i>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">About Us</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">What is Grid Safety?</div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Text Area */}
                <div className="flex-1 relative bg-gray-100/80 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-green-500/50 focus-within:ring-2 focus-within:ring-green-500/10 transition-all shadow-inner dark:shadow-none min-h-[52px] flex items-center">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(inputValue);
                            }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full bg-transparent border-none py-3.5 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-0 focus:outline-none resize-none no-scrollbar"
                        disabled={isLoading}
                        style={{ maxHeight: '120px' }}
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={() => handleSend(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className={`flex-shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                    !inputValue.trim() || isLoading
                        ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-tr from-green-600 to-emerald-600 text-white shadow-green-500/30 hover:scale-105 active:scale-95'
                    }`}
                    aria-label="Send Message"
                >
                    <i className="fa-solid fa-paper-plane text-lg"></i>
                </button>
            </div>
            
            <div className="text-center mt-3 flex justify-center items-center gap-3 pb-1">
                <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium tracking-wide">SECURE AI • <span className="text-green-600 dark:text-green-500/80">PRIVATE</span></p>
                <span className="text-gray-300 dark:text-gray-800">|</span>
                <button 
                    onClick={() => {
                        triggerHaptic('light');
                        onInfoClick();
                    }} 
                    className="text-[10px] px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1.5"
                >
                    <i className="fa-solid fa-life-ring"></i> SOS SUPPORT
                </button>
            </div>
        </div>
        
        </div>
        
        {createPortal(
            <>
                <GuidedIntake 
                    isOpen={isGuidedIntakeOpen} 
                    onClose={() => setIsGuidedIntakeOpen(false)} 
                    onSubmit={(prompt) => {
                        setInputValue(prompt);
                        setTimeout(() => handleSend(prompt), 100);
                    }} 
                />
                <AboutPage 
                    isOpen={isAboutOpen} 
                    onClose={() => setIsAboutOpen(false)} 
                />
            </>,
            document.body
        )}
    </div>
  );
};