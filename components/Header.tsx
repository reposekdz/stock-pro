import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, User as UserIcon, X, Camera, ArrowLeft, ArrowRight, Eye, Sparkles } from 'lucide-react';
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
      className="relative w-12 h-12 flex items-center justify-center cursor-pointer group select-none"
      onClick={onClick}
    >
      {/* Animated Background - Emerald/Teal Gradient */}
      <div className="absolute inset-0 bg-black rounded-full transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-180 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-teal-600 shadow-lg shadow-emerald-200/50"></div>
      
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
  const [zenMode, setZenMode] = useState(false);
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

  // Toggle Zen Mode (Hides UI elements for pure viewing)
  const toggleZenMode = () => {
      setZenMode(!zenMode);
      document.body.classList.toggle('zen-mode');
  };

  return (
    <header className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 ease-in-out ${zenMode ? '-translate-y-32 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <div className="bg-white/90 backdrop-blur-2xl rounded-full px-3 py-3 shadow-2xl border border-white/60 flex items-center justify-between gap-3 md:gap-4 relative overflow-visible z-50">
        
        <div className="flex items-center gap-4 pl-1">
          {/* Interactive Logo */}
          <InteractiveLogo onClick={onHomeClick} />

          {/* Modern Gradient Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
              <button 
                  onClick={onBack}
                  disabled={!canGoBack}
                  className={`relative p-2.5 rounded-full transition-all duration-500 overflow-hidden group
                      ${canGoBack 
                          ? 'bg-black text-white shadow-lg hover:bg-gray-800 hover:scale-110 active:scale-95' 
                          : 'bg-gray-100 text-gray-300 cursor-default opacity-50'}`}
              >
                  <ArrowLeft size={18} strokeWidth={3} className={canGoBack ? "group-hover:-translate-x-1 transition-transform" : ""} />
              </button>
              
              <button 
                  onClick={onForward}
                  disabled={!canGoForward}
                  className={`relative p-2.5 rounded-full transition-all duration-500 overflow-hidden group
                      ${canGoForward 
                          ? 'bg-black text-white shadow-lg hover:bg-gray-800 hover:scale-110 active:scale-95' 
                          : 'bg-gray-100 text-gray-300 cursor-default opacity-50'}`}
              >
                  <ArrowRight size={18} strokeWidth={3} className={canGoForward ? "group-hover:translate-x-1 transition-transform" : ""} />
              </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 relative group max-w-2xl mx-auto" ref={searchRef}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-black transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Search for ideas, styles, and inspiration..."
            className="w-full bg-gray-100/80 hover:bg-white focus:bg-white focus:ring-4 focus:ring-emerald-100 text-gray-900 rounded-full py-3.5 pl-12 pr-24 outline-none transition-all duration-300 shadow-inner focus:shadow-xl font-medium placeholder:text-gray-400 text-base"
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
                  className="p-2 hover:bg-black rounded-full text-gray-500 hover:text-white hover:shadow-md transition-all active:scale-90 group/cam" 
                  title="Visual Search"
                  onClick={() => fileInputRef.current?.click()}
              >
                  <Camera size={20} className="group-hover/cam:scale-110 transition-transform" />
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
              <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/50 overflow-hidden py-4 animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
                  <div className="flex items-center justify-between px-6 pb-2 border-b border-gray-100/50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trending Now</p>
                    <Sparkles size={14} className="text-amber-400" />
                  </div>
                  {suggestions.length > 0 ? (
                      suggestions.map((s, i) => (
                          <button 
                              key={i}
                              className="w-full text-left px-6 py-3.5 hover:bg-emerald-50/80 flex items-center gap-4 font-bold text-gray-700 transition-all group/item"
                              onClick={() => {
                                  setSearchValue(s);
                                  onSearch(s);
                                  setShowSuggestions(false);
                              }}
                          >
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                  <Search size={14} />
                              </div>
                              <span className="group-hover/item:translate-x-1 transition-transform">{s}</span>
                          </button>
                      ))
                  ) : (
                      <div className="px-6 py-4 text-gray-400 text-sm italic">Type to discover new ideas...</div>
                  )}
              </div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1 md:gap-2 text-gray-500 pr-1">
           {/* Zen Mode Toggle */}
           <button 
              className={`p-3 rounded-full relative transition-all duration-300 hover:scale-110 active:scale-95 hidden lg:block
                ${zenMode ? 'bg-emerald-100 text-emerald-600 shadow-inner' : 'hover:bg-gray-100 text-gray-500'}`}
              onClick={toggleZenMode}
              title="Toggle Zen Mode"
            >
             <Eye size={22} />
          </button>

          <button className="p-3 hover:bg-gray-100 rounded-full relative hidden sm:block transition-transform hover:scale-110 active:scale-95 hover:text-black">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
          
          <button className="p-3 hover:bg-gray-100 rounded-full hidden sm:block transition-transform hover:scale-110 active:scale-95 hover:text-black">
            <MessageCircle size={22} />
          </button>
          
          <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-transform hover:scale-105 active:scale-95 ml-1"
              onClick={onProfileClick}
          >
            <div className="w-11 h-11 rounded-full bg-gray-200 p-[2px] shadow-lg">
               <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <UserIcon size={22} className="text-gray-700" />
               </div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Zen Mode Exit Button (Floating) */}
      {zenMode && (
         <button 
            className="fixed top-6 right-6 z-[60] bg-black/80 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-2xl hover:bg-black transition cursor-pointer pointer-events-auto font-bold animate-in fade-in slide-in-from-top-4"
            onClick={toggleZenMode}
         >
             Exit Zen Mode
         </button>
      )}
    </header>
  );
};