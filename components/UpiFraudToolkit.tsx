import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const UpiFraudToolkit: React.FC<Props> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [formData, setFormData] = useState({
        transactionId: '',
        amount: '',
        upiId: '',
        date: '',
        bankName: ''
    });

    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateDisputeText = () => {
        return `Subject: URGENT: Reporting Unauthorized UPI Transaction

Dear Nodal Officer / Cyber Cell,

I am writing to report a fraudulent UPI transaction that occurred on my account. I did not authorize this transaction.

Details of the fraudulent transaction:
- Transaction ID / UTR: ${formData.transactionId || '[Insert ID]'}
- Amount: ₹${formData.amount || '[Insert Amount]'}
- Fraudster's UPI ID: ${formData.upiId || '[Insert UPI ID]'}
- Date of Transaction: ${formData.date || '[Insert Date]'}
- My Bank Name: ${formData.bankName || '[Insert Bank]'}

I request you to kindly block the beneficiary account immediately and initiate a chargeback/reversal for this unauthorized transaction as per RBI guidelines on limited liability of customers.

Please let me know the next steps and the complaint reference number.

Sincerely,
[Your Name]
[Your Phone Number]
[Your Account Number]`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateDisputeText());
        triggerHaptic('success');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-md max-h-[85dvh] flex flex-col bg-[#050a07] border border-red-500/30 sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-slide-up sm:animate-fade-in-up">
                
                {/* Header */}
                <div className="p-4 bg-red-900/10 border-b border-red-500/20 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-money-bill-transfer text-red-500"></i>
                        <span className="font-mono text-red-500 font-bold tracking-wider text-sm uppercase">UPI Fraud Toolkit</span>
                    </div>
                    <button onClick={() => { triggerHaptic('light'); onClose(); }} className="text-red-700 hover:text-red-500">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-5 pb-10 space-y-6 flex-1 min-h-0 no-scrollbar">
                    {/* Progress Steps */}
                    <div className="flex justify-between items-center mb-4">
                        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-red-500' : 'bg-gray-800'}`}></div>
                        <div className="w-2"></div>
                        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-red-500' : 'bg-gray-800'}`}></div>
                        <div className="w-2"></div>
                        <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-red-500' : 'bg-gray-800'}`}></div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-white">Step 1: Immediate Action</h3>
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm text-red-200">
                                <p className="font-bold mb-2"><i className="fa-solid fa-phone mr-2"></i>Call 1930 Immediately</p>
                                <p className="text-xs opacity-90">The National Cyber Crime Helpline can freeze the fraudster's account if reported within 24 hours.</p>
                                <a href="tel:1930" className="mt-3 block w-full text-center bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold transition-colors">
                                    Call 1930 Now
                                </a>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-colors mt-4">
                                I have called 1930. Next Step <i className="fa-solid fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-white">Step 2: Transaction Details</h3>
                            <p className="text-xs text-gray-400">Enter the details of the fraudulent transaction to generate a formal dispute.</p>
                            
                            <div className="space-y-3">
                                <input type="text" name="transactionId" placeholder="Transaction ID / UTR" value={formData.transactionId} onChange={handleChange} className="w-full bg-black/50 border border-red-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-red-500 text-sm" />
                                <input type="number" name="amount" placeholder="Amount Lost (₹)" value={formData.amount} onChange={handleChange} className="w-full bg-black/50 border border-red-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-red-500 text-sm" />
                                <input type="text" name="upiId" placeholder="Fraudster's UPI ID (if known)" value={formData.upiId} onChange={handleChange} className="w-full bg-black/50 border border-red-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-red-500 text-sm" />
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-black/50 border border-red-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-red-500 text-sm" />
                                <input type="text" name="bankName" placeholder="Your Bank Name" value={formData.bankName} onChange={handleChange} className="w-full bg-black/50 border border-red-800/50 text-white p-3 rounded-xl focus:outline-none focus:border-red-500 text-sm" />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors">Back</button>
                                <button onClick={() => setStep(3)} className="flex-[2] bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-colors">Generate Dispute</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in flex flex-col h-full">
                            <h3 className="text-lg font-bold text-white">Step 3: Send Dispute</h3>
                            <p className="text-xs text-gray-400">Copy this text and email it to your bank's nodal officer and submit it on the NPCI portal.</p>
                            
                            <div className="bg-black/50 border border-red-800/30 p-4 rounded-xl text-xs text-gray-300 font-mono whitespace-pre-wrap flex-1 overflow-y-auto">
                                {generateDisputeText()}
                            </div>

                            <div className="space-y-2 mt-4 shrink-0">
                                <button onClick={copyToClipboard} className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i> {copied ? 'Copied!' : 'Copy to Clipboard'}
                                </button>
                                <a href="https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism" target="_blank" rel="noreferrer" className="w-full block text-center bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">
                                    Open NPCI Dispute Portal <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs"></i>
                                </a>
                                <button onClick={() => setStep(2)} className="w-full text-gray-500 text-xs py-2 hover:text-white">Edit Details</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
