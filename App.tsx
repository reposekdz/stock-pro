
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PinCard } from './components/PinCard';
import { PinDetail } from './components/PinDetail';
import { Profile } from './components/Profile';
import { UserProfile } from './components/UserProfile';
import { SettingsModal } from './components/SettingsModal';
import { BoardDetail } from './components/BoardDetail';
import { StoryViewer } from './components/StoryViewer';
import { CreateModal } from './components/CreateModal';
import { Pin, User, Board, ViewState, Filter, Story } from './types';
import { generatePinDetails, getPersonalizedTopics } from './services/geminiService';
import { Wand2, Plus, SlidersHorizontal, ArrowUp, ScanLine, Loader2, Archive, X, ArrowRight, Zap, Play, ChevronLeft, ChevronRight, Palette, Layout, Sparkles, RefreshCw, Layers, Settings as SettingsIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_TOPICS = [
  "Eco Brutalism", "Neon Cyberpunk", "Sustainable Fashion", "Parametric Architecture", 
  "Abstract 3D Art", "Forest Cabins", "Ceramic Design", "Swiss Typography",
  "Streetwear 2025", "Cozy Lofts", "Futuristic UI/UX", "Matcha Aesthetic", "Plant Based",
  "Solar Punk", "DIY Tech", "Tattoo Art", "Glassmorphism", "Retro Anime", "Vaporwave", "Minimalist Setup"
];

const generateMockUser = (): User => ({
    id: 'current-user',
    username: 'DesignPro',
    avatarUrl: 'https://picsum.photos/seed/userPro/100/100',
    followers: 8420,
    following: 345,
    bio: 'Curating the future of design. Digital Architect & Visual Storyteller.',
    coverUrl: 'https://picsum.photos/seed/myCover/1600/400'
});

const generateMockBoards = (userId: string): Board[] => [
    {
        id: 'b1',
        title: 'Future Aesthetics',
        pins: [],
        isPrivate: true,
        collaborators: [{...generateMockUser(), role: 'owner'}],
        createdAt: new Date().toISOString()
    },
    {
        id: 'b2',
        title: 'Green Living',
        pins: [],
        isPrivate: false,
        collaborators: [{...generateMockUser(), role: 'owner'}],
        createdAt: new Date().toISOString()
    },
];

const generateMockStories = (): Story[] => {
    return Array.from({ length: 10 }).map((_, i) => ({
        id: `story-${i}`,
        user: {
            id: `user-${i}`,
            username: `Creator_${Math.floor(Math.random() * 1000)}`,
            avatarUrl: `https://picsum.photos/seed/avatar${i}/100/100`,
            followers: 100,
            following: 10
        },
        imageUrl: `https://picsum.photos/seed/story${i}v3/400/800`,
        timestamp: `${Math.floor(Math.random() * 12) + 1}h`,
        viewed: Math.random() > 0.7
    }));
};

const generateMockPins = (count: number, topicSeed?: string, tagsOverride?: string[]): Pin[] => {
  return Array.from({ length: count }).map((_, i) => {
    const topic = topicSeed || DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];
    const width = 600;
    const height = Math.floor(Math.random() * (900 - 500 + 1)) + 500;
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      title: topic,
      description: `A curated exploration of ${topic.toLowerCase()}. Visual innovation meets timeless design.`,
      imageUrl: `https://picsum.photos/seed/${id}v2/${width}/${height}`,
      width,
      height,
      tags: tagsOverride || [topic.split(' ')[0], 'inspiration', 'design'],
      likes: Math.floor(Math.random() * 2000),
      author: {
        id: `user-${i}`,
        username: `creator_${Math.floor(Math.random() * 999)}`,
        avatarUrl: `https://picsum.photos/seed/${id}avatar/100/100`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 500),
        bio: 'Just another creative soul wandering through the digital expanse.'
      }
    };
  });
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [historyStack, setHistoryStack] = useState<ViewState[]>([ViewState.HOME]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateTo = (newState: ViewState) => {
      const newHistory = historyStack.slice(0, historyIndex + 1);
      newHistory.push(newState);
      setHistoryStack(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setViewState(newState);
  };

  const goBack = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setViewState(historyStack[historyIndex - 1]);
      }
  };

  const goForward = () => {
      if (historyIndex < historyStack.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setViewState(historyStack[historyIndex + 1]);
      }
  };

  const [currentUser] = useState<User>(generateMockUser());
  const [boards, setBoards] = useState<Board[]>(generateMockBoards(currentUser.id));
  const [homePins, setHomePins] = useState<Pin[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [searchPins, setSearchPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [activeCategory, setActiveCategory] = useState("For You");
  
  // New States for Profile Viewing and Settings
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const [currentQuery, setCurrentQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [visualSearchImage, setVisualSearchImage] = useState<string | null>(null);
  const [visualSearchScanning, setVisualSearchScanning] = useState(false);

  const [stash, setStash] = useState<Pin[]>([]);
  const [showStash, setShowStash] = useState(false);
  const [isCanvasMode, setIsCanvasMode] = useState(false);
  const [showCreativeDock, setShowCreativeDock] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const storiesScrollRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPersonalizedFeed();
  }, []); 

  const loadPersonalizedFeed = async () => {
      setLoading(true);
      try {
          await new Promise(r => setTimeout(r, 500));
          const newPins = generateMockPins(30);
          setHomePins(newPins);
          setStories(generateMockStories());
      } finally {
          setLoading(false);
      }
  };

  const handleMagicShuffle = () => {
      setLoading(true);
      setTimeout(() => {
          const shuffled = [...homePins].sort(() => Math.random() - 0.5);
          setHomePins(shuffled);
          setLoading(false);
      }, 600);
  };

  const handleSearch = async (query: string) => {
    navigateTo(ViewState.SEARCH);
    setCurrentQuery(query);
    setLoading(true);
    setIsSearching(true);
    
    setTimeout(() => {
        setSearchPins(generateMockPins(20, query));
        setLoading(false);
        setIsSearching(false);
    }, 800);
  };

  const handleVisualSearch = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          if (e.target?.result) {
              setVisualSearchImage(e.target.result as string);
              navigateTo(ViewState.VISUAL_SEARCH);
              setVisualSearchScanning(true);
              
              setTimeout(() => {
                  setVisualSearchScanning(false);
                  setSearchPins(generateMockPins(15, "Similar Texture"));
              }, 2500);
          }
      };
      reader.readAsDataURL(file);
  };

  const handlePinClick = async (pin: Pin) => {
    setSelectedPin(pin);
  };

  const handleUserClick = (user: User) => {
      if (user.id === currentUser.id) {
          navigateTo(ViewState.PROFILE);
      } else {
          setViewingUser(user);
          navigateTo(ViewState.USER_PROFILE);
      }
  };

  const handleSavePin = (pin: Pin, boardId?: string) => {
      const targetBoardId = boardId || boards[0].id;
      setBoards(prev => prev.map(b => {
          if (b.id === targetBoardId) {
              if (b.pins.includes(pin.id)) return b;
              return { ...b, pins: [...b.pins, pin.id] };
          }
          return b;
      }));
  };

  const handleCreateBoard = () => {
      const title = prompt("Enter board name:");
      if (!title) return;
      const newBoard: Board = {
          id: `b-${Date.now()}`,
          title,
          pins: [],
          isPrivate: false,
          collaborators: [{...currentUser, role: 'owner'}],
          createdAt: new Date().toISOString()
      };
      setBoards([...boards, newBoard]);
  };

  const handleInviteToBoard = (email: string) => {
      if(!selectedBoard) return;
      alert(`Invitation sent to ${email}!`);
  };

  const handleMoreLikeThis = (pin: Pin) => {
      const query = `More like ${pin.title}`;
      handleSearch(query);
  };

  const handleAddToStash = (pin: Pin) => {
      if (!stash.find(p => p.id === pin.id)) {
          setStash(prev => [...prev, pin]);
          setShowStash(true);
      }
  };

  const handleCreatePin = (newPin: Pin) => {
      setHomePins(prev => [newPin, ...prev]);
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
      });
  };

  const handleCreateStory = (newStory: Story) => {
      setStories(prev => [newStory, ...prev]);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#34d399', '#10b981']
      });
  };

  const scrollCategories = (direction: 'left' | 'right') => {
      if (categoryScrollRef.current) {
          const scrollAmount = 300;
          categoryScrollRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
          });
      }
  };

  const scrollStories = (direction: 'left' | 'right') => {
      if (storiesScrollRef.current) {
          const scrollAmount = 400;
          storiesScrollRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
          });
      }
  }

  const renderContent = () => {
      if (loading) {
          return (
            <div className="flex flex-col items-center justify-center mt-32 gap-6 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                </div>
                <p className="text-gray-400 font-bold text-xl tracking-wide uppercase">Discovering...</p>
            </div>
          );
      }

      switch (viewState) {
          case ViewState.VISUAL_SEARCH:
              return (
                  <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-10">
                      <div className="relative w-full max-w-2xl aspect-[16/9] mb-12 rounded-[32px] overflow-hidden shadow-2xl group bg-black">
                          {visualSearchImage && <img src={visualSearchImage} className="w-full h-full object-contain opacity-80" />}
                          
                          {visualSearchScanning ? (
                              <div className="absolute inset-0 z-10">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-emerald-400 font-mono flex items-center gap-3 border border-emerald-500/30">
                                          <Loader2 className="animate-spin" /> ANALYZING PATTERNS...
                                      </div>
                                  </div>
                              </div>
                          ) : (
                              <div className="absolute inset-0 z-10 p-8">
                                  <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full animate-ping"></div>
                                  <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition">
                                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                  </div>
                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                      We found similar styles
                                  </div>
                              </div>
                          )}
                      </div>

                      {!visualSearchScanning && (
                          <div className="w-full">
                              <h2 className="text-2xl font-bold mb-6 px-2">Visual Matches</h2>
                              <div className="masonry-grid pb-24">
                                  {searchPins.map(pin => (
                                      <PinCard 
                                        key={pin.id} 
                                        pin={pin} 
                                        onClick={handlePinClick} 
                                        onSave={handleSavePin} 
                                        onMoreLikeThis={handleMoreLikeThis} 
                                        onStash={handleAddToStash} 
                                        onTagClick={handleSearch}
                                        onUserClick={handleUserClick}
                                        boards={boards} 
                                      />
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              );

          case ViewState.PROFILE:
              return (
                  <Profile 
                    user={currentUser} 
                    boards={boards} 
                    savedPins={[]} 
                    onCreateBoard={handleCreateBoard}
                    onOpenBoard={(b) => { setSelectedBoard(b); navigateTo(ViewState.BOARD); }}
                  />
              );
          
          case ViewState.USER_PROFILE:
              if(!viewingUser) return null;
              return (
                  <UserProfile 
                    user={viewingUser}
                    pins={generateMockPins(15)} // Simulate that user's pins
                    onBack={goBack}
                    onPinClick={handlePinClick}
                  />
              );

          case ViewState.BOARD:
              if (!selectedBoard) return null;
              const boardPins = selectedBoard.pins.length > 0 
                ? generateMockPins(selectedBoard.pins.length, selectedBoard.title)
                : [];
              return (
                  <BoardDetail 
                    board={selectedBoard}
                    pins={boardPins}
                    allBoards={boards}
                    onBack={() => goBack()}
                    onPinClick={handlePinClick}
                    onInvite={handleInviteToBoard}
                    onMoreLikeThis={handleMoreLikeThis}
                    onStash={handleAddToStash}
                    onTagClick={handleSearch}
                  />
              );

          case ViewState.SEARCH:
              return (
                  <>
                    <div className="mb-8 flex items-center gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide px-2">
                         <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold text-sm shadow-md flex-shrink-0 hover:bg-gray-800 transition">
                            <SlidersHorizontal size={16}/> Filter
                         </button>
                         {["Color", "Material", "Style", "Brand"].map((f, i) => (
                             <button key={i} className="px-6 py-3 bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-gray-800 rounded-full font-bold text-sm transition flex-shrink-0 shadow-sm">
                                 {f}
                             </button>
                         ))}
                    </div>
                    <div className={`masonry-grid pb-24 ${isCanvasMode ? 'gap-0' : ''}`}>
                        {searchPins.map(pin => (
                            <PinCard 
                                key={pin.id} 
                                pin={pin} 
                                onClick={handlePinClick} 
                                onSave={handleSavePin} 
                                onMoreLikeThis={handleMoreLikeThis} 
                                onStash={handleAddToStash} 
                                onTagClick={handleSearch}
                                onUserClick={handleUserClick}
                                boards={boards} 
                            />
                        ))}
                    </div>
                  </>
              );

          case ViewState.HOME:
          default:
              return (
                  <>
                      <div className="relative mb-8 mt-4 group/stories">
                         <button 
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/60 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover/stories:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 -ml-2"
                            onClick={() => scrollStories('left')}
                         >
                            <ChevronLeft size={28} />
                         </button>
                         <button 
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/60 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover/stories:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 -mr-2"
                            onClick={() => scrollStories('right')}
                         >
                            <ChevronRight size={28} />
                         </button>

                         <div 
                            ref={storiesScrollRef}
                            className="flex gap-4 px-2 overflow-x-auto [&::-webkit-scrollbar]:hidden py-4 snap-x snap-mandatory"
                            style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)' }}
                         >
                             <div 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex-shrink-0 w-36 h-64 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer group hover:border-emerald-500 hover:bg-emerald-50/30 transition-all snap-start"
                             >
                                 <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-emerald-100 text-gray-400 group-hover:text-emerald-600 flex items-center justify-center mb-3 transition-colors shadow-sm">
                                     <Plus size={28} />
                                 </div>
                                 <span className="text-sm font-bold text-gray-500">Add Story</span>
                             </div>

                             {stories.map((story, i) => (
                                 <div 
                                    key={story.id} 
                                    className="flex-shrink-0 w-36 h-64 relative rounded-2xl overflow-hidden cursor-pointer group snap-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl ring-2 ring-transparent hover:ring-emerald-400"
                                    onClick={() => setActiveStoryIndex(i)}
                                 >
                                     <img 
                                        src={story.imageUrl} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        loading="lazy"
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/80"></div>
                                     
                                     {!story.viewed && (
                                         <div className="absolute inset-0 ring-4 ring-inset ring-emerald-500/80 rounded-2xl"></div>
                                     )}

                                     {i % 3 === 0 && (
                                         <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm animate-pulse">
                                             LIVE
                                         </div>
                                     )}

                                     <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-1">
                                         <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 p-0.5 overflow-hidden bg-black">
                                                <img src={story.user.avatarUrl} className="w-full h-full rounded-full object-cover"/>
                                            </div>
                                            <span className="text-xs font-bold text-white truncate drop-shadow-md">{story.user.username}</span>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                      </div>

                      <div className={`masonry-grid pb-24 animate-in fade-in duration-500 ${isCanvasMode ? 'gap-0 [&_img]:rounded-none [&_div]:rounded-none' : ''} transition-all duration-500`}>
                          {homePins.map(pin => (
                              <PinCard 
                                key={pin.id} 
                                pin={pin} 
                                onClick={handlePinClick} 
                                onSave={handleSavePin} 
                                onMoreLikeThis={handleMoreLikeThis} 
                                onStash={handleAddToStash} 
                                onTagClick={handleSearch}
                                onUserClick={handleUserClick}
                                boards={boards} 
                              />
                          ))}
                      </div>
                  </>
              );
      }
  };

  return (
    <div className={`min-h-screen text-gray-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 relative transition-colors duration-500 ${isCanvasMode ? 'bg-black text-white' : 'bg-white'}`}>
      <Header 
        onSearch={handleSearch} 
        onVisualSearch={handleVisualSearch}
        onHomeClick={() => { navigateTo(ViewState.HOME); setCurrentQuery(""); setVisualSearchImage(null); }}
        onProfileClick={() => navigateTo(ViewState.PROFILE)}
        currentQuery={currentQuery}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < historyStack.length - 1}
        onBack={goBack}
        onForward={goForward}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />
      
      {viewState === ViewState.HOME && (
          <div className="w-full z-40 flex justify-center pointer-events-none mt-2">
             <div className="w-full max-w-[1920px] px-4 relative pointer-events-auto group/nav">
                
                <button 
                    onClick={() => scrollCategories('left')}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all active:scale-95 opacity-0 group-hover/nav:opacity-100"
                >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>

                <button 
                    onClick={() => scrollCategories('right')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all active:scale-95 opacity-0 group-hover/nav:opacity-100"
                >
                    <ChevronRight size={24} strokeWidth={2.5} />
                </button>

                <div 
                    ref={categoryScrollRef}
                    className="flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden px-2 py-3 scroll-smooth mask-linear-fade"
                    style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)' }}
                >
                    <button 
                        className={`px-6 py-3.5 rounded-full font-black text-sm whitespace-nowrap transition-all duration-300 backdrop-blur-md shadow-lg flex-shrink-0 flex items-center gap-2
                             ${activeCategory === "For You" ? 'bg-black text-white scale-105' : 'bg-white/80 text-gray-700 hover:bg-white hover:scale-105'}`}
                        onClick={() => setActiveCategory("For You")}
                    >
                        <Sparkles size={16} className={activeCategory === "For You" ? "text-yellow-400 fill-yellow-400" : ""} /> For You
                    </button>
                    {DEFAULT_TOPICS.map((cat, i) => (
                        <button 
                            key={i}
                            onClick={() => { setActiveCategory(cat); handleSearch(cat); }}
                            className={`px-6 py-3.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 backdrop-blur-md shadow-sm border border-transparent flex-shrink-0
                                ${activeCategory === cat 
                                    ? 'bg-emerald-500 text-white shadow-emerald-200/50 shadow-lg transform scale-105' 
                                    : 'bg-white/90 hover:bg-white text-gray-600 hover:text-black hover:shadow-md'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
             </div>
          </div>
      )}
      
      <main className={`px-4 max-w-[1920px] mx-auto min-h-screen transition-all duration-500 pt-4`}>
        {renderContent()}
      </main>

      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-gray-200 shadow-[0_-10px_60px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-in-out ${showStash ? 'translate-y-0' : 'translate-y-full'}`}>
          <div 
             className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-3 rounded-t-3xl cursor-pointer flex items-center gap-3 font-bold shadow-2xl hover:pb-5 transition-all"
             onClick={() => setShowStash(!showStash)}
          >
              <Archive size={20} className="text-emerald-400" /> Stash ({stash.length})
          </div>
          
          <div className="p-8 h-72 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Idea Stash</h3>
                 <div className="flex gap-4">
                     <button className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors" onClick={() => setStash([])}>Clear All</button>
                     <button onClick={() => setShowStash(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                 </div>
             </div>
             
             {stash.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-3 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                     <Archive size={48} className="mb-4 opacity-20"/>
                     <p className="font-medium">Drop ideas here to organize later</p>
                 </div>
             ) : (
                 <div className="flex gap-6 overflow-x-auto pb-6 h-full scrollbar-thin px-2">
                     {stash.map((pin, i) => (
                         <div key={i} className="relative min-w-[140px] w-[140px] h-full rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                             <img src={pin.imageUrl} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             <button 
                                className="absolute top-2 right-2 bg-white p-1.5 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm"
                                onClick={() => setStash(stash.filter(p => p.id !== pin.id))}
                             >
                                 <X size={14} />
                             </button>
                         </div>
                     ))}
                 </div>
             )}
          </div>
      </div>

      <div 
        className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3"
        onMouseEnter={() => setShowCreativeDock(true)}
        onMouseLeave={() => setShowCreativeDock(false)}
      >
         
         <div className={`flex flex-col gap-3 items-end transition-all duration-300 ${showCreativeDock ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
             <button 
                className="p-4 bg-white rounded-full shadow-xl text-gray-800 hover:text-emerald-600 transition-all duration-300 flex items-center gap-3 pr-6 hover:scale-105"
                onClick={() => setIsSettingsOpen(true)}
             >
                <SettingsIcon size={22} />
                <span className="font-bold">Settings</span>
            </button>

            <button 
                className={`p-4 rounded-full shadow-xl transition-all duration-300 flex items-center gap-3 pr-6 hover:scale-105
                    ${isCanvasMode ? 'bg-black text-emerald-400 ring-2 ring-emerald-500' : 'bg-white text-gray-800'}`}
                onClick={() => setIsCanvasMode(!isCanvasMode)}
            >
                <Layers size={22} />
                <span className="font-bold">Canvas Mode</span>
            </button>

             <button 
                className="p-4 bg-white rounded-full shadow-xl text-gray-800 hover:text-purple-600 transition-all duration-300 flex items-center gap-3 pr-6 hover:scale-105"
                onClick={handleMagicShuffle}
             >
                <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
                <span className="font-bold">Magic Shuffle</span>
            </button>
         </div>

         <button 
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 z-50
                ${showCreativeDock ? 'bg-black text-white rotate-90' : 'bg-white text-black'}`}
         >
             <Zap size={28} className={showCreativeDock ? "text-yellow-400 fill-yellow-400" : ""} />
         </button>
      </div>

      {selectedPin && (
        <PinDetail 
          pin={selectedPin} 
          onClose={() => setSelectedPin(null)} 
          relatedPins={generateMockPins(10, selectedPin.tags[0])}
          boards={boards}
          onTagClick={handleSearch}
          onUserClick={handleUserClick}
        />
      )}

      {activeStoryIndex !== null && (
          <StoryViewer 
            initialIndex={activeStoryIndex}
            stories={stories}
            onClose={() => setActiveStoryIndex(null)}
            onUserClick={handleUserClick}
          />
      )}
      
      {isCreateModalOpen && (
          <CreateModal 
            onClose={() => setIsCreateModalOpen(false)}
            onCreatePin={handleCreatePin}
            onCreateStory={handleCreateStory}
            user={currentUser}
          />
      )}

      {isSettingsOpen && (
          <SettingsModal 
            user={currentUser} 
            onClose={() => setIsSettingsOpen(false)} 
          />
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
