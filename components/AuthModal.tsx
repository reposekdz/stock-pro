
import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Lock, Eye, EyeOff, Fingerprint, ScanFace, Wand2, CheckCircle2, ShieldCheck, AlertCircle, Apple, Facebook, Github, Loader2, Sparkles, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    const [shake, setShake] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!password) {
            setPasswordStrength(0);
            return;
        }
        let strength = 0;
        if (password.length > 6) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        setPasswordStrength(strength);
    }, [password]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        onLogin();
    };

    const handleSocialLogin = (provider: string) => {
        setSocialLoading(provider);
        setTimeout(() => {
             confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
             onLogin();
             setSocialLoading(null);
        }, 1500);
    };

    const simulateBiometric = () => {
        setIsBiometricLoading(true);
        setTimeout(() => {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            onLogin();
        }, 1500);
    };

    const sendMagicLink = () => {
        setMagicLinkSent(true);
        setTimeout(() => setMagicLinkSent(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-300">
            {/* Background */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"></div>
            
            <div 
                className={`relative bg-white w-full max-w-4xl h-[600px] rounded-[32px] shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-300 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Left Panel - Branding & Visuals */}
                <div className="hidden md:flex w-1/2 bg-black relative flex-col justify-between p-10 overflow-hidden text-white">
                    <div className="absolute inset-0 opacity-40">
                         <img src="https://picsum.photos/seed/authwall/800/1200" className="w-full h-full object-cover grayscale mix-blend-overlay" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-black/50"></div>
                    
                    <div className="relative z-10">
                         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/30 overflow-hidden">
                             {/* Nexos Logo */}
                             <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="nexosGradientAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#0d9488" />
                                    </linearGradient>
                                </defs>
                                <path 
                                    d="M30 75V35C30 29.4772 34.4772 25 40 25H42C44.7614 25 47 27.2386 47 30V70C47 72.7614 49.2386 75 52 75H54C59.5228 75 64 70.5228 64 65V25" 
                                    stroke="url(#nexosGradientAuth)" 
                                    strokeWidth="12" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                                <circle cx="30" cy="55" r="3" fill="white" fillOpacity="0.5"/>
                                <circle cx="64" cy="45" r="3" fill="white" fillOpacity="0.5"/>
                             </svg>
                         </div>
                         <h1 className="text-4xl font-black tracking-tight mb-2">Welcome to Nexos.</h1>
                         <p className="text-gray-300 font-medium">The connected visual discovery engine.</p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            <Globe size={14} className="text-emerald-400"/>
                            <span>Used by 2M+ Creators</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            "Nexos has completely revolutionized how I find and organize inspiration. The connections it builds are mind-blowing!"
                        </p>
                        <div className="flex items-center gap-3">
                            <img src="https://picsum.photos/seed/u1/50/50" className="w-8 h-8 rounded-full border border-white/30"/>
                            <span className="text-xs font-bold text-white">Sarah Jenkins, Designer</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Auth Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                     <div className="text-center mb-8 md:text-left">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{isSignUp ? 'Create an account' : 'Log in to your account'}</h2>
                        <p className="text-gray-500 text-sm">Enter your details below to continue.</p>
                     </div>

                     <div className="grid grid-cols-3 gap-3 mb-8">
                         <button 
                             onClick={() => handleSocialLogin('google')}
                             className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition relative overflow-hidden group"
                         >
                             {socialLoading === 'google' ? <Loader2 size={20} className="animate-spin text-gray-400"/> : <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5 group-hover:scale-110 transition-transform"/>}
                         </button>
                         <button 
                             onClick={() => handleSocialLogin('apple')}
                             className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-black hover:text-white transition relative overflow-hidden group"
                         >
                             {socialLoading === 'apple' ? <Loader2 size={20} className="animate-spin text-gray-400"/> : <Apple size={22} className="group-hover:scale-110 transition-transform"/>}
                         </button>
                         <button 
                             onClick={() => handleSocialLogin('facebook')}
                             className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition relative overflow-hidden group"
                         >
                             {socialLoading === 'facebook' ? <Loader2 size={20} className="animate-spin text-gray-400"/> : <Facebook size={22} className="group-hover:scale-110 transition-transform"/>}
                         </button>
                     </div>

                     <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or</span></div>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 font-medium outline-none focus:ring-2 ring-emerald-500 focus:bg-white transition"
                                    placeholder="yourname@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-12 font-medium outline-none focus:ring-2 ring-emerald-500 focus:bg-white transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-emerald-500 transition">
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            {isSignUp && password && (
                                <div className="h-1 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${passwordStrength > 75 ? "bg-emerald-500" : passwordStrength > 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                        style={{ width: `${passwordStrength}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-200 transition active:scale-95 flex items-center justify-center gap-2 group mt-2"
                        >
                            {isSignUp ? 'Create Account' : 'Log In'}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                     </form>
                     
                     <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                         <span className="text-gray-500">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                         <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-emerald-600 hover:underline">
                             {isSignUp ? 'Log in' : 'Sign up'}
                         </button>
                     </div>
                </div>
            </div>
        </div>
    );
};