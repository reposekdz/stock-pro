
import React, { useEffect, useState, useRef } from 'react';
import { X, MoreHorizontal, Share2, BadgeCheck, Heart, Smile, ChevronDown, Download, Maximize2, Crop, Sparkles, ShoppingBag, Search, Lock, Crown, Play, Pause, Volume2, VolumeX, Megaphone, Briefcase, ChevronLeft, ChevronRight, Tag, Send, Copy, Link as LinkIcon, Facebook, Twitter, Instagram } from 'lucide-react';
import { Pin, Comment, Board, User, Product } from '../types';
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
    product?: Product;
}

export const PinDetail: React.FC<PinDetailProps> = ({ pin, onClose, relatedPins, boards, onTagClick, onUserClick }) => {
  const [comments, setComments] = useState<Comment[]>(pin.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  
  // Magic Zoom & Visual Dots State
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [visualDots, setVisualDots] = useState<VisualDot[]>([]);

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Carousel
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Determine dots or generate mocks
    if (pin.taggedProducts && pin.taggedProducts.length > 0) {
        const dots = pin.taggedProducts.map((p, i) => ({
            id: i,
            x: Math.random() * 60 + 20,
            y: Math.random() * 60 + 20,
            label: p.name,
            price: `${p.currency}${p.price}`,
            product: p
        }));
        setVisualDots(dots);
    } 

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

  const handleImageClick = (e: React.MouseEvent) => {
      if (!isTaggingMode || !imageContainerRef.current) return;
      
      const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      
      const newDot: VisualDot = {
          id: Date.now(),
          x,
          y,
          label: 'New Tag',
          price: '$0.00'
      };
      setVisualDots([...visualDots, newDot]);
      setIsTaggingMode(false); // Exit mode after one tag for demo
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!imageContainerRef.current || isTaggingMode) return;
      const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPosition({ x, y });
  };

  const handleDownload = () => {
      const link = document.createElement('a');
      link.href = activeMediaUrl;
      link.download = `stoc-${pin.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const activeMediaUrl = pin.slides ? pin.slides[currentSlideIndex].url : pin.imageUrl;
  
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row animate-in fade-in duration-200">
        
        <button 
            className="fixed top-6 left-6 z-[110] p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-xl"
            onClick={onClose}
        >
            <X size={24} />
        </button>

        {/* Left Side: Immersive Image/Video Viewer */}
        <div 
            className={`w-full md:w-[60%] lg:w-[65%] h-[50vh] md:h-full bg-black flex items-center justify-center relative group overflow-hidden ${isTaggingMode ? 'cursor-crosshair' : 'cursor-zoom-in'}`}
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => !isTaggingMode && setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onClick={handleImageClick}
        >
            {/* Blurred BG */}
            <div 
                className="absolute inset-0 opacity-30 blur-3xl scale-110"
                style={{ backgroundImage: `url(${activeMediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            ></div>
            
            <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden p-8">
                 <img 
                    src={activeMediaUrl} 
                    alt={pin.title} 
                    className="max-w-full max-h-full object-contain transition-transform duration-100 ease-linear shadow-2xl rounded-lg"
                    style={{
                        transform: isZooming && !isTaggingMode ? 'scale(1.5)' : 'scale(1)',
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                />

                {/* Visual Dots */}
                {visualDots.map(dot => (
                    <div 
                        key={dot.id}
                        className="absolute w-6 h-6 z-30 cursor-pointer group/dot animate-in zoom-in duration-500"
                        style={{ top: `${dot.y}%`, left: `${dot.x}%` }}
                    >
                        <div className="relative w-6 h-6 bg-white rounded-full border-2 border-transparent group-hover/dot:border-emerald-500 shadow-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full group-hover/dot:bg-emerald-600"></div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover/dot:opacity-100 transition-all bg-white rounded-xl shadow-xl p-3 w-32 text-center pointer-events-none">
                             <p className="font-bold text-xs">{dot.label}</p>
                             <p className="text-emerald-600 font-bold text-xs">{dot.price}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tools */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsTaggingMode(!isTaggingMode); }}
                    className={`p-4 rounded-full text-white transition shadow-lg border border-white/10 ${isTaggingMode ? 'bg-emerald-500' : 'bg-white/10 backdrop-blur-md hover:bg-white hover:text-black'}`}
                    title="Add Tag"
                >
                    <Tag size={20} />
                </button>
            </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-[40%] lg:w-[35%] h-full flex flex-col bg-white overflow-y-auto relative scrollbar-thin">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-30 p-6 flex justify-between items-center border-b border-gray-100">
                <div className="flex gap-2">
                    <button 
                        onClick={handleDownload}
                        className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"
                        title="Download Image"
                    >
                        <Download size={24}/>
                    </button>
                    <button className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"><MoreHorizontal size={24}/></button>
                    <button 
                        onClick={() => setShowShareSheet(true)}
                        className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"
                    >
                        <Share2 size={24}/>
                    </button>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold hover:shadow-lg shadow-emerald-200 transition">Save</button>
                </div>
            </div>

            <div className="p-8">
                <a href={pin.videoUrl || '#'} target="_blank" className="text-sm underline font-medium text-gray-800 mb-2 block truncate">
                    {pin.videoUrl ? 'youtube.com/watch' : 'stoc.pro/source'}
                </a>
                <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{pin.title}</h1>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">{pin.description}</p>

                {/* Author Card */}
                <div 
                    className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition"
                >
                    <img src={pin.author.avatarUrl} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                        <p className="font-bold text-gray-900">{pin.author.username}</p>
                        <p className="text-xs text-gray-500">{pin.author.followers} followers</p>
                    </div>
                    <button className="px-5 py-2 bg-gray-200 rounded-full font-bold hover:bg-black hover:text-white transition">Follow</button>
                </div>

                {/* Comments */}
                <div className="mb-24">
                    <h3 className="text-xl font-bold mb-6">{comments.length} Comments</h3>
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <img src={comment.user.avatarUrl} className="w-8 h-8 rounded-full mt-1" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-gray-900">{comment.user.username} <span className="text-gray-400 font-normal ml-2">{comment.timestamp}</span></span>
                                    <p className="text-gray-800 text-sm">{comment.text}</p>
                                    <div className="flex gap-4 mt-1 text-xs font-bold text-gray-500">
                                        <button className="hover:text-black">Reply</button>
                                        <button className="flex items-center gap-1 hover:text-red-500"><Heart size={10}/> Like</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comment Input */}
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 z-30">
                <div className="relative flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="flex-1 bg-gray-100 rounded-full px-6 py-4 outline-none focus:ring-2 ring-emerald-100 focus:bg-white transition"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                        disabled={!newComment.trim()}
                        className="p-4 bg-emerald-500 text-white rounded-full disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition shadow-lg hover:bg-emerald-600"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>

        {/* Share Sheet Modal */}
        {showShareSheet && (
            <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-in zoom-in-95 relative">
                    <button onClick={() => setShowShareSheet(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                    <h3 className="text-center font-bold text-lg mb-8">Share this Pin</h3>
                    
                    <div className="flex justify-center gap-6 mb-8">
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                             <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition">W</div>
                             <span className="text-xs font-medium">WhatsApp</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                             <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition"><Facebook size={24}/></div>
                             <span className="text-xs font-medium">Facebook</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                             <div className="w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition"><Twitter size={24}/></div>
                             <span className="text-xs font-medium">Twitter</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                             <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shadow-md group-hover:scale-110 transition"><LinkIcon size={24}/></div>
                             <span className="text-xs font-medium">Copy Link</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
