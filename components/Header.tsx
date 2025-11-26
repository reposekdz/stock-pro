
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, User as UserIcon, X, Camera, ArrowLeft, ArrowRight, Eye, Sparkles, Settings, Heart, UserPlus, Plus, TrendingUp, History, LogIn, ChevronLeft, PlayCircle, Home } from 'lucide-react';
import { Notification, ViewState } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  onVisualSearch: (file: File) => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onMessagesClick: () => void;
  onMonetizationClick: () => void;
  currentQuery?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onCreateClick: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  currentView: ViewState;
  onWatchClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onSearch, 
    onVisualSearch, 
    onHomeClick, 
    onProfileClick, 
    onMessagesClick,
    onMonetizationClick,
    currentQuery,
    canGoBack,
    canGoForward,
    onBack,
    onForward,
    onCreateClick,
    isLoggedIn,
    onLoginClick,
    currentView,
    onWatchClick
}) => {
  const [searchValue, setSearchValue] = useState(currentQuery || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('nexos_search_history');
    if (stored) setSearchHistory(JSON.parse(stored));
    else setSearchHistory(['Modern Art', 'Interior Design', 'Cyberpunk City', 'Minimalist UI']);
  }, []);

  useEffect(() => {
    setSearchValue(currentQuery || '');
  }, [currentQuery]);

  const handleSearchSubmit = (query: string) => {
      onSearch(query);
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('nexos_search_history', JSON.stringify(newHistory));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(searchValue);
    }
  };

  const handleGuestInteraction = () => {
      if(!isLoggedIn) onLoginClick();
  };

  return (
    <header className="w-full px-4 pt-4 pb-2 z-[100] relative">
      <div className={`max-w-[1920px] mx-auto bg-white/80 backdrop-blur-2xl rounded-full px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 flex items-center justify-between gap-4 relative transition-all duration-300 ${zenMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
        
        {/* Left Side: Logo & Nav */}
        <div className={`flex items-center gap-2 pl-1 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
           <button onClick={onHomeClick} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 transition shadow-lg shadow-emerald-200/50 bg-white border border-emerald-100 overflow-hidden group">
               <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="nexosGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M30 75V35C30 29.4772 34.4772 25 40 25H42C44.7614 25 47 27.2386 47 30V70C47 72.7614 49.2386 75 52 75H54C59.5228 75 64 70.5228 64 65V25" 
                    stroke="url(#nexosGradient)" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <circle cx="30" cy="55" r="3" fill="white" fillOpacity="0.5"/>
                  <circle cx="64" cy="45" r="3" fill="white" fillOpacity="0.5"/>
               </svg>
           </button>
           
           {/* Navigation Links (Home / Watch) */}
           <div className="hidden lg:flex items-center gap-1 ml-2">
               <button 
                  onClick={onHomeClick}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${currentView === 'HOME' ? 'bg-black text-white' : 'text-gray-900 hover:bg-gray-100'}`}
               >
                   <Home size={18} /> Home
               </button>
               <button 
                  onClick={onWatchClick}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${currentView === 'WATCH' ? 'bg-black text-white' : 'text-gray-900 hover:bg-gray-100'}`}
               >
                   <PlayCircle size={18} /> Watch
               </button>
           </div>

           <div className="hidden md:flex gap-2 ml-2 border-l border-gray-200 pl-4">
               <button onClick={onBack} disabled={!canGoBack} className="p-2.5 rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"><ArrowLeft size={18}/></button>
               <button onClick={onForward} disabled={!canGoForward} className="p-2.5 rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"><ArrowRight size={18}/></button>
           </div>
        </div>

        {/* Search Bar - Responsive */}
        <div className={`flex-1 relative group max-w-2xl mx-auto ${isMobileSearchOpen ? 'flex' : 'hidden md:block'}`} ref={searchRef}>
             {isMobileSearchOpen && (
                 <button onClick={() => setIsMobileSearchOpen(false)} className="md:hidden p-3 mr-2 bg-gray-100 rounded-full">
                     <ChevronLeft size={20}/>
                 </button>
             )}
            
            <div className={`flex items-center w-full bg-gray-100/50 hover:bg-gray-100 rounded-full px-4 transition-all duration-300 border border-transparent focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 focus-within:shadow-xl ${showSuggestions ? 'rounded-b-none rounded-t-[24px] bg-white ring-4 ring-emerald-100' : ''}`}>
                 <Search className="text-gray-400 flex-shrink-0" size={20} />
                 <input 
                    type="text"
                    className="w-full bg-transparent py-3.5 px-3 outline-none font-medium placeholder:text-gray-400"
                    placeholder="Search Nexos..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
                    autoFocus={isMobileSearchOpen}
                 />
                 {searchValue && <button onClick={() => setSearchValue('')} className="p-1 hover:bg-gray-200 rounded-full"><X size={16}/></button>}
                 <button onClick={() => {}} className="p-2 hover:bg-gray-200 rounded-full text-gray-400"><Camera size={20}/></button>
            </div>

            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-b-[24px] shadow-xl border-x border-b border-gray-100 overflow-hidden py-2 animate-in slide-in-from-top-2 z-50">
                    {searchHistory.length > 0 && (
                        <div>
                            <p className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Searches</p>
                            {searchHistory.map((term, i) => (
                                <div 
                                    key={i} 
                                    className="px-6 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer group/item"
                                    onMouseDown={() => handleSearchSubmit(term)}
                                >
                                    <div className="flex items-center gap-3">
                                        <History size={16} className="text-gray-400 group-hover/item:text-emerald-600"/>
                                        <span className="font-bold text-gray-700 group-hover/item:text-black">{term}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); }} 
                                        className="text-gray-300 hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Right Side Actions */}
        <div className={`flex items-center gap-2 md:gap-3 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
            <button onClick={() => setIsMobileSearchOpen(true)} className="md:hidden p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700">
                <Search size={22} />
            </button>

            <button 
                onClick={isLoggedIn ? () => {} : handleGuestInteraction} 
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700 relative group"
                title="Notifications"
            >
                <Bell size={22} className="group-hover:text-emerald-600 transition-colors"/>
                {isLoggedIn && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
            </button>
            <button 
                onClick={isLoggedIn ? onMessagesClick : handleGuestInteraction} 
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700 relative group"
                title="Messages"
            >
                <MessageCircle size={22} className="group-hover:text-emerald-600 transition-colors"/>
                {isLoggedIn && <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>}
            </button>

            {isLoggedIn ? (
                <>
                    <button onClick={onCreateClick} className="hidden md:flex p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition shadow-emerald-200 items-center gap-2 px-6">
                        <Plus size={20}/> <span className="font-bold">Create</span>
                    </button>
                    <button onClick={onCreateClick} className="md:hidden p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:scale-105 transition shadow-lg">
                        <Plus size={24}/>
                    </button>
                    <button onClick={onProfileClick} className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden hover:opacity-80 transition border border-gray-100 shadow-sm hover:ring-2 ring-emerald-500">
                        <img src="https://picsum.photos/seed/userPro/100/100" className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => {}} className="hidden md:flex p-3 hover:bg-gray-100 rounded-full text-gray-500"><Settings size={20}/></button>
                </>
            ) : (
                <button 
                    onClick={onLoginClick} 
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-black text-lg hover:shadow-xl hover:scale-105 transition-all shadow-emerald-200 flex items-center gap-2"
                >
                    Start <Sparkles size={18} fill="currentColor"/>
                </button>
            )}
        </div>
      </div>
    </header>
  );
};
