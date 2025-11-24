

import React, { useEffect, useState, useRef } from 'react';
import { X, MoreHorizontal, Share2, BadgeCheck, Heart, Smile, ChevronDown, Download, Maximize2, Crop, Sparkles, ShoppingBag, Search } from 'lucide-react';
import { Pin, Comment, Board, User } from '../types';
import { generateRelatedComments } from '../services/geminiService';
import { PinCard } from './PinCard';

interface PinDetailProps {
  pin: Pin;
  onClose: () => void;
  relatedPins: Pin[]; 
  boards: Board[];
  onTagClick: (tag: string) => void;
  onUserClick?: (user: User) => void;
}

interface VisualDot {
    id: number;
    x: number;
    y: number;
    label: string;
    price: string;
}

export const PinDetail: React.FC<PinDetailProps> = ({ pin, onClose, relatedPins, boards, onTagClick, onUserClick }) => {
  const [comments, setComments] = useState<Comment[]>(pin.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCropMode, setIsCropMode] = useState(false);
  
  // Magic Zoom & Visual Dots State
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [visualDots, setVisualDots] = useState<VisualDot[]>([]);

  // Floating Reactions
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, char: string, left: number}[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Simulate finding "shoppable" items in the image
    const randomDots: VisualDot[] = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, i) => ({
        id: i,
        x: Math.random() * 60 + 20, // Keep away from edges
        y: Math.random() * 60 + 20,
        label: ['Modern Lamp', 'Abstract Print', 'Ceramic Vase', 'Wool Throw'][Math.floor(Math.random() * 4)],
        price: `$${Math.floor(Math.random() * 100) + 20}.00`
    }));
    setVisualDots(randomDots);

    if (comments.length === 0) {
        setLoadingComments(true);
        generateRelatedComments(pin.title).then(generated => {
             const newComments: Comment[] = generated.map((text, i) => ({
                 id: `c-${Date.now()}-${i}`,
                 text,
                 user: {
                     id: `u-${i}`,
                     username: `user_${Math.floor(Math.random() * 1000)}`,
                     avatarUrl: `https://picsum.photos/seed/${i + 100}/50/50`,
                     followers: 0,
                     following: 0
                 },
                 timestamp: `${Math.floor(Math.random() * 5) + 1}h`,
                 likes: Math.floor(Math.random() * 50),
                 liked: false
             }));
             setComments(newComments);
             setLoadingComments(false);
        });
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [pin.id]);

  const handleAuthorClick = () => {
      if(onUserClick) {
          onClose();
          onUserClick(pin.author);
      }
  }

  const toggleCommentLike = (commentId: string) => {
      setComments(prev => prev.map(c => {
          if (c.id === commentId) {
              return { 
                  ...c, 
                  liked: !c.liked, 
                  likes: c.liked ? c.likes - 1 : c.likes + 1 
              };
          }
          return c;
      }));
  }

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!imageContainerRef.current) return;
      const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPosition({ x, y });
  }

  const triggerQuickReact = (emoji: string) => {
      const id = Date.now();
      const left = Math.random() * 60 + 20; // Random horizontal position
      setFloatingEmojis(prev => [...prev, { id, char: emoji, left }]);
      
      // Remove after animation
      setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(e => e.id !== id));
      }, 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row animate-in fade-in duration-200">
        
        <button 
            className="fixed top-6 left-6 z-[110] p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-xl"
            onClick={onClose}
        >
            <X size={24} />
        </button>

        {/* Left Side: Immersive Image Viewer */}
        <div 
            className="w-full md:w-[60%] lg:w-[65%] h-[50vh] md:h-full bg-black flex items-center justify-center relative group overflow-hidden cursor-zoom-in"
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
        >
            <div 
                className="absolute inset-0 opacity-30 blur-3xl scale-110"
                style={{ backgroundImage: `url(${pin.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            ></div>
            
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <img 
                    src={pin.imageUrl} 
                    alt={pin.title} 
                    className={`max-w-full max-h-[90vh] object-contain transition-all duration-200 ${isCropMode ? 'scale-90 opacity-50' : ''}`}
                    style={{
                        transform: isZooming && !isCropMode ? 'scale(1.5)' : 'scale(1)',
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                />

                {/* Visual Dots (Shop the Look) */}
                {!isZooming && !isCropMode && visualDots.map(dot => (
                    <div 
                        key={dot.id}
                        className="absolute w-6 h-6 z-30 cursor-pointer group/dot animate-in zoom-in duration-500"
                        style={{ top: `${dot.y}%`, left: `${dot.x}%` }}
                    >
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-6 h-6 bg-white rounded-full border-2 border-transparent group-hover/dot:border-emerald-500 shadow-lg flex items-center justify-center transition-colors">
                            <div className="w-2 h-2 bg-black rounded-full group-hover/dot:bg-emerald-600"></div>
                        </div>

                        {/* Tooltip Product Card */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover/dot:opacity-100 transition-all duration-300 translate-y-2 group-hover/dot:translate-y-0 pointer-events-none group-hover/dot:pointer-events-auto w-48 bg-white rounded-xl shadow-2xl p-3 border border-gray-100">
                             <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                 <img src={`https://picsum.photos/seed/${dot.id}prod/200/200`} className="w-full h-full object-cover" />
                             </div>
                             <p className="font-bold text-gray-900 text-sm">{dot.label}</p>
                             <div className="flex justify-between items-center mt-1">
                                 <span className="text-xs font-bold text-emerald-600">{dot.price}</span>
                                 <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white">
                                     <ShoppingBag size={10} />
                                 </div>
                             </div>
                             <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b border-r border-gray-100"></div>
                        </div>
                    </div>
                ))}
                
                {isCropMode && (
                    <div className="absolute w-64 h-64 border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] flex items-center justify-center">
                         <div className="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-md">Select Area</div>
                         {/* Corner Markers */}
                         <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-white"></div>
                         <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-white"></div>
                         <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-white"></div>
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-white"></div>
                    </div>
                )}
            </div>

            {/* Image Tools */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                    className={`p-4 rounded-full text-white transition shadow-lg border border-white/10 ${isCropMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-white/10 backdrop-blur-md hover:bg-white hover:text-black'}`}
                    onClick={(e) => { e.stopPropagation(); setIsCropMode(!isCropMode); }}
                    title="Visual Scan"
                >
                    <Crop size={20} />
                </button>
                <button 
                    className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition shadow-lg border border-white/10"
                    title="View Fullscreen"
                >
                    <Maximize2 size={20} />
                </button>
                <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition shadow-lg border border-white/10">
                    <Download size={20} />
                </button>
            </div>
            
            {/* Visual Search Hint */}
            {!isCropMode && !isZooming && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 border border-white/10">
                     <Search size={12} /> Hover to zoom • Click dots to shop
                </div>
            )}
        </div>

        {/* Right Side: Details & Interaction */}
        <div className="w-full md:w-[40%] lg:w-[35%] h-full flex flex-col bg-white overflow-y-auto relative scrollbar-thin">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-30 p-6 flex justify-between items-center border-b border-gray-100">
                <div className="flex gap-2">
                    <button className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"><MoreHorizontal size={24}/></button>
                    <button className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"><Share2 size={24}/></button>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition text-gray-900">Profile</button>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold hover:shadow-lg hover:brightness-110 transition active:scale-95">Save</button>
                </div>
            </div>

            <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <Sparkles size={12} /> 98% Visual Match
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <BadgeCheck size={12} className="text-blue-500" /> Verified Creator
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{pin.title}</h1>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">{pin.description}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                    {pin.tags.map((tag, i) => (
                        <button 
                            key={i} 
                            onClick={() => { onClose(); onTagClick(tag); }}
                            className="px-4 py-2 bg-gray-100 rounded-full font-bold text-gray-600 hover:bg-emerald-500 hover:text-white transition shadow-sm"
                        >
                            #{tag}
                        </button>
                    ))}
                </div>

                {/* Author Card */}
                <div 
                    onClick={handleAuthorClick}
                    className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer group"
                >
                    <img src={pin.author.avatarUrl} alt={pin.author.username} className="w-14 h-14 rounded-full border border-white shadow-sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-1">
                            <p className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition">{pin.author.username}</p>
                            <BadgeCheck size={16} className="text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-500">{pin.author.followers.toLocaleString()} followers</p>
                    </div>
                    <button className="px-6 py-2 bg-gray-200 rounded-full font-bold hover:bg-black hover:text-white transition group-hover:bg-emerald-600 group-hover:text-white">Follow</button>
                </div>

                {/* Comments Section */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        {comments.length} Comments <ChevronDown size={18} />
                    </h3>
                    {loadingComments ? (
                        <div className="space-y-4 animate-pulse">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <img 
                                        src={comment.user.avatarUrl} 
                                        className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80" 
                                        alt="u"
                                        onClick={() => onUserClick && onUserClick(comment.user)}
                                    />
                                    <div className="flex flex-col flex-1">
                                        <div className="bg-gray-50 px-4 py-2 rounded-2xl rounded-tl-none inline-block self-start">
                                            <span 
                                                className="font-bold text-gray-900 mr-2 block text-xs mb-0.5 cursor-pointer hover:underline"
                                                onClick={() => onUserClick && onUserClick(comment.user)}
                                            >
                                                {comment.user.username}
                                            </span>
                                            <span className="text-gray-800 text-sm">{comment.text}</span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-1 ml-2 font-semibold items-center">
                                            <span>{comment.timestamp}</span>
                                            <button className="hover:text-gray-900">Reply</button>
                                            
                                            {/* Comment Like Button */}
                                            <button 
                                                className={`flex items-center gap-1 transition-colors hover:text-red-500 ${comment.liked ? 'text-red-500' : ''}`}
                                                onClick={() => toggleCommentLike(comment.id)}
                                            >
                                                <Heart 
                                                    size={12} 
                                                    className={`transition-transform duration-300 ${comment.liked ? 'fill-current scale-110' : ''}`}
                                                /> 
                                                {comment.likes > 0 ? comment.likes : 'Like'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 z-30">
                {/* Floating Emojis Container */}
                <div className="absolute bottom-20 left-0 right-0 pointer-events-none h-64 overflow-hidden z-40">
                    {floatingEmojis.map(emoji => (
                        <div 
                            key={emoji.id}
                            className="absolute bottom-0 text-4xl animate-[floatUp_2s_ease-out_forwards]"
                            style={{ left: `${emoji.left}%` }}
                        >
                            {emoji.char}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 mb-3 justify-start overflow-x-auto pb-2 scrollbar-hide px-2">
                    <span className="text-xs font-bold text-gray-400 mr-2">Quick react:</span>
                    {['❤️', '🔥', '👏', '😲', '🙌'].map(emoji => (
                        <button 
                            key={emoji}
                            className="text-xl hover:scale-125 transition active:scale-95 px-1"
                            onClick={() => triggerQuickReact(emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white border border-transparent focus:border-emerald-300 rounded-full px-6 py-4 outline-none transition-all shadow-sm"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-emerald-100 rounded-full text-gray-500 hover:text-emerald-600 transition">
                        <Smile size={24} />
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-6">More like this</h2>
                <div className="grid grid-cols-2 gap-4">
                    {relatedPins.slice(0, 6).map(related => (
                        <div key={related.id} className="break-inside-avoid">
                            <PinCard 
                                pin={related} 
                                onClick={() => {}} 
                                onSave={() => {}} 
                                onMoreLikeThis={() => {}}
                                onStash={() => {}}
                                onTagClick={onTagClick}
                                boards={boards} 
                                onUserClick={onUserClick}
                            />
                        </div>
                    ))}
                </div>
                <button className="w-full py-4 mt-4 bg-white border border-gray-300 rounded-full font-bold hover:bg-gray-100 transition text-gray-900">
                    See more
                </button>
            </div>
        </div>
        
        <style>{`
            @keyframes floatUp {
                0% { transform: translateY(0) scale(0.5); opacity: 1; }
                100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
            }
        `}</style>
    </div>
  );
};
