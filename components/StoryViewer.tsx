
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Heart, MessageCircle, Share2, MoreHorizontal, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Send } from 'lucide-react';
import { Story, User } from '../types';

interface StoryViewerProps {
  initialIndex: number;
  stories: Story[];
  onClose: () => void;
  onUserClick?: (user: User) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ initialIndex, stories, onClose, onUserClick }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  
  const [hearts, setHearts] = useState<{id: number, left: number}[]>([]);

  const STORY_DURATION = 5000; 
  const intervalRef = useRef<any>(null);

  const currentStory = stories[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setLiked(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setLiked(false);
    } else {
        setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now() - (progress / 100) * STORY_DURATION;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;

      if (newProgress >= 100) {
        handleNext();
      } else {
        setProgress(newProgress);
      }
    }, 16); 

    return () => clearInterval(intervalRef.current);
  }, [currentIndex, isPaused, handleNext, progress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') setIsPaused(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  const toggleLike = () => {
      setLiked(!liked);
      if (!liked) {
          const newHeart = { id: Date.now(), left: Math.random() * 40 + 30 };
          setHearts(prev => [...prev, newHeart]);
          setTimeout(() => {
              setHearts(prev => prev.filter(h => h.id !== newHeart.id));
          }, 1000);
      }
  };

  const handleUserClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(onUserClick) {
          onClose();
          onUserClick(currentStory.user);
      }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center animate-in fade-in duration-300">
      
      <div 
        className="absolute inset-0 opacity-30 blur-3xl scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${currentStory.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
      >
        <X size={32} />
      </button>

      <div className="relative w-full md:w-[450px] h-full md:h-[90vh] bg-black md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col group">
        
        <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-3 pt-4">
            {stories.map((story, idx) => (
                <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{ 
                            width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                        }}
                    ></div>
                </div>
            ))}
        </div>

        <div className="absolute top-8 left-0 right-0 z-30 px-4 flex items-center justify-between">
            <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                onClick={handleUserClick}
            >
                <img src={currentStory.user.avatarUrl} className="w-10 h-10 rounded-full border border-white/50" alt="user" />
                <div className="flex flex-col">
                    <span className="text-white font-bold text-sm leading-none flex items-center gap-1">
                        {currentStory.user.username}
                        <span className="text-white/60 font-normal text-xs">• {currentStory.timestamp}</span>
                    </span>
                    <span className="text-white/80 text-xs">Suggested for you</span>
                </div>
            </div>
            <div className="flex gap-4">
                 <button onClick={() => setIsPaused(!isPaused)}>
                     {isPaused ? <Play size={20} className="text-white"/> : <Pause size={20} className="text-white"/>}
                 </button>
                 {/* Mute/Unmute Toggle Button */}
                 <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="relative group/vol"
                 >
                     {isMuted ? <VolumeX size={20} className="text-white/70 group-hover/vol:text-white"/> : <Volume2 size={20} className="text-white"/>}
                     <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/vol:opacity-100 transition whitespace-nowrap">
                         {isMuted ? 'Unmute' : 'Mute'}
                     </span>
                 </button>
                 <button>
                    <MoreHorizontal size={24} className="text-white" />
                 </button>
            </div>
        </div>

        <div 
            className="w-full h-full relative cursor-pointer"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <img 
                src={currentStory.imageUrl} 
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105" 
                alt="story"
            />
            
            <div className="absolute inset-y-0 left-0 w-[20%] z-20" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
            <div className="absolute inset-y-0 right-0 w-[20%] z-20" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>

            {hearts.map(h => (
                <div 
                    key={h.id} 
                    className="absolute bottom-32 text-red-500 animate-in fade-in zoom-in duration-500 slide-out-to-top-32"
                    style={{ left: `${h.left}%` }}
                >
                    <Heart size={48} fill="currentColor" />
                </div>
            ))}
        </div>

        <div className="absolute bottom-24 right-4 z-30 flex flex-col items-center gap-6">
            <button className="flex flex-col items-center gap-1 group/btn" onClick={toggleLike}>
                <Heart 
                    size={32} 
                    className={`transition-all duration-300 ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white hover:scale-110'}`} 
                />
                <span className="text-white text-xs font-bold">{liked ? '4.2k' : '4.1k'}</span>
            </button>
            <button className="flex flex-col items-center gap-1 group/btn">
                <MessageCircle size={32} className="text-white hover:scale-110 transition-transform" />
                <span className="text-white text-xs font-bold">284</span>
            </button>
            <button className="flex flex-col items-center gap-1 group/btn">
                <Share2 size={32} className="text-white hover:scale-110 transition-transform" />
                <span className="text-white text-xs font-bold">Share</span>
            </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-30">
             <div className="flex gap-3 items-center mb-4">
                 <input 
                    type="text" 
                    placeholder="Send a message..." 
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder:text-white/60 focus:bg-white/20 outline-none backdrop-blur-md transition-all"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setComment('');
                            setIsPaused(false);
                        }
                    }}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                 />
                 <button className="p-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-lg">
                     <Send size={20} className={comment ? "translate-x-0.5 translate-y-[-1px]" : ""} />
                 </button>
             </div>
        </div>

        <button 
            onClick={handlePrev}
            className="fixed left-4 md:left-24 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all backdrop-blur-sm hidden md:block group-hover:opacity-100 opacity-0"
        >
            <ChevronLeft size={32} />
        </button>
        <button 
            onClick={handleNext}
            className="fixed right-4 md:right-24 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all backdrop-blur-sm hidden md:block group-hover:opacity-100 opacity-0"
        >
            <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};
