import React, { useState, useRef, MouseEvent } from 'react';
import { Share2, MoreHorizontal, ChevronDown, Check, ScanSearch, Archive, Heart, Hash, Eye, TrendingUp } from 'lucide-react';
import { Pin, Board } from '../types';

interface PinCardProps {
  pin: Pin;
  onClick: (pin: Pin) => void;
  onSave: (pin: Pin, boardId?: string) => void;
  onMoreLikeThis: (pin: Pin) => void;
  onStash: (pin: Pin) => void;
  onTagClick: (tag: string) => void;
  boards: Board[];
}

// Mock color extraction for innovation feature
const MOCK_PALETTE = [
    "#2D3436", "#00B894", "#55EFC4", "#81ECEC", "#74B9FF"
];

export const PinCard: React.FC<PinCardProps> = ({ pin, onClick, onSave, onMoreLikeThis, onStash, onTagClick, boards }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showBoardSelect, setShowBoardSelect] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  
  // 3D Tilt & Peek State
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

  // Double Click to Like Innovation
  const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowHeart(true);
      if(!isSaved) handleQuickSave(e);
      setTimeout(() => setShowHeart(false), 1000);
  }

  // 3D Tilt Logic
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isPeeking) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
      const rotateY = ((x - centerX) / centerX) * 5;

      setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
      setIsHovered(true);
      // Innovation: Hold to Peek
      peekTimeout.current = setTimeout(() => {
          setIsPeeking(true);
      }, 800);
  }

  const handleMouseLeave = () => {
      setIsHovered(false);
      setShowBoardSelect(false);
      setRotation({ x: 0, y: 0 });
      if (peekTimeout.current) clearTimeout(peekTimeout.current);
      setIsPeeking(false);
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
          perspective: '1000px'
      }}
    >
      <div 
        className="relative w-full h-full rounded-[32px] overflow-hidden bg-gray-100 transition-all duration-300 ease-out shadow-lg group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
        style={{
            transform: isPeeking ? 'scale(1.05) translateY(-10px)' : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`,
            transformStyle: 'preserve-3d'
        }}
      >
          <img 
            src={pin.imageUrl} 
            alt={pin.title}
            className="w-full h-auto object-cover pointer-events-none transition-all duration-700 ease-in-out"
            style={{ 
                aspectRatio: `${pin.width} / ${pin.height}`,
                filter: isHovered && !isPeeking ? 'brightness(0.7) contrast(1.1)' : 'none',
            }}
            loading="lazy"
          />
          
          {/* Double Click Heart Animation */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-all duration-300 ${showHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
             <Heart size={80} className="fill-emerald-500 text-emerald-500 drop-shadow-2xl animate-bounce" />
          </div>

          {/* Peek Overlay (Stats) - Appears on Long Hover */}
          <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white transition-opacity duration-300 ${isPeeking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 animate-bounce">
                <Eye size={32} className="text-emerald-400" />
             </div>
             <h3 className="font-bold text-xl mb-2 text-center">{pin.title}</h3>
             <div className="flex gap-4 mt-2">
                 <div className="text-center">
                     <p className="text-xs text-gray-400 font-bold uppercase">Views</p>
                     <p className="font-mono text-lg font-bold text-emerald-300">{(pin.likes * 12).toLocaleString()}</p>
                 </div>
                 <div className="text-center">
                     <p className="text-xs text-gray-400 font-bold uppercase">Saves</p>
                     <p className="font-mono text-lg font-bold text-emerald-300">{pin.likes.toLocaleString()}</p>
                 </div>
             </div>
             <div className="mt-6 flex items-center gap-1 text-emerald-400 text-sm font-bold">
                 <TrendingUp size={16} /> Rising Trend
             </div>
          </div>

          {/* Standard Overlay - Visible on Hover */}
          <div 
            className={`absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300 ${isHovered && !isPeeking ? 'opacity-100' : 'opacity-0'}`}
          >
              
              {/* Top Section */}
              <div className="flex justify-between items-start relative z-20 translate-z-20" style={{ transform: 'translateZ(20px)' }}>
                 
                 {/* Board Indicator */}
                 <div className="text-white drop-shadow-md font-bold text-sm flex items-center opacity-0 group-hover:opacity-100 transition-all delay-100 translate-y-[-10px] group-hover:translate-y-0 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                     <span className="max-w-[100px] truncate">{selectedBoard?.title || 'Profile'}</span>
                     <ChevronDown size={14} className="ml-1" />
                 </div>

                 {/* Split Quick Save Button */}
                 <div className="relative flex items-center shadow-2xl rounded-full overflow-hidden transition-transform active:scale-95 group-hover:translate-y-0 translate-y-[-10px] ring-1 ring-white/20">
                    <button 
                      className={`px-5 py-3 font-bold text-sm transition-all duration-300 flex items-center gap-2
                        ${isSaved 
                            ? 'bg-black text-white' 
                            : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500'}`}
                      onClick={handleQuickSave}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                      {isSaved && <Check size={14} className="animate-in zoom-in spin-in-90 duration-300" />}
                    </button>
                    <button 
                        className={`p-3 border-l border-white/10 ${isSaved 
                            ? 'bg-black text-white hover:bg-gray-800' 
                            : 'bg-gradient-to-br from-teal-600 to-teal-700 text-white hover:brightness-110'}`}
                        onClick={handleBoardSelectClick}
                    >
                        <ChevronDown size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {showBoardSelect && (
                        <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 w-60 z-50 animate-in fade-in slide-in-from-top-2 border border-gray-100">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase">Save to board</p>
                            </div>
                            <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                {boards.map(board => (
                                    <button 
                                        key={board.id} 
                                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm font-medium text-gray-900 truncate flex justify-between group/item transition-colors"
                                        onClick={(e) => handleBoardChoice(e, board)}
                                    >
                                        {board.title}
                                        {board.id === selectedBoard?.id && <Check size={14} className="text-emerald-600"/>}
                                    </button>
                                ))}
                            </div>
                            <div className="px-3 py-2 border-t border-gray-100">
                                 <button className="w-full py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">Create Board</button>
                            </div>
                        </div>
                    )}
                 </div>
              </div>

              {/* Middle - Innovation Actions */}
              <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100"
                  style={{ transform: 'translate(-50%, -50%) translateZ(30px)' }}
              >
                    <button 
                        onClick={handleMoreLikeThisClick}
                        className="p-4 bg-white/20 backdrop-blur-lg rounded-full text-white hover:bg-emerald-500 hover:scale-110 transition-all shadow-lg border border-white/30 group/btn"
                        title="Find similar ideas"
                    >
                        <ScanSearch size={24} className="group-hover/btn:animate-pulse" />
                    </button>
                    <button 
                        onClick={handleStashClick}
                        className="p-4 bg-white/20 backdrop-blur-lg rounded-full text-white hover:bg-emerald-500 hover:scale-110 transition-all shadow-lg border border-white/30"
                        title="Add to Stash"
                    >
                        <Archive size={24} />
                    </button>
              </div>

              {/* Bottom Section */}
              <div 
                  className="flex flex-col gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                  style={{ transform: 'translateZ(20px)' }}
               >
                 
                 {/* Innovation: Palette Extractor */}
                 <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                     {MOCK_PALETTE.map((color, i) => (
                         <div 
                            key={i} 
                            className="w-4 h-4 rounded-full shadow-md border border-white/20 hover:scale-150 transition-transform cursor-pointer"
                            style={{ backgroundColor: color }}
                            title={`Filter by ${color}`}
                            onClick={(e) => { e.stopPropagation(); /* Trigger color filter logic */ }}
                         ></div>
                     ))}
                 </div>

                 <div className="flex justify-between items-end gap-2">
                    {/* Interactive Tags (Replaces Source) */}
                    <div className="flex flex-wrap gap-1.5 max-w-[75%]">
                        {pin.tags.slice(0, 3).map((tag, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => handleTagClick(e, tag)}
                                className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[11px] font-bold text-white hover:bg-emerald-500 hover:text-white transition-all border border-white/10 flex items-center gap-1 hover:scale-105 shadow-sm active:scale-95"
                            >
                                <Hash size={10} className="opacity-70" /> {tag}
                            </button>
                        ))}
                    </div>

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
    </div>
  );
};