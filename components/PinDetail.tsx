import React, { useEffect, useState } from 'react';
import { X, MoreHorizontal, Share2, ArrowUpRight, Heart, Smile, ChevronDown, Download, Maximize2 } from 'lucide-react';
import { Pin, Comment, Board } from '../types';
import { generateRelatedComments } from '../services/geminiService';
import { PinCard } from './PinCard';

interface PinDetailProps {
  pin: Pin;
  onClose: () => void;
  relatedPins: Pin[]; // Passed for the related grid
  boards: Board[];
  onTagClick: (tag: string) => void;
}

export const PinDetail: React.FC<PinDetailProps> = ({ pin, onClose, relatedPins, boards, onTagClick }) => {
  const [comments, setComments] = useState<Comment[]>(pin.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
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
                 timestamp: '2h'
             }));
             setComments(newComments);
             setLoadingComments(false);
        });
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [pin.id]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row animate-in fade-in duration-200">
        
        {/* CLOSE BUTTON - Fixed */}
        <button 
            className="fixed top-6 left-6 z-[110] p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-xl"
            onClick={onClose}
        >
            <X size={24} />
        </button>

        {/* LEFT: Immersive Media Side (Scrollable on mobile, Fixed on desktop) */}
        <div className="w-full md:w-[60%] lg:w-[65%] h-[50vh] md:h-full bg-black flex items-center justify-center relative group overflow-hidden">
            {/* Ambient Background */}
            <div 
                className="absolute inset-0 opacity-30 blur-3xl scale-110"
                style={{ backgroundImage: `url(${pin.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            ></div>
            
            <img 
                src={pin.imageUrl} 
                alt={pin.title} 
                className="relative z-10 w-full h-full object-contain transition-transform duration-700 hover:scale-105" 
                style={{ maxHeight: '100vh', maxWidth: '100%' }}
            />

            {/* Floating Actions on Media */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition shadow-lg border border-white/10">
                    <Maximize2 size={20} />
                </button>
                <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition shadow-lg border border-white/10">
                    <Download size={20} />
                </button>
            </div>
        </div>

        {/* RIGHT: Interaction Side (Scrollable) */}
        <div className="w-full md:w-[40%] lg:w-[35%] h-full flex flex-col bg-white overflow-y-auto relative scrollbar-thin">
            
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-30 p-6 flex justify-between items-center border-b border-gray-100">
                <div className="flex gap-2">
                    <button className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"><MoreHorizontal size={24}/></button>
                    <button className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition"><Share2 size={24}/></button>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition text-gray-900">Profile</button>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold hover:shadow-lg hover:brightness-110 transition">Save</button>
                </div>
            </div>

            <div className="p-8">
                {/* Pin Info */}
                <a href="#" className="underline text-sm font-bold mb-4 flex items-center gap-1 text-gray-500 hover:text-black transition">
                    stoc-pro-source.com <ArrowUpRight size={14} />
                </a>
                <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{pin.title}</h1>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">{pin.description}</p>

                {/* Tags in Detail View */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {pin.tags.map((tag, i) => (
                        <button 
                            key={i} 
                            onClick={() => { onClose(); onTagClick(tag); }}
                            className="px-4 py-2 bg-gray-100 rounded-full font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
                        >
                            #{tag}
                        </button>
                    ))}
                </div>

                {/* Author Card */}
                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <img src={pin.author.avatarUrl} alt={pin.author.username} className="w-14 h-14 rounded-full border border-white shadow-sm" />
                    <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg">{pin.author.username}</p>
                        <p className="text-sm text-gray-500">{pin.author.followers.toLocaleString()} followers</p>
                    </div>
                    <button className="px-6 py-2 bg-gray-200 rounded-full font-bold hover:bg-black hover:text-white transition">Follow</button>
                </div>

                {/* Comments */}
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
                                    <img src={comment.user.avatarUrl} className="w-10 h-10 rounded-full flex-shrink-0" alt="u"/>
                                    <div className="flex flex-col flex-1">
                                        <div className="bg-gray-50 px-4 py-2 rounded-2xl rounded-tl-none inline-block self-start">
                                            <span className="font-bold text-gray-900 mr-2 block text-xs mb-0.5">{comment.user.username}</span>
                                            <span className="text-gray-800 text-sm">{comment.text}</span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-1 ml-2 font-semibold">
                                            <span>{comment.timestamp}</span>
                                            <button className="hover:text-gray-900">Reply</button>
                                            <button className="flex items-center hover:text-red-500 gap-1"><Heart size={12}/> Like</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Comment Input */}
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 z-30">
                <div className="flex items-center gap-2 mb-3 justify-start overflow-x-auto pb-2 scrollbar-hide px-2">
                    <span className="text-xs font-bold text-gray-400 mr-2">Quick react:</span>
                    <button className="text-xl hover:scale-125 transition">❤️</button>
                    <button className="text-xl hover:scale-125 transition">🔥</button>
                    <button className="text-xl hover:scale-125 transition">👏</button>
                    <button className="text-xl hover:scale-125 transition">😲</button>
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

            {/* Related Content Area */}
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
                            />
                        </div>
                    ))}
                </div>
                <button className="w-full py-4 mt-4 bg-white border border-gray-300 rounded-full font-bold hover:bg-gray-100 transition">
                    See more
                </button>
            </div>
        </div>
    </div>
  );
};