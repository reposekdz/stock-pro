
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, User as UserIcon, X, Camera, ArrowLeft, ArrowRight, Eye, Sparkles, Settings, Heart, UserPlus, Plus } from 'lucide-react';
import { getSearchSuggestions } from '../services/geminiService';
import { Notification } from '../types';

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
  onCreateClick: () => void;
}

const InteractiveLogo = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      className="relative w-12 h-12 flex items-center justify-center cursor-pointer group select-none"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-black rounded-full transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-180 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-teal-600 shadow-lg shadow-emerald-200/50"></div>
      <div className="absolute inset-1 border-2 border-white/30 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 delay-75"></div>
      <div className="relative z-10 text-white font-black text-2xl tracking-tighter group-hover:scale-125 transition-transform duration-300">
        S
        <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-lime-300 rounded-full border border-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse shadow-glow"></span>
      </div>
    </div>
  );
};

// Mock Notifications
const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'like', text: 'liked your pin "Neon City"', user: { id: 'u1', username: 'Sarah', avatarUrl: 'https://picsum.photos/seed/u1/50/50', followers: 0, following: 0}, timestamp: '2m', read: false, imageUrl: 'https://picsum.photos/seed/neon/50/50' },
    { id: '2', type: 'follow', text: 'started following you', user: { id: 'u2', username: 'DesignDaily', avatarUrl: 'https://picsum.photos/seed/u2/50/50', followers: 0, following: 0}, timestamp: '1h', read: false },
    { id: '3', type: 'comment', text: 'commented: "Amazing work!"', user: { id: 'u3', username: 'Mike_Art', avatarUrl: 'https://picsum.photos/seed/u3/50/50', followers: 0, following: 0}, timestamp: '3h', read: true, imageUrl: 'https://picsum.photos/seed/art/50/50' },
];

export const Header: React.FC<HeaderProps> = ({ 
    onSearch, 
    onVisualSearch, 
    onHomeClick, 
    onProfileClick, 
    currentQuery,
    canGoBack,
    canGoForward,
    onBack,
    onForward,
    onCreateClick
}) => {
  const [searchValue, setSearchValue] = useState(currentQuery || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchValue(currentQuery || '');
  }, [currentQuery]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setShowNotifications(false);
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

  const toggleZenMode = () => {
      setZenMode(!zenMode);
      document.body.classList.toggle('zen-mode');
  };

  return (
    <header className={`w-full px-4 pt-4 pb-2 z-[100] transition-all duration-700 ease-in-out ${zenMode ? '-mt-32 opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="max-w-[1920px] mx-auto bg-white/80 backdrop-blur-2xl rounded-full px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 flex items-center justify-between gap-3 md:gap-4 relative overflow-visible z-50">
        
        <div className="flex items-center gap-4 pl-1">
          <InteractiveLogo onClick={onHomeClick} />

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

        <div className="flex-1 relative group max-w-2xl mx-auto" ref={searchRef}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-black transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Search for ideas, styles, and inspiration..."
            className="w-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white focus:ring-4 focus:ring-emerald-100 text-gray-900 rounded-full py-3.5 pl-12 pr-24 outline-none transition-all duration-300 shadow-inner focus:shadow-xl font-medium placeholder:text-gray-400 text-base border border-transparent focus:border-emerald-200/50"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
          
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

        <div className="flex items-center gap-1 md:gap-2 text-gray-500 pr-1">
           <button 
              className={`p-3 rounded-full relative transition-all duration-300 hover:scale-110 active:scale-95 hidden lg:block
                ${zenMode ? 'bg-emerald-100 text-emerald-600 shadow-inner' : 'hover:bg-gray-100 text-gray-500'}`}
              onClick={toggleZenMode}
              title="Toggle Zen Mode"
            >
             <Eye size={22} />
          </button>

           <button 
              className="p-3 bg-black text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 flex items-center gap-2"
              onClick={onCreateClick}
              title="Create"
            >
             <Plus size={22} strokeWidth={3} />
             <span className="hidden xl:inline text-sm font-bold">Create</span>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
                className={`p-3 rounded-full relative transition-transform hover:scale-110 active:scale-95 hover:text-black
                ${showNotifications ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setShowNotifications(!showNotifications)}
            >
                <Bell size={22} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            
            {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">3 New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {MOCK_NOTIFICATIONS.map(n => (
                            <div key={n.id} className="px-6 py-4 hover:bg-gray-50 flex gap-3 transition-colors cursor-pointer border-b border-gray-50 last:border-0 relative">
                                <img src={n.user.avatarUrl} className="w-10 h-10 rounded-full border border-gray-100" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-bold text-gray-900">{n.user.username}</span> {n.text}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 font-medium">{n.timestamp}</p>
                                </div>
                                {n.imageUrl && <img src={n.imageUrl} className="w-10 h-10 rounded-lg object-cover" />}
                                {!n.read && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          <button className="p-3 hover:bg-gray-100 rounded-full hidden sm:block transition-transform hover:scale-110 active:scale-95 hover:text-black">
            <MessageCircle size={22} />
          </button>
          
          <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-transform hover:scale-105 active:scale-95 ml-1"
              onClick={onProfileClick}
          >
            <div className="w-11 h-11 rounded-full bg-gray-200 p-[2px] shadow-lg group">
               <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <UserIcon size={22} className="text-gray-700" />
               </div>
            </div>
          </button>
        </div>
      </div>
      
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
