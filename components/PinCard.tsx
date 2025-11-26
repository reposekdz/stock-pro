
import React, { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { Share2, MoreHorizontal, ChevronDown, Check, ScanSearch, Archive, Heart, ExternalLink, RotateCcw, Copy, Trash2 } from 'lucide-react';
import { Pin, Board, User } from '../types';

interface PinCardProps {
  pin: Pin;
  onClick: (pin: Pin) => void;
  onSave: (pin: Pin, boardId?: string) => void;
  onMoreLikeThis: (pin: Pin) => void;
  onStash: (pin: Pin) => void;
  onTagClick: (tag: string) => void;
  onUserClick?: (user: User) => void; 
  boards: Board[];
}

export const PinCard: React.FC<PinCardProps> = ({ pin, onClick, onSave, onMoreLikeThis, onStash, onTagClick, onUserClick, boards }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showBoardSelect, setShowBoardSelect] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Dominant Color Placeholder (Simulated)
  const [bgColor] = useState(() => {
      const colors = ['#f3f4f6', '#e5e7eb', '#d1d5db', '#fca5a5', '#fdba74', '#fde047', '#bef264', '#6ee7b7', '#93c5fd', '#c4b5fd', '#f0abfc'];
      return colors[Math.floor(Math.random() * colors.length)];
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const defaultBoard = boards[0];
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(defaultBoard || null);

  // --- Handlers ---

  const handleQuickSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (!isSaved) {
        onSave(pin, selectedBoard?.id);
    }
  };

  const handleBoardSelectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowBoardSelect(!showBoardSelect);
  };

  const handleTouchStart = () => {
      longPressTimer.current = setTimeout(() => {
          setShowMobileMenu(true);
      }, 800); // 800ms long press
  };

  const handleTouchEnd = () => {
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
      }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(onUserClick) onUserClick(pin.author);
  }

  const handleFlip = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsFlipped(!isFlipped);
  }

  const handleExternalLink = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open('https://example.com', '_blank');
  };

  return (
    <div 
      ref={cardRef}
      className="relative mb-6 break-inside-avoid rounded-[24px] cursor-zoom-in group perspective-1000 z-0 hover:z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowBoardSelect(false); setIsFlipped(false); }}
      onClick={() => onClick(pin)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ perspective: '1200px' }}
    >
      <div 
        className="relative w-full h-full rounded-[24px] overflow-hidden transition-all duration-300 ease-out shadow-sm group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-gray-200"
        style={{
            transform: isFlipped ? `rotateY(180deg)` : 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backgroundColor: bgColor
        }}
      >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden z-10">
              <img 
                src={pin.imageUrl} 
                alt={pin.title}
                className="w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                style={{ 
                    aspectRatio: `${pin.width} / ${pin.height}`,
                    opacity: isHovered ? 0.85 : 1
                }}
                loading="lazy"
              />
              
              {/* Desktop Hover Controls */}
              <div 
                className={`absolute inset-0 flex flex-col justify-between p-3 transition-opacity duration-200 ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
              >
                  {/* Top Section: Save */}
                  <div className="flex justify-between items-start relative z-20">
                     <div className="text-white drop-shadow-md font-bold text-xs flex items-center opacity-0 group-hover:opacity-100 transition-all delay-100 translate-y-[-5px] group-hover:translate-y-0 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full cursor-pointer hover:bg-black">
                         <span className="max-w-[80px] truncate">{selectedBoard?.title || 'Profile'}</span>
                         <ChevronDown size={14} className="ml-1" />
                     </div>

                     <button 
                        className={`px-4 py-3 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-lg flex items-center gap-1.5
                        ${isSaved ? 'bg-black text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
                        onClick={handleQuickSave}
                     >
                        {isSaved ? 'Saved' : 'Save'}
                     </button>
                  </div>

                  {/* Bottom Section: Utilities */}
                  <div className="flex justify-between items-end">
                      <button 
                          onClick={handleExternalLink}
                          className="p-2 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-white hover:scale-110 transition shadow-sm"
                          title="Visit Site"
                      >
                          <ExternalLink size={16} />
                      </button>

                      <div className="flex gap-2">
                          <button 
                              className="p-2 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-white hover:scale-110 transition shadow-sm"
                              onClick={(e) => { e.stopPropagation(); /* Open Share */ }}
                          >
                              <Share2 size={16} />
                          </button>
                          <button 
                              className="p-2 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-white hover:scale-110 transition shadow-sm"
                              onClick={(e) => { e.stopPropagation(); /* Show More */ }}
                          >
                              <MoreHorizontal size={16} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* BACK SIDE (Flipped info) */}
          <div 
            className="absolute inset-0 bg-white rounded-[24px] p-6 flex flex-col backface-hidden z-20 overflow-y-auto"
            style={{ transform: 'rotateY(180deg)' }}
          >
              <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">{pin.title}</h3>
                  <button onClick={handleFlip} className="p-1 hover:bg-gray-100 rounded-full transition"><RotateCcw size={16}/></button>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-4">{pin.description}</p>
              <div className="mt-auto flex gap-2">
                 <button className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">Copy Link</button>
                 <button className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">Report</button>
              </div>
          </div>
      </div>
      
      {/* Mobile Long Press Menu */}
      {showMobileMenu && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowMobileMenu(false); }}>
              <div className="flex gap-4 mb-4">
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-lg" onClick={handleQuickSave}>
                      {isSaved ? <Check size={24} /> : <Heart size={24} className="fill-red-500 text-red-500" />}
                  </button>
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-lg">
                      <Share2 size={24} />
                  </button>
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-lg" onClick={handleFlip}>
                      <ScanSearch size={24} />
                  </button>
              </div>
              <p className="text-white text-xs font-bold uppercase tracking-widest">Pin Options</p>
          </div>
      )}

      {/* Metadata (Always visible below image) */}
      <div className="mt-2 px-1">
          <h4 className="text-sm font-bold text-gray-900 truncate leading-tight">{pin.title}</h4>
          <div className="flex items-center gap-2 mt-1 cursor-pointer hover:opacity-70 transition" onClick={handleAuthorClick}>
               <img src={pin.author.avatarUrl} className="w-4 h-4 rounded-full" />
               <p className="text-xs text-gray-500 truncate">{pin.author.username}</p>
          </div>
      </div>
    </div>
  );
};
