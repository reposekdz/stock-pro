
import React, { useEffect, useState, useRef } from 'react';
import { X, MoreHorizontal, Share2, BadgeCheck, Heart, Smile, ChevronDown, Download, Maximize2, Crop, Sparkles, ShoppingBag, Search, Lock, Crown, Play, Pause, Volume2, VolumeX, Megaphone, Briefcase, ChevronLeft, ChevronRight, Tag, Send, Copy, Link as LinkIcon, Facebook, Twitter, Instagram, Film, Monitor, MessageSquare, Subtitles, GripHorizontal, PictureInPicture2, BarChart2, Eye, MousePointer, BookOpen } from 'lucide-react';
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
  const [cinemaMode, setCinemaMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'updates' | 'chat'>('comments');
  const [showStats, setShowStats] = useState(false);
  const [note, setNote] = useState(pin.noteToSelf || "");
  const [showNote, setShowNote] = useState(false);

  // Magic Zoom & Visual Dots State
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [visualDots, setVisualDots] = useState<VisualDot[]>([]);

  // Video State
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPip, setIsPip] = useState(false);

  // Carousel
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Live Chat State
  const [liveMessages, setLiveMessages] = useState<{user: string, text: string, color: string}[]>([]);

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

    // Simulate Live Chat for Video
    if (pin.type === 'video') {
        const interval = setInterval(() => {
            const msgs = ["So cool! 🔥", "Love this edit", "Where is this?", "Goals 😍", "Song name?", "Wow 😮"];
            const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
            const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-purple-500', 'text-orange-500'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            setLiveMessages(prev => [...prev.slice(-10), {
                user: `Viewer${Math.floor(Math.random() * 99)}`,
                text: randomMsg,
                color: randomColor
            }]);
        }, 2000);
        return () => clearInterval(interval);
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
      if (!imageContainerRef.current || isTaggingMode || pin.type === 'video') return;
      const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPosition({ x, y });
  };

  const togglePip = async () => {
      if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPip(false);
      } else if (videoRef.current) {
          await videoRef.current.requestPictureInPicture();
          setIsPip(true);
      }
  };

  const handleDownload = () => {
      const link = document.createElement('a');
      link.href = activeMediaUrl;
      link.download = `nexos-${pin.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const activeMediaUrl = pin.slides ? pin.slides[currentSlideIndex].url : pin.imageUrl;
  
  return (
    <div className={`fixed inset-0 z-[200] bg-white flex flex-col animate-in fade-in duration-200 ${cinemaMode ? 'bg-black' : ''} overflow-y-auto`}>
        
        {/* Top Actions Overlay */}
        <div className="fixed top-0 left-0 right-0 z-[220] flex justify-between p-6 pointer-events-none">
            <button 
                className="pointer-events-auto p-3 bg-white/10 backdrop-blur-md border border-white/20 text-black md:text-white rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-xl"
                onClick={onClose}
            >
                <X size={24} />
            </button>
            <div className="flex gap-2 pointer-events-auto">
                 <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-black md:text-white rounded-full hover:bg-white hover:text-black transition"><MoreHorizontal size={24}/></button>
            </div>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col md:flex-row min-h-screen">
            
            {/* Left Side: Media & Related (Up Next) */}
            <div className={`w-full md:w-[60%] lg:w-[65%] bg-black flex flex-col relative ${isTaggingMode ? 'cursor-crosshair' : ''} ${cinemaMode ? 'md:w-full lg:w-full z-[150] h-screen fixed' : ''}`}>
                
                {/* Media Container */}
                <div 
                    className="relative w-full flex-1 min-h-[50vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-black group"
                    ref={imageContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => !isTaggingMode && setIsZooming(true)}
                    onMouseLeave={() => !isTaggingMode && setIsZooming(false)}
                    onClick={handleImageClick}
                >
                    {/* Blurred Background Ambiance */}
                    <div 
                        className="absolute inset-0 opacity-30 blur-3xl scale-110"
                        style={{ backgroundImage: `url(${pin.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    ></div>
                    
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-0 md:p-8">
                        {pin.type === 'video' ? (
                            <video 
                                ref={videoRef}
                                src={pin.videoUrl || activeMediaUrl} 
                                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-none md:rounded-lg"
                                controls={true}
                                autoPlay
                                loop
                            />
                        ) : (
                            <img 
                                src={activeMediaUrl} 
                                alt={pin.title} 
                                className="max-w-full max-h-[85vh] object-contain transition-transform duration-100 ease-linear shadow-2xl rounded-none md:rounded-lg"
                                style={{
                                    transform: isZooming && !isTaggingMode ? 'scale(1.5)' : 'scale(1)',
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                                }}
                            />
                        )}

                        {/* Visual Dots Overlay */}
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

                    {/* Media Controls Overlay */}
                    <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {pin.type === 'video' && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); togglePip(); }}
                                    className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-black transition shadow-lg border border-white/10"
                                    title="Picture in Picture"
                                >
                                    <PictureInPicture2 size={20} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCinemaMode(!cinemaMode); }}
                                    className={`p-3 rounded-full transition shadow-lg border border-white/10 ${cinemaMode ? 'bg-emerald-500 text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-black'}`}
                                    title="Cinema Mode"
                                >
                                    <Monitor size={20} />
                                </button>
                            </>
                        )}
                        {pin.type !== 'video' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsTaggingMode(!isTaggingMode); }}
                                className={`p-3 rounded-full text-white transition shadow-lg border border-white/10 ${isTaggingMode ? 'bg-emerald-500' : 'bg-white/10 backdrop-blur-md hover:bg-white hover:text-black'}`}
                                title="Add Tag"
                            >
                                <Tag size={20} />
                            </button>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                            className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-black transition shadow-lg border border-white/10"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* "Up Next" Video Rail (Only visible in normal mode) */}
                {!cinemaMode && (
                    <div className="w-full bg-black/95 border-t border-white/10 p-6">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Play size={18} className="text-emerald-500 fill-emerald-500"/> Up Next
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {relatedPins.filter(p => p.type === 'video').slice(0, 6).map(vid => (
                                <div key={vid.id} className="relative w-40 aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group hover:ring-2 ring-emerald-500 transition">
                                    <img src={vid.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 transition">
                                            <Play size={16} fill="white" className="text-white ml-0.5"/>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                                        <p className="text-white text-xs font-bold truncate">{vid.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Details */}
            {!cinemaMode && (
            <div className="w-full md:w-[40%] lg:w-[35%] bg-white flex flex-col h-auto md:h-screen relative border-l border-gray-100">
                
                {/* Sticky Action Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-30 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowShareSheet(true)}
                            className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"
                        >
                            <Share2 size={24}/>
                        </button>
                        <button className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"><LinkIcon size={24}/></button>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold hover:shadow-lg shadow-emerald-200 transition">Save</button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="p-8">
                        <div className="mb-6">
                            <a href={pin.videoUrl || '#'} target="_blank" className="text-sm underline font-medium text-gray-800 mb-2 block truncate w-fit">
                                {pin.videoUrl ? 'youtube.com' : 'nexos.app'}
                            </a>
                            <h1 className="text-3xl font-black mb-3 text-gray-900 leading-tight">{pin.title}</h1>
                            <p className="text-gray-600 text-lg leading-relaxed">{pin.description}</p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {pin.tags.map(tag => (
                                    <span key={tag} className="text-emerald-600 font-bold text-sm cursor-pointer hover:underline">#{tag}</span>
                                ))}
                            </div>
                        </div>
                        
                        {/* Note to Self */}
                        <div className="mb-6">
                             <button onClick={() => setShowNote(!showNote)} className="font-bold text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-2">
                                 {showNote ? <ChevronDown size={16}/> : <ChevronRight size={16}/>} Note to self
                             </button>
                             {showNote && (
                                 <textarea 
                                    className="w-full bg-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 ring-emerald-500 h-24 resize-none transition"
                                    placeholder="Add a private note..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                 />
                             )}
                        </div>

                        {/* Author Card */}
                        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition group">
                            <img src={pin.author.avatarUrl} className="w-12 h-12 rounded-full border border-white shadow-sm" />
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 flex items-center gap-1">
                                    {pin.author.username}
                                    {pin.author.isCreator && <Crown size={12} className="text-purple-600 fill-purple-600"/>}
                                </p>
                                <p className="text-xs text-gray-500">{pin.author.followers.toLocaleString()} followers</p>
                            </div>
                            <button className="px-5 py-2 bg-gray-200 rounded-full font-bold text-sm hover:bg-black hover:text-white transition">Follow</button>
                        </div>
                        
                        {/* Business Stats (Visible to Creator) */}
                        <div className="mb-8">
                            <button 
                                onClick={() => setShowStats(!showStats)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg"
                            >
                                <span className="flex items-center gap-2"><BarChart2 size={16}/> See Stats</span>
                                {showStats ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                            </button>
                            
                            {showStats && (
                                <div className="mt-2 bg-gray-50 rounded-xl border border-gray-100 p-4 grid grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase flex items-center justify-center gap-1"><Eye size={12}/> Views</p>
                                        <p className="text-lg font-black text-gray-900">12.5k</p>
                                    </div>
                                    <div className="text-center border-l border-gray-200">
                                        <p className="text-xs font-bold text-gray-400 uppercase flex items-center justify-center gap-1"><BookOpen size={12}/> Saves</p>
                                        <p className="text-lg font-black text-gray-900">432</p>
                                    </div>
                                    <div className="text-center border-l border-gray-200">
                                        <p className="text-xs font-bold text-gray-400 uppercase flex items-center justify-center gap-1"><MousePointer size={12}/> Clicks</p>
                                        <p className="text-lg font-black text-gray-900">128</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interaction Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button 
                                onClick={() => setActiveTab('comments')}
                                className={`pb-3 px-4 font-bold text-sm transition border-b-2 ${activeTab === 'comments' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                            >
                                Comments
                            </button>
                            {pin.type === 'video' && (
                                <button 
                                    onClick={() => setActiveTab('chat')}
                                    className={`pb-3 px-4 font-bold text-sm transition border-b-2 flex items-center gap-1 ${activeTab === 'chat' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400'}`}
                                >
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Live Chat
                                </button>
                            )}
                            <button 
                                onClick={() => setActiveTab('updates')}
                                className={`pb-3 px-4 font-bold text-sm transition border-b-2 ${activeTab === 'updates' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                            >
                                Transcript
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === 'comments' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        {comments.length} Comments <ChevronDown size={16}/>
                                    </h3>
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
                            )}

                            {activeTab === 'chat' && (
                                <div className="space-y-2 h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    {liveMessages.map((msg, i) => (
                                        <div key={i} className="animate-in slide-in-from-bottom-2 fade-in">
                                            <span className={`font-bold text-xs mr-2 ${msg.color}`}>{msg.user}:</span>
                                            <span className="text-sm text-gray-800">{msg.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'updates' && (
                                <div className="space-y-4 text-gray-600 text-sm leading-relaxed p-4 bg-gray-50 rounded-2xl">
                                    <p><span className="font-bold text-black">0:00</span> - Introduction to Tokyo nightlife.</p>
                                    <p><span className="font-bold text-black">0:15</span> - Exploring Shinjuku alleyways.</p>
                                    <p><span className="font-bold text-black">0:30</span> - Traditional food stalls.</p>
                                    <p><span className="font-bold text-black">0:45</span> - The crossing.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment Input */}
                <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-20">
                    <div className="relative flex gap-2">
                        <input 
                            type="text" 
                            placeholder={activeTab === 'chat' ? "Say something..." : "Add a comment..."}
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
            )}
        </div>

        {/* Bottom Section: Infinite Discovery (Related Pins) */}
        {!cinemaMode && (
            <div className="w-full bg-gray-50 p-6 md:p-12 border-t border-gray-200">
                <div className="max-w-[1600px] mx-auto">
                    <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">More to Explore</h3>
                    <div className="masonry-grid">
                        {relatedPins.map(rp => (
                            <PinCard 
                                key={rp.id}
                                pin={rp}
                                onClick={() => {}} // Just visual for now or recursion
                                onSave={() => {}}
                                onMoreLikeThis={() => {}}
                                onStash={() => {}}
                                onTagClick={() => {}}
                                boards={boards}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Share Sheet Modal */}
        {showShareSheet && (
            <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
