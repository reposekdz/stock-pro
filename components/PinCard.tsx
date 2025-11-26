
import React, { useState, useRef, useEffect } from 'react';
import { Share2, MoreHorizontal, ChevronDown, Check, ScanSearch, Heart, ExternalLink, RotateCcw, Play, Layers, ArrowUpRight, Edit2, Circle } from 'lucide-react';
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
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (pinId: string) => void;
  isCreator?: boolean;
}

export const PinCard: React.FC<PinCardProps> = ({ 
    pin, 
    onClick, 
    onSave, 
    onMoreLikeThis, 
    onStash, 
    onTagClick, 
    onUserClick, 
    boards,
    isSelectMode = false,
    isSelected = false,
    onSelect,
    isCreator = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Dominant Color Placeholder
  const [bgColor] = useState(() => {
      const colors = ['#f3f4f6', '#e5e7eb', '#d1d5db', '#fca5a5', '#fdba74', '#fde047', '#bef264', '#6ee7b7', '#93c5fd', '#c4b5fd', '#f0abfc'];
      return colors[Math.floor(Math.random() * colors.length)];
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const defaultBoard = boards[0];
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(defaultBoard || null);

  // Generate a realistic looking domain or use a fallback
  const displayDomain = pin.videoUrl ? 'youtube.com' : 'behance.net';

  // Video Autoplay Logic
  useEffect(() => {
      if (pin.type === 'video' && videoRef.current) {
          if (isHovered && !isSelectMode) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      // Auto-play was prevented
                  });
              }
          } else {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
          }
      }
  }, [isHovered, pin.type, isSelectMode]);

  const handleQuickSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (!isSaved) {
        onSave(pin, selectedBoard?.id);
    }
  };

  const handleTouchStart = () => {
      if (isSelectMode) return;
      longPressTimer.current = setTimeout(() => {
          setShowMobileMenu(true);
          if (navigator.vibrate) navigator.vibrate(50);
      }, 600);
  };

  const handleTouchEnd = () => {
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
      }
  };

  const handleTouchMove = () => {
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
      }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(onUserClick) onUserClick(pin.author);
  }

  const handleExternalLink = (e: React.MouseEvent) => {
      e.stopPropagation();
      // In a real app, this would be pin.destinationLink
  };

  const handleCardClick = (e: React.MouseEvent) => {
      if (isSelectMode && onSelect) {
          e.stopPropagation();
          onSelect(pin.id);
      } else {
          onClick(pin);
      }
  };

  return (
    <div 
      ref={cardRef}
      className={`relative mb-6 break-inside-avoid rounded-[16px] cursor-zoom-in group z-0 hover:z-20 transition-transform duration-200 ${isSelectMode ? 'cursor-default' : ''} ${isSelected ? 'scale-95' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div 
        className={`relative w-full rounded-[16px] overflow-hidden bg-gray-100 transition-all ${isSelected ? 'ring-4 ring-black' : ''}`}
        style={{
            backgroundColor: bgColor
        }}
      >
          {/* Main Content */}
          <div className="relative">
              {pin.type === 'video' && pin.videoUrl ? (
                  <video
                      ref={videoRef}
                      src={pin.videoUrl}
                      className="w-full object-cover pointer-events-none block"
                      loop
                      muted
                      playsInline
                      style={{ 
                          aspectRatio: `${pin.width} / ${pin.height}`,
                          filter: pin.videoSettings?.filter === 'noir' ? 'grayscale(100%) contrast(120%)' :
                                  pin.videoSettings?.filter === 'vivid' ? 'saturate(150%) contrast(110%)' :
                                  pin.videoSettings?.filter === 'vintage' ? 'sepia(50%) contrast(90%)' : 'none'
                      }}
                  />
              ) : (
                  <img 
                    src={pin.imageUrl} 
                    alt={pin.title}
                    className="w-full object-cover pointer-events-none block transition-all duration-300"
                    style={{ 
                        aspectRatio: `${pin.width} / ${pin.height}`,
                        // Darken image slightly on hover like Pinterest
                        filter: isHovered && !isSelectMode ? 'brightness(70%)' : 'brightness(100%)',
                        transform: isHovered && !isSelectMode ? 'scale(1.02)' : 'scale(1)'
                    }}
                    loading="lazy"
                  />
              )}
              
              {/* Type Indicators (Visible when not hovered) */}
              <div className={`absolute top-3 left-3 z-20 pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                  {pin.type === 'video' && (
                      <div className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                          <Play size={14} fill="currentColor" />
                      </div>
                  )}
                  {(pin.type === 'idea' || (pin.slides && pin.slides.length > 0)) && (
                      <div className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                          <Layers size={14} />
                      </div>
                  )}
              </div>

              {/* Selection Overlay */}
              {isSelectMode && (
                  <div className="absolute top-3 left-3 z-30">
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black' : 'bg-white border-gray-300'}`}>
                           {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                       </div>
                  </div>
              )}
              
              {/* Desktop Hover Overlay Controls */}
              {!isSelectMode && (
                  <div 
                    className={`absolute inset-0 p-3 transition-opacity duration-200 flex flex-col justify-between ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  >
                      {/* Top Section */}
                      <div className="flex justify-between items-start relative z-20">
                         {/* Board Selector - Top Left */}
                         <button 
                            className="flex items-center gap-1 text-white font-bold text-sm px-3 py-2.5 rounded-full hover:bg-white/20 transition truncate max-w-[140px] bg-black/20 backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                         >
                             <span className="truncate">{selectedBoard?.title || 'Profile'}</span>
                             <ChevronDown size={16} />
                         </button>
    
                         {/* Save Button - Top Right - Green Gradient */}
                         <button 
                            className={`px-5 py-3 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-md
                            ${isSaved ? 'bg-black text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg'}`}
                            onClick={handleQuickSave}
                         >
                            {isSaved ? 'Saved' : 'Save'}
                         </button>
                      </div>
    
                      {/* Bottom Section */}
                      <div className="flex justify-between items-end relative z-20">
                          {/* Link - Bottom Left */}
                          <div className="flex gap-2">
                              <button 
                                  onClick={handleExternalLink}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full text-black font-bold text-xs hover:bg-white transition shadow-sm truncate max-w-[120px]"
                              >
                                  <ArrowUpRight size={14} />
                                  <span className="truncate">{displayDomain}</span>
                              </button>
                          </div>
    
                          {/* Utilities - Bottom Right */}
                          <div className="flex gap-2">
                              {/* Scan Lens Button */}
                              <button 
                                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm"
                                  onClick={(e) => { e.stopPropagation(); onMoreLikeThis(pin); }}
                                  title="Visual Search"
                              >
                                  <ScanSearch size={16} />
                              </button>

                              {isCreator ? (
                                  <button 
                                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm"
                                      onClick={(e) => { e.stopPropagation(); /* Open Edit */ }}
                                      title="Edit Pin"
                                  >
                                      <Edit2 size={16} />
                                  </button>
                              ) : (
                                  <button 
                                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm"
                                      onClick={(e) => { e.stopPropagation(); /* Open Share */ }}
                                      title="Share"
                                  >
                                      <Share2 size={16} />
                                  </button>
                              )}
                              
                              <button 
                                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm"
                                  onClick={(e) => { e.stopPropagation(); }}
                                  title="More"
                              >
                                  <MoreHorizontal size={16} />
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
      
      {/* Mobile Long Press Menu */}
      {showMobileMenu && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md rounded-[16px] flex flex-col items-center justify-center animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowMobileMenu(false); }}>
              <div className="flex gap-4 mb-4">
                  <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl active:scale-90 transition" onClick={handleQuickSave}>
                      {isSaved ? <Check size={24} /> : <Heart size={24} className="fill-emerald-500 text-emerald-500" />}
                  </button>
                  <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl active:scale-90 transition">
                      <Share2 size={24} />
                  </button>
                  <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl active:scale-90 transition">
                      <MoreHorizontal size={24} />
                  </button>
              </div>
              <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">Quick Actions</p>
          </div>
      )}

      {/* Metadata - Only visible when not selecting */}
      {!isSelectMode && (
          <div className="mt-2 px-1">
              {pin.title && (
                <h4 className="text-sm font-bold text-gray-900 truncate leading-tight hover:underline cursor-pointer">{pin.title}</h4>
              )}
              <div className="flex items-center gap-2 mt-1 cursor-pointer group/author" onClick={handleAuthorClick}>
                   {pin.author.avatarUrl && (
                     <img src={pin.author.avatarUrl} className="w-6 h-6 rounded-full group-hover/author:opacity-80 transition object-cover" />
                   )}
                   <p className="text-xs text-gray-500 truncate group-hover/author:text-gray-900 transition">{pin.author.username}</p>
                   {/* Analytics Badge for creators */}
                   {isCreator && (
                       <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold ml-auto">1.2k views</span>
                   )}
              </div>
          </div>
      )}
    </div>
  );
};
