
import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Lock, Eye, EyeOff, Fingerprint, ScanFace, Wand2, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
    onLogin: () => void;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isBiometricLoading, setIsBiometricLoading] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };

    const simulateBiometric = () => {
        setIsBiometricLoading(true);
        setTimeout(() => {
            onLogin();
        }, 1500);
    };

    const sendMagicLink = () => {
        setMagicLinkSent(true);
        setTimeout(() => setMagicLinkSent(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-300">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[128px] animate-pulse delay-1000"></div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/50">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <span className="text-white text-4xl font-black tracking-tighter">S</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{isSignUp ? 'Join Stoc Pro' : 'Welcome Back'}</h2>
                    <p className="text-gray-500 font-medium">The visual discovery engine for pros.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 ring-black focus:border-transparent transition shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-12 font-bold outline-none focus:ring-2 ring-black focus:border-transparent transition shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group mt-4 active:scale-95"
                    >
                        {isSignUp ? 'Create Account' : 'Log In'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-6 grid grid-cols-2 gap-3">
                     <button 
                        type="button"
                        onClick={simulateBiometric}
                        className="flex flex-col items-center justify-center gap-2 py-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition active:scale-95 group"
                     >
                         {isBiometricLoading ? (
                             <ScanFace size={24} className="text-emerald-600 animate-pulse"/>
                         ) : (
                             <Fingerprint size={24} className="text-gray-600 group-hover:text-black"/>
                         )}
                         <span className="text-xs font-bold text-gray-600">Passkey / FaceID</span>
                     </button>
                     
                     <button 
                        type="button"
                        onClick={sendMagicLink}
                        className="flex flex-col items-center justify-center gap-2 py-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition active:scale-95 group"
                     >
                         {magicLinkSent ? (
                             <CheckCircle2 size={24} className="text-green-500 animate-bounce"/>
                         ) : (
                             <Wand2 size={24} className="text-gray-600 group-hover:text-purple-600"/>
                         )}
                         <span className="text-xs font-bold text-gray-600">{magicLinkSent ? 'Link Sent!' : 'Magic Link'}</span>
                     </button>
                </div>

                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-500 font-medium">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                    <button 
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="font-black text-black ml-1 hover:underline decoration-2 underline-offset-4"
                    >
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};
