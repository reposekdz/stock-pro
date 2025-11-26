
import React, { useState, useRef, useEffect } from 'react';
import { Share2, MoreHorizontal, ChevronDown, Check, ScanLine, Heart, Play, Layers, Edit2, Download, EyeOff, Flag, Link as LinkIcon, Zap, Copy, Image as ImageIcon } from 'lucide-react';
import { Pin, Board, User } from '../types';
import confetti from 'canvas-confetti';

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
  onVisualSearch?: (pin: Pin) => void; // New Prop
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
    isCreator = false,
    onVisualSearch
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 }); // 3D Tilt State
  
  // Interaction States
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(pin.likes);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  
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
          }
      }
  }, [isHovered, pin.type, isSelectMode]);

  // Global click listener to close context menu
  useEffect(() => {
      const handleClick = () => setShowContextMenu(false);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleQuickSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (!isSaved) {
        onSave(pin, selectedBoard?.id);
        if (navigator.vibrate) navigator.vibrate(50);
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
        });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      if (newLikedState) {
          if (navigator.vibrate) navigator.vibrate(20);
      }
  };

  const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = pin.imageUrl;
      link.download = `nexos-${pin.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowMobileMenu(false);
      setShowMoreMenu(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.share) {
          navigator.share({
              title: pin.title,
              text: pin.description,
              url: window.location.href // Mock URL
          });
      } else {
          alert('Link copied to clipboard!');
      }
  };

  const handleVisualSearchClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onVisualSearch) onVisualSearch(pin);
  };

  const handleTouchStart = () => {
      if (isSelectMode) return;
      longPressTimer.current = setTimeout(() => {
          setShowMobileMenu(true);
          if (navigator.vibrate) navigator.vibrate(100);
      }, 500);
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

  const handleCardClick = (e: React.MouseEvent) => {
      if (isSelectMode && onSelect) {
          e.stopPropagation();
          onSelect(pin.id);
      } else {
          onClick(pin);
      }
  };

  const toggleMoreMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMoreMenu(!showMoreMenu);
  };

  // Custom Context Menu (Right Click)
  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
  };

  // 3D Tilt Effect & Haptic Feedback
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!cardRef.current || isSelectMode || window.innerWidth < 768) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation based on cursor position (max 3 degrees)
      const rotateX = ((y - centerY) / centerY) * -3; 
      const rotateY = ((x - centerX) / centerX) * 3;

      setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
      setIsHovered(true);
      // Innovation: Tactile feedback on hover
      if (navigator.vibrate) navigator.vibrate(5);
  };
  
  const handleMouseLeave = () => {
      setIsHovered(false);
      setTilt({ x: 0, y: 0 });
      setShowMoreMenu(false);
  };

  return (
    <div 
      ref={cardRef}
      className={`relative mb-2 md:mb-6 break-inside-avoid rounded-[16px] cursor-zoom-in group z-0 transition-all duration-300 ease-out ${isSelectMode ? 'cursor-default' : ''} ${isSelected ? 'scale-95' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{
          transform: isHovered && !isSelectMode ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)` : 'scale(1)',
          zIndex: isHovered ? 50 : 'auto'
      }}
    >
      <div 
        className={`relative w-full rounded-[16px] overflow-hidden bg-gray-100 transition-all shadow-sm ${isHovered && !isSelectMode ? 'shadow-xl' : ''} ${isSelected ? 'ring-4 ring-black' : ''}`}
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
                    className="w-full object-cover pointer-events-none block transition-all duration-500"
                    style={{ 
                        aspectRatio: `${pin.width} / ${pin.height}`,
                        // Darken image slightly on hover like Pinterest
                        filter: isHovered && !isSelectMode ? 'brightness(70%)' : 'brightness(100%)',
                    }}
                    loading="lazy"
                  />
              )}
              
              {/* Type Indicators (Visible when not hovered) */}
              <div className={`absolute top-3 left-3 z-20 pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                  {pin.type === 'video' && (
                      <div className="bg-black/40 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 text-white text-[10px] font-bold">
                          <Play size={10} fill="currentColor" />
                          {pin.duration || '0:15'}
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
                      <div className="flex justify-end items-end relative z-20">
                          {/* Utilities - Bottom Right */}
                          <div className="flex gap-2">
                              {/* Visual Search Button (Lens Icon) */}
                              <button 
                                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm"
                                  onClick={handleVisualSearchClick}
                                  title="Visual Search"
                              >
                                  <ScanLine size={16} />
                              </button>

                              {/* Download Button */}
                              <button 
                                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm"
                                  onClick={handleDownload}
                                  title="Download"
                              >
                                  <Download size={16} />
                              </button>

                              {/* Share Button */}
                              <button 
                                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm"
                                  onClick={handleShare}
                                  title="Share"
                              >
                                  <Share2 size={16} />
                              </button>
                              
                              {/* More Button with Dropdown */}
                              <div className="relative">
                                  <button 
                                      className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-black hover:bg-white transition shadow-sm ${showMoreMenu ? 'bg-white ring-2 ring-emerald-500' : ''}`}
                                      onClick={toggleMoreMenu}
                                      title="More"
                                  >
                                      <MoreHorizontal size={16} />
                                  </button>
                                  
                                  {/* More Dropdown Menu */}
                                  {showMoreMenu && (
                                      <div 
                                        className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50 py-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                          <button onClick={() => alert('Pin hidden')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                              <EyeOff size={16}/> Hide Pin
                                          </button>
                                          <button onClick={() => alert('Reported')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                              <Flag size={16}/> Report Pin
                                          </button>
                                          <button onClick={() => alert('Embed code copied')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                              <LinkIcon size={16}/> Get Embed Code
                                          </button>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
      
      {/* Context Menu (Right Click) */}
      {showContextMenu && (
          <div 
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 py-1 w-56 animate-in zoom-in-95"
            style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
            onClick={(e) => e.stopPropagation()}
          >
              <button onClick={handleDownload} className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Download size={16} /> Download image
              </button>
              <button className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Copy size={16} /> Copy image link
              </button>
              <button onClick={handleVisualSearchClick} className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <ScanLine size={16} /> Visual Search
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <EyeOff size={16} /> Hide this pin
              </button>
          </div>
      )}

      {/* Mobile Long Press Menu - Interactive Gradients */}
      {showMobileMenu && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md rounded-[16px] flex flex-col items-center justify-center animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowMobileMenu(false); }}>
              <div className="flex gap-6 mb-6">
                  {/* Like Button */}
                  <div className="flex flex-col items-center gap-2">
                      <button 
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all duration-300 group
                        ${isSaved ? 'bg-white text-black' : 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-pink-500/30'}`} 
                        onClick={handleQuickSave}
                      >
                          {isSaved ? <Check size={24} /> : <Heart size={24} fill="currentColor" />}
                      </button>
                      <span className="text-white text-[10px] font-bold tracking-wide">Like</span>
                  </div>

                  {/* Download Button */}
                  <div className="flex flex-col items-center gap-2">
                      <button 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all duration-300 bg-gradient-to-tr from-sky-500 to-blue-600 shadow-blue-500/30" 
                        onClick={handleDownload}
                      >
                          <Download size={24} />
                      </button>
                      <span className="text-white text-[10px] font-bold tracking-wide">Save</span>
                  </div>

                  {/* Share Button */}
                  <div className="flex flex-col items-center gap-2">
                      <button 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all duration-300 bg-gradient-to-tr from-violet-500 to-purple-600 shadow-purple-500/30"
                          onClick={handleShare}
                      >
                          <Share2 size={24} />
                      </button>
                      <span className="text-white text-[10px] font-bold tracking-wide">Share</span>
                  </div>
              </div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Quick Actions</p>
          </div>
      )}

      {/* Metadata - Only visible when not selecting */}
      {!isSelectMode && (
          <div className="mt-2 px-1">
              <div className="flex justify-between items-start gap-2">
                  {pin.title && (
                    <h4 className="text-sm font-bold text-gray-900 truncate leading-tight hover:underline cursor-pointer flex-1" onClick={handleCardClick}>{pin.title}</h4>
                  )}
                  {/* Like Count Interaction */}
                  <button 
                      className={`flex items-center gap-1 text-xs font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                      onClick={handleLike}
                  >
                      <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
                      {likeCount > 0 && <span>{likeCount}</span>}
                  </button>
              </div>
              
              <div className="flex items-center gap-2 mt-1 cursor-pointer group/author" onClick={handleAuthorClick}>
                   {pin.author.avatarUrl && (
                     <img src={pin.author.avatarUrl} className="w-6 h-6 rounded-full group-hover/author:opacity-80 transition object-cover" />
                   )}
                   <p className="text-xs text-gray-500 truncate group-hover/author:text-gray-900 transition">{pin.author.username}</p>
                   {/* Analytics Badge for creators */}
                   {isCreator && (
                       <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold ml-auto flex items-center gap-1">
                           <Zap size={10} className="fill-gray-600"/> 1.2k
                       </span>
                   )}
              </div>
          </div>
      )}
    </div>
  );
};
