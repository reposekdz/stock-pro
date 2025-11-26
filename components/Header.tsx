
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, User as UserIcon, X, Camera, ArrowLeft, ArrowRight, Eye, Sparkles, Settings, Heart, UserPlus, Plus, TrendingUp, History, LogIn, ChevronLeft } from 'lucide-react';
import { Notification } from '../types';

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
    onLoginClick
}) => {
  const [searchValue, setSearchValue] = useState(currentQuery || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false); // Innovation: Focus Mode
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history from local storage (mock)
    const stored = localStorage.getItem('stoc_search_history');
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
      // Update history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('stoc_search_history', JSON.stringify(newHistory));
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
        <div className={`flex items-center gap-4 pl-1 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
           <button onClick={onHomeClick} className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-black text-2xl hover:scale-105 transition shadow-lg shadow-emerald-200">S</button>
           <div className="hidden md:flex gap-2">
               <button onClick={onBack} disabled={!canGoBack} className="p-2.5 rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"><ArrowLeft size={18}/></button>
               <button onClick={onForward} disabled={!canGoForward} className="p-2.5 rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"><ArrowRight size={18}/></button>
           </div>
        </div>

        {/* Search Bar - Responsive */}
        <div className={`flex-1 relative group max-w-3xl mx-auto ${isMobileSearchOpen ? 'flex' : 'hidden md:block'}`} ref={searchRef}>
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
                    placeholder="Search for ideas..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
                    autoFocus={isMobileSearchOpen}
                 />
                 {searchValue && <button onClick={() => setSearchValue('')} className="p-1 hover:bg-gray-200 rounded-full"><X size={16}/></button>}
            </div>

            {/* Dropdown */}
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
                                        onClick={(e) => { e.stopPropagation(); /* Remove item logic */ }} 
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
            {/* Mobile Search Trigger */}
            <button onClick={() => setIsMobileSearchOpen(true)} className="md:hidden p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700">
                <Search size={22} />
            </button>

            {/* Innovation: Zen Mode Toggle */}
            <button 
                onClick={() => setZenMode(!zenMode)} 
                className={`hidden md:flex p-3 rounded-full transition ${zenMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title="Zen Mode (Focus)"
            >
                <Eye size={22} />
            </button>

            {/* Always show Message & Notification icons (interactive) */}
            <button 
                onClick={isLoggedIn ? () => {/* notifications */} : handleGuestInteraction} 
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
