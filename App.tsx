import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PinCard } from './components/PinCard';
import { PinDetail } from './components/PinDetail';
import { Profile } from './components/Profile';
import { BoardDetail } from './components/BoardDetail';
import { Pin, User, Board, ViewState, Filter } from './types';
import { generatePinDetails, getPersonalizedTopics } from './services/geminiService';
import { Wand2, Plus, SlidersHorizontal, ArrowUp, ScanLine, Loader2, Archive, X, ArrowRight, Zap, Play, ChevronLeft, ChevronRight, Palette, Layout, Sparkles } from 'lucide-react';

const DEFAULT_TOPICS = [
  "Eco Brutalism", "Neon Cyberpunk", "Sustainable Fashion", "Parametric Architecture", 
  "Abstract 3D Art", "Forest Cabins", "Ceramic Design", "Swiss Typography",
  "Streetwear 2025", "Cozy Lofts", "Futuristic UI/UX", "Matcha Aesthetic", "Plant Based",
  "Solar Punk", "DIY Tech", "Tattoo Art", "Glassmorphism", "Retro Anime", "Vaporwave", "Minimalist Setup"
];

// Mock Data Generators
const generateMockUser = (): User => ({
    id: 'current-user',
    username: 'DesignPro',
    avatarUrl: 'https://picsum.photos/seed/userPro/100/100',
    followers: 8420,
    following: 345
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
        following: Math.floor(Math.random() * 500)
      }
    };
  });
};

