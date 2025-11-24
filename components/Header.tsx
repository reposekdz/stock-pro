import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, User as UserIcon, ChevronDown, X, Camera, ArrowLeft, ArrowRight } from 'lucide-react';
import { getSearchSuggestions } from '../services/geminiService';

interface HeaderProps {
  onSearch: (query: string) => void;
  onVisualSearch: (file: File) => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  currentQuery?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

const InteractiveLogo = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      className="relative w-12 h-12 flex items-center justify-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Animated Background - Emerald/Teal Gradient */}
      <div className="absolute inset-0 bg-emerald-500 rounded-full transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-180 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 shadow-lg shadow-emerald-200"></div>
      
      {/* Inner Ring */}
      <div className="absolute inset-1 border-2 border-white/30 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 delay-75"></div>
      
      {/* Letter */}
      <div className="relative z-10 text-white font-black text-2xl tracking-tighter group-hover:scale-125 transition-transform duration-300">
        S
        <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-lime-300 rounded-full border border-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse shadow-glow"></span>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ 
    onSearch, 
    onVisualSearch, 
    onHomeClick, 
    onProfileClick, 
    currentQuery,
    canGoBack,
    canGoForward,
    onBack,
    onForward
}) => {
  const [searchValue, setSearchValue] = useState(currentQuery || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchValue(currentQuery || '');
  }, [currentQuery]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      if (searchValue.length > 2 && showSuggestions) {
          getSearchSuggestions(searchValue).then(setSuggestions);
      }
  }, [searchValue, showSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchValue);
      setShowSuggestions(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onVisualSearch(e.target.files[0]);
          if(fileInputRef.current) fileInputRef.current.value = ''; // Reset
      }
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-50 bg-white/80 backdrop-blur-xl rounded-full px-3 py-2.5 shadow-2xl border border-white/20 flex items-center justify-between gap-3 md:gap-4 transition-all duration-500 animate-in slide-in-from-top-4">
      
      <div className="flex items-center gap-3">
        {/* Interactive Logo */}
        <InteractiveLogo onClick={onHomeClick} />

        {/* Modern Gradient Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
            <button 
                onClick={onBack}
                disabled={!canGoBack}
                className={`p-2.5 rounded-full transition-all duration-300 ${canGoBack 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg hover:shadow-emerald-200 hover:scale-110 active:scale-95' 
                    : 'text-gray-300 cursor-not-allowed'}`}
            >
                <ArrowLeft size={18} strokeWidth={3} />
            </button>
            <button 
                onClick={onForward}
                disabled={!canGoForward}
                className={`p-2.5 rounded-full transition-all duration-300 ${canGoForward 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg hover:shadow-emerald-200 hover:scale-110 active:scale-95' 
                    : 'text-gray-300 cursor-not-allowed'}`}
            >
                <ArrowRight size={18} strokeWidth={3} />
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 relative group max-w-2xl" ref={searchRef}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-emerald-600 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text"
          placeholder="Search for ideas, styles, and inspiration..."
          className="w-full bg-gray-100/80 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-400 text-gray-900 rounded-full py-3 pl-12 pr-24 outline-none transition-all duration-300 shadow-inner focus:shadow-2xl font-medium placeholder:text-gray-400"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />
        
        {/* Visual Search & Clear Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchValue && (
                <button 
                    onClick={() => { setSearchValue(''); setShowSuggestions(false); onHomeClick(); }}
                    className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
                >
                    <X size={16} />
                </button>
            )}
            <button 
                className="p-2 hover:bg-emerald-50 rounded-full text-gray-500 hover:text-emerald-600 hover:shadow-sm transition-all active:scale-90" 
                title="Visual Search"
                onClick={() => fileInputRef.current?.click()}
            >
                <Camera size={20} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden py-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <p className="px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Recent & Trending</p>
                {suggestions.length > 0 ? (
                    suggestions.map((s, i) => (
                        <button 
                            key={i}
                            className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent flex items-center gap-4 font-medium text-gray-800 transition-all"
                            onClick={() => {
                                setSearchValue(s);
                                onSearch(s);
                                setShowSuggestions(false);
                            }}
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Search size={14} />
                            </div>
                            {s}
                        </button>
                    ))
                ) : (
                    <div className="px-5 py-3 text-gray-400 text-sm italic">Type to discover new ideas...</div>
                )}
            </div>
        )}
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1 md:gap-2 text-gray-500">
        <button className="p-3 hover:bg-gray-100 rounded-full relative hidden sm:block transition-transform hover:scale-105 active:scale-95">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-full hidden sm:block transition-transform hover:scale-105 active:scale-95">
          <MessageCircle size={24} />
        </button>
        <button 
            className="p-1 hover:bg-gray-100 rounded-full transition-transform hover:scale-105 active:scale-95"
            onClick={onProfileClick}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 p-[2px] shadow-sm">
             <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <UserIcon size={20} />
             </div>
          </div>
        </button>
      </div>
    </header>
  );
};