
import React, { useState, useRef, MouseEvent } from 'react';
import { Share2, MoreHorizontal, ChevronDown, Check, ScanSearch, Archive, Heart, Hash, Eye, TrendingUp, Wand2, Lock, Crown, Megaphone, RotateCcw } from 'lucide-react';
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
  const [showHeart, setShowHeart] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const peekTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  const defaultBoard = boards[0];
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(defaultBoard || null);

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

  const handleBoardChoice = (e: React.MouseEvent, board: Board) => {
      e.stopPropagation();
      setSelectedBoard(board);
      setShowBoardSelect(false);
      setIsSaved(false); 
      onSave(pin, board.id);
      setIsSaved(true);
  }

  const handleMoreLikeThisClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onMoreLikeThis(pin);
  }

  const handleStashClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onStash(pin);
  }

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
      e.stopPropagation();
      onTagClick(tag);
  }

  const handleRemixClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsRemixing(true);
      setTimeout(() => setIsRemixing(false), 2000); 
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowHeart(true);
      if(!isSaved) handleQuickSave(e);
      setTimeout(() => setShowHeart(false), 1000);
  }

  // Handle Author Click
  const handleAuthorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(onUserClick) onUserClick(pin.author);
  }

  const handleFlip = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsFlipped(!isFlipped);
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isPeeking) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Amplified rotation for effect
      const rotateX = ((y - centerY) / centerY) * -5; 
      const rotateY = ((x - centerX) / centerX) * 5;

      setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
      setIsHovered(true);
      peekTimeout.current = setTimeout(() => {
          setIsPeeking(true);
      }, 1500); // Slower peek
  }

  const handleMouseLeave = () => {
      setIsHovered(false);
      setShowBoardSelect(false);
      setRotation({ x: 0, y: 0 });
      if (peekTimeout.current) clearTimeout(peekTimeout.current);
      setIsPeeking(false);
      setIsFlipped(false); // Reset flip on leave
  };

  return (
    <div 
      ref={cardRef}
      className="relative mb-6 break-inside-avoid rounded-[32px] cursor-zoom-in group perspective-1000 z-0 hover:z-20"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(pin)}
      onDoubleClick={handleDoubleClick}
      style={{
          perspective: '1200px'
      }}
    >
      <div 
        className="relative w-full h-full rounded-[32px] overflow-hidden bg-gray-200 transition-all duration-500 ease-out shadow-sm group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.2)]"
        style={{
            transform: isFlipped 
                ? `rotateY(180deg)` 
                : isPeeking 
                    ? 'scale(1.05) translateY(-10px)' 
                    : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`,
            transformStyle: 'preserve-3d',
            transition: isFlipped ? 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'transform 0.3s ease-out'
        }}
      >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden z-10">
             {isRemixing && (
                 <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in">
                     <Wand2 size={48} className="animate-spin mb-4 text-emerald-400" />
                     <p className="font-bold tracking-widest uppercase text-sm">Generating Variations...</p>
                 </div>
              )}

              <img 
                src={pin.imageUrl} 
                alt={pin.title}
                className="w-full h-full object-cover pointer-events-none transition-all duration-700 ease-in-out"
                style={{ 
                    aspectRatio: `${pin.width} / ${pin.height}`,
                    filter: isHovered && !isPeeking ? 'brightness(0.9) contrast(1.05)' : 'none',
                }}
                loading="lazy"
              />
              
              {/* Subscriber Exclusive Badge */}
              {pin.isExclusive && (
                  <div className="absolute top-4 left-4 z-30 bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md border border-white/20">
                      <Crown size={12} fill="currentColor" className="text-yellow-300"/>
                      <span className="text-[10px] font-black uppercase tracking-wider">Subscriber Only</span>
                  </div>
              )}

              {/* Promoted Badge */}
              {pin.monetization?.isPromoted && (
                  <div className="absolute top-4 right-4 z-30 bg-white/90 text-gray-900 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                      <Megaphone size={12} className="text-orange-500"/>
                      <span className="text-[10px] font-black uppercase tracking-wider">Promoted</span>
                  </div>
              )}
              
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-all duration-300 ${showHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                 <Heart size={80} className="fill-emerald-500 text-emerald-500 drop-shadow-2xl animate-bounce" />
              </div>

              {/* Peek Overlay */}
              <div className={`absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white transition-all duration-500 ${isPeeking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                    <Eye size={28} className="text-emerald-400" />
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-center leading-tight">{pin.title}</h3>
                 <div className="flex gap-6 mt-2">
                     <div className="text-center">
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Views</p>
                         <p className="font-mono text-xl font-bold text-emerald-300">{(pin.likes * 12).toLocaleString()}</p>
                     </div>
                     <div className="text-center">
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Saves</p>
                         <p className="font-mono text-xl font-bold text-emerald-300">{pin.likes.toLocaleString()}</p>
                     </div>
                 </div>
              </div>

              {/* Hover Controls */}
              <div 
                className={`absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300 ${isHovered && !isPeeking ? 'opacity-100' : 'opacity-0'}`}
              >
                  <div className="flex justify-between items-start relative z-20 translate-z-20" style={{ transform: 'translateZ(20px)' }}>
                     <div className="text-white drop-shadow-md font-bold text-sm flex items-center opacity-0 group-hover:opacity-100 transition-all delay-100 translate-y-[-10px] group-hover:translate-y-0 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                         <span className="max-w-[100px] truncate">{selectedBoard?.title || 'Profile'}</span>
                         <ChevronDown size={14} className="ml-1" />
                     </div>

                     <div className="relative flex items-center shadow-2xl rounded-full overflow-hidden transition-transform active:scale-95 group-hover:translate-y-0 translate-y-[-10px] ring-1 ring-white/20">
                        <button 
                          className={`px-4 py-3 font-bold text-sm transition-all duration-300 flex items-center gap-2
                            ${isSaved 
                                ? 'bg-black text-white' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                          onClick={handleQuickSave}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                          {isSaved && <Check size={14} className="animate-in zoom-in spin-in-90 duration-300" />}
                        </button>
                        <button 
                            className={`p-3 border-l border-white/10 ${isSaved 
                                ? 'bg-black text-white hover:bg-gray-800' 
                                : 'bg-emerald-700 text-white hover:brightness-110'}`}
                            onClick={handleBoardSelectClick}
                        >
                            <ChevronDown size={16} />
                        </button>
                     </div>
                  </div>

                  <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 items-center"
                      style={{ transform: 'translate(-50%, -50%) translateZ(30px)' }}
                  >
                        <div className="flex gap-3">
                            <button 
                                onClick={handleMoreLikeThisClick}
                                className="p-3.5 bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg border border-white/30 group/btn"
                                title="Find similar ideas"
                            >
                                <ScanSearch size={22} className="group-hover/btn:animate-pulse" />
                            </button>
                            <button 
                                onClick={handleStashClick}
                                className="p-3.5 bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg border border-white/30"
                                title="Add to Stash"
                            >
                                <Archive size={22} />
                            </button>
                        </div>
                        <button 
                            onClick={handleFlip}
                            className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 hover:bg-black transition"
                        >
                            Flip Card
                        </button>
                  </div>

                  <div 
                      className="flex flex-col gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                      style={{ transform: 'translateZ(20px)' }}
                   >
                     <div className="flex justify-between items-end gap-2">
                        <button 
                            className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-white hover:text-black text-white transition-colors"
                            onClick={handleAuthorClick}
                        >
                            <img src={pin.author.avatarUrl} className="w-5 h-5 rounded-full border border-white/50" alt="" />
                            <span className="text-[10px] font-bold max-w-[80px] truncate">{pin.author.username}</span>
                        </button>

                        <div className="flex gap-2">
                            <button className="bg-white/90 backdrop-blur-xl p-2.5 rounded-full hover:bg-white text-black shadow-lg transition-all hover:scale-110">
                                <Share2 size={18} />
                            </button>
                            <button className="bg-white/90 backdrop-blur-xl p-2.5 rounded-full hover:bg-white text-black shadow-lg transition-all hover:scale-110">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                     </div>
                  </div>
              </div>
          </div>

          {/* BACK SIDE (Flipped) */}
          <div 
            className="absolute inset-0 bg-white rounded-[32px] p-8 flex flex-col backface-hidden z-20"
            style={{ transform: 'rotateY(180deg)' }}
          >
              <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-2">{pin.title}</h3>
                  <button onClick={handleFlip} className="p-2 hover:bg-gray-100 rounded-full transition">
                      <RotateCcw size={18} className="text-gray-500" />
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin">
                  <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">{pin.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                      {pin.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">#{tag}</span>
                      ))}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Quick Share</p>
                      <div className="w-24 h-24 bg-gray-900 mx-auto rounded-lg mb-2 flex items-center justify-center text-white/20">
                          <Share2 size={32}/>
                      </div>
                      <p className="text-xs text-emerald-600 font-bold cursor-pointer hover:underline">Copy Link</p>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