const App: React.FC = () => {
  // --- View State & History Management (Custom Stack) ---
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

  // --- Core Data State ---
  const [currentUser] = useState<User>(generateMockUser());
  const [boards, setBoards] = useState<Board[]>(generateMockBoards(currentUser.id));
  const [homePins, setHomePins] = useState<Pin[]>([]);
  const [searchPins, setSearchPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [activeCategory, setActiveCategory] = useState("For You");
  
  // --- Search & Filters ---
  const [currentQuery, setCurrentQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

  // --- Visual Search ---
  const [visualSearchImage, setVisualSearchImage] = useState<string | null>(null);
  const [visualSearchScanning, setVisualSearchScanning] = useState(false);

  // --- Innovation: Stash Drawer ---
  const [stash, setStash] = useState<Pin[]>([]);
  const [showStash, setShowStash] = useState(false);
  const [isCanvasMode, setIsCanvasMode] = useState(false);

  // --- Navigation Scroll Refs ---
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const storiesScrollRef = useRef<HTMLDivElement>(null);

  // --- Personalization ---
  const [loading, setLoading] = useState(false);

  // Initialize Home Feed
  useEffect(() => {
    loadPersonalizedFeed();
  }, []); 

  const loadPersonalizedFeed = async () => {
      setLoading(true);
      try {
          await new Promise(r => setTimeout(r, 500)); // Smooth load
          const newPins = generateMockPins(30);
          setHomePins(newPins);
      } finally {
          setLoading(false);
      }
  };

  const handleSearch = async (query: string) => {
    navigateTo(ViewState.SEARCH);
    setCurrentQuery(query);
    setLoading(true);
    setIsSearching(true);
    
    // Simulate complex filtering
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
              
              // Simulate "Scanning" process
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

  // Innovation: More Like This Handler
  const handleMoreLikeThis = (pin: Pin) => {
      // Trigger a visual search based on tags
      const query = `More like ${pin.title}`;
      handleSearch(query);
  };

  // Innovation: Stash Handler
  const handleAddToStash = (pin: Pin) => {
      if (!stash.find(p => p.id === pin.id)) {
          setStash(prev => [...prev, pin]);
          setShowStash(true);
      }
  };

  // Navigation Scroll Logic
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

  // Content Renderer
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
                      {/* Scanning UI */}
                      <div className="relative w-full max-w-2xl aspect-[16/9] mb-12 rounded-[32px] overflow-hidden shadow-2xl group bg-black">
                          {visualSearchImage && <img src={visualSearchImage} className="w-full h-full object-contain opacity-80" />}
                          
                          {/* Scanning Overlay */}
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
                                  {/* Simulated Hotspots */}
                                  <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full animate-ping"></div>
                                  <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition">
                                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                  </div>
                                  <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition delay-100">
                                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                  </div>

                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                      We found similar styles
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Results */}
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
                      {/* Sparks / Stories - Modern Rectangular Cards */}
                      <div className="relative mb-12 group/stories">
                         {/* Navigation Buttons */}
                         <button 
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-xl rounded-full shadow-xl flex items-center justify-center text-gray-800 opacity-0 group-hover/stories:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 border border-white/20 -ml-4"
                            onClick={() => scrollStories('left')}
                         >
                            <ChevronLeft size={24} />
                         </button>
                         <button 
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-xl rounded-full shadow-xl flex items-center justify-center text-gray-800 opacity-0 group-hover/stories:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 border border-white/20 -mr-4"
                            onClick={() => scrollStories('right')}
                         >
                            <ChevronRight size={24} />
                         </button>

                         <div 
                            ref={storiesScrollRef}
                            className="flex gap-4 px-2 overflow-x-auto scrollbar-hide py-4 snap-x snap-mandatory"
                            style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}
                         >
                             {/* Add Spark Card */}
                             <div className="flex-shrink-0 w-32 h-56 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer group hover:border-emerald-500 hover:bg-emerald-50/50 transition-all snap-start">
                                 <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                                     <Plus size={24} />
                                 </div>
                                 <span className="text-sm font-bold text-gray-500">Add Story</span>
                             </div>

                             {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                 <div key={i} className="flex-shrink-0 w-32 h-56 relative rounded-2xl overflow-hidden cursor-pointer group snap-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                     <img 
                                        src={`https://picsum.photos/seed/spark${i}/300/600`} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        loading="lazy"
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/80"></div>
                                     
                                     {/* Live/New Badge */}
                                     {i % 3 === 0 && (
                                         <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur text-white text-[10px] font-black px-2 py-1 rounded-md border border-white/20 animate-pulse">
                                             LIVE
                                         </div>
                                     )}

                                     <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                                         <div className="w-8 h-8 rounded-full border-2 border-white p-0.5 overflow-hidden bg-black">
                                            <img src={`https://picsum.photos/seed/user${i}/100/100`} className="w-full h-full rounded-full object-cover"/>
                                         </div>
                                         <span className="text-xs font-bold text-white truncate text-shadow">Creator_{i}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                      </div>

                      <div className={`masonry-grid pb-24 animate-in fade-in duration-500 ${isCanvasMode ? 'opacity-50 blur-sm scale-95 pointer-events-none' : ''}`}>
                          {homePins.map(pin => (
                              <PinCard 
                                key={pin.id} 
                                pin={pin} 
                                onClick={handlePinClick} 
                                onSave={handleSavePin} 
                                onMoreLikeThis={handleMoreLikeThis} 
                                onStash={handleAddToStash} 
                                onTagClick={handleSearch}
                                boards={boards} 
                              />
                          ))}
                      </div>
                  </>
              );
      }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 relative">
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
      />
      
      {/* Advanced Carousel Category Navigation - Floating below header */}
      {viewState === ViewState.HOME && (
          <div className="fixed top-[88px] left-0 right-0 z-40 py-2 group/nav">
             <div className="max-w-[1920px] mx-auto px-4 relative">
                
                {/* Left Fade & Button */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <button 
                    onClick={() => scrollCategories('left')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/40 flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all active:scale-95 opacity-0 group-hover/nav:opacity-100"
                >
                    <ChevronLeft size={20} strokeWidth={3} />
                </button>

                {/* Scroll Container */}
                <div 
                    ref={categoryScrollRef}
                    className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-4 py-2 scroll-smooth"
                >
                    <button 
                        className="px-6 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all duration-300 backdrop-blur-md shadow-lg border border-black/5 flex-shrink-0 bg-black text-white hover:scale-105 active:scale-95 flex items-center gap-2"
                        onClick={() => setActiveCategory("For You")}
                    >
                        <Sparkles size={14} className="text-yellow-300 fill-yellow-300" /> For You
                    </button>
                    {DEFAULT_TOPICS.map((cat, i) => (
                        <button 
                            key={i}
                            onClick={() => { setActiveCategory(cat); handleSearch(cat); }}
                            className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 backdrop-blur-md shadow-sm border border-gray-100 flex-shrink-0
                                ${activeCategory === cat 
                                    ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg transform scale-105' 
                                    : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-emerald-700 hover:shadow-md'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Right Fade & Button */}
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                <button 
                    onClick={() => scrollCategories('right')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/40 flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all active:scale-95 opacity-0 group-hover/nav:opacity-100"
                >
                    <ChevronRight size={20} strokeWidth={3} />
                </button>
             </div>
          </div>
      )}
      
      <main className={`px-4 max-w-[1920px] mx-auto min-h-screen transition-all duration-500 ${viewState === ViewState.HOME ? 'pt-52' : 'pt-36'}`}>
        {renderContent()}
      </main>

      {/* Innovation: STASH DRAWER */}
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
                     <div className="min-w-[140px] bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition border-2 border-dashed border-gray-300 hover:border-emerald-300">
                         <div className="p-3 bg-white rounded-full shadow-sm">
                            <ArrowRight size={24} />
                         </div>
                         <span className="text-xs font-bold uppercase tracking-wider">Move to Board</span>
                     </div>
                 </div>
             )}
          </div>
      </div>

      {/* Innovation: CREATIVE STUDIO DOCK (Replaces simple refresh) */}
      <div className={`fixed bottom-8 right-8 z-40 flex flex-col gap-4 items-end transition-transform duration-500 ${showStash ? '-translate-y-80' : 'translate-y-0'}`}>
         
         {/* Action Buttons */}
         <div className="flex flex-col gap-3 items-end">
            <button 
                className={`p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-3 pr-5 hover:pr-6 group
                    ${isCanvasMode ? 'bg-black text-emerald-400' : 'bg-white text-gray-700 hover:text-black'}`}
                onClick={() => setIsCanvasMode(!isCanvasMode)}
                title="Canvas Mode"
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCanvasMode ? 'bg-emerald-500/20' : 'bg-gray-100 group-hover:bg-emerald-100'}`}>
                    <Layout size={20} />
                </div>
                <span className="font-bold text-sm hidden group-hover:block animate-in slide-in-from-right-2">Canvas</span>
            </button>

             <button 
                className="p-3 bg-white rounded-full shadow-lg text-gray-700 hover:text-purple-600 transition-all duration-300 flex items-center gap-3 pr-5 hover:pr-6 group"
                title="Color DNA"
                onClick={() => alert("Extracting Palette from View...")}
             >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center">
                    <Palette size={20} />
                </div>
                <span className="font-bold text-sm hidden group-hover:block animate-in slide-in-from-right-2">Palette</span>
            </button>
         </div>

         {/* Main Magic Button */}
         <button 
            className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center text-white shadow-2xl hover:scale-105 hover:rotate-3 transition-all duration-500 group relative overflow-hidden"
            onClick={() => loadPersonalizedFeed()}
            title="Magic Shuffle"
         >
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <Zap size={32} className="relative z-10 group-hover:animate-[spin_1s_ease-in-out] fill-yellow-400 text-yellow-400" />
         </button>
      </div>

      {selectedPin && (
        <PinDetail 
          pin={selectedPin} 
          onClose={() => setSelectedPin(null)} 
          relatedPins={generateMockPins(10, selectedPin.tags[0])}
          boards={boards}
          onTagClick={handleSearch}
        />
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shine {
            0% { transform: translateX(-100%); }
            20% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
        }
        .text-shadow {
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  );
};

export default App;