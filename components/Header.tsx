
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, User as UserIcon, X, Camera, ArrowLeft, ArrowRight, Eye, Sparkles, Settings, Heart, UserPlus, Plus, TrendingUp, History } from 'lucide-react';
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
    onCreateClick
}) => {
  const [searchValue, setSearchValue] = useState(currentQuery || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="w-full px-4 pt-4 pb-2 z-[100]">
      <div className="max-w-[1920px] mx-auto bg-white/80 backdrop-blur-2xl rounded-full px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 flex items-center justify-between gap-4 relative">
        
        <div className="flex items-center gap-4 pl-1">
           <button onClick={onHomeClick} className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-black text-2xl hover:scale-105 transition shadow-lg">S</button>
           <div className="hidden md:flex gap-2">
               <button onClick={onBack} disabled={!canGoBack} className="p-2.5 rounded-full bg-gray-100 disabled:opacity-50"><ArrowLeft size={18}/></button>
               <button onClick={onForward} disabled={!canGoForward} className="p-2.5 rounded-full bg-gray-100 disabled:opacity-50"><ArrowRight size={18}/></button>
           </div>
        </div>

        <div className="flex-1 relative group max-w-3xl mx-auto" ref={searchRef}>
            <div className={`flex items-center w-full bg-gray-100/50 hover:bg-gray-100 rounded-full px-4 transition-all duration-300 border border-transparent focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 focus-within:shadow-xl ${showSuggestions ? 'rounded-b-none rounded-t-[24px] bg-white ring-4 ring-emerald-100' : ''}`}>
                 <Search className="text-gray-400" size={20} />
                 <input 
                    type="text"
                    className="w-full bg-transparent py-3.5 px-3 outline-none font-medium placeholder:text-gray-400"
                    placeholder="Search for ideas..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
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
                                        <History size={16} className="text-gray-400 group-hover/item:text-black"/>
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

        <div className="flex items-center gap-1 md:gap-2">
            <button onClick={onCreateClick} className="p-3 bg-black text-white rounded-full hover:scale-105 transition shadow-lg"><Plus size={24}/></button>
            <button onClick={onProfileClick} className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden hover:opacity-80 transition"><img src="https://picsum.photos/seed/userPro/100/100" className="w-full h-full object-cover" /></button>
        </div>
      </div>
    </header>
  );
};
