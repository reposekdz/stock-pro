import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PinCard } from './components/PinCard';
import { PinDetail } from './components/PinDetail';
import { Profile } from './components/Profile';
import { BoardDetail } from './components/BoardDetail';
import { Pin, User, Board, ViewState, Filter } from './types';
import { generatePinDetails, getPersonalizedTopics } from './services/geminiService';
import { Wand2, Plus, SlidersHorizontal, ArrowUp, ScanLine, Loader2, Archive, X, ArrowRight } from 'lucide-react';

const DEFAULT_TOPICS = [
  "Eco Brutalism", "Neon Cyberpunk", "Sustainable Fashion", "Parametric Architecture", 
  "Abstract 3D Art", "Forest Cabins", "Ceramic Design", "Swiss Typography",
  "Streetwear 2025", "Cozy Lofts", "Futuristic UI/UX", "Matcha Aesthetic", "Plant Based",
  "Solar Punk", "DIY Tech", "Tattoo Art", "Glassmorphism"
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
                                      <PinCard key={pin.id} pin={pin} onClick={handlePinClick} onSave={handleSavePin} onMoreLikeThis={handleMoreLikeThis} onStash={handleAddToStash} boards={boards} />
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
                            <PinCard key={pin.id} pin={pin} onClick={handlePinClick} onSave={handleSavePin} onMoreLikeThis={handleMoreLikeThis} onStash={handleAddToStash} boards={boards} />
                        ))}
                    </div>
                  </>
              );

          case ViewState.HOME:
          default:
              return (
                  <div className="masonry-grid pb-24 animate-in fade-in duration-500">
                      {homePins.map(pin => (
                          <PinCard key={pin.id} pin={pin} onClick={handlePinClick} onSave={handleSavePin} onMoreLikeThis={handleMoreLikeThis} onStash={handleAddToStash} boards={boards} />
                      ))}
                  </div>
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
      
      {/* Category Navigation Bar - Floating below header */}
      {viewState === ViewState.HOME && (
          <div className="fixed top-[84px] left-0 right-0 z-40 py-3 transition-all">
             <div className="flex items-center gap-2 overflow-x-auto px-4 scrollbar-hide max-w-[1920px] mx-auto">
                {["For You", ...DEFAULT_TOPICS.slice(0, 10)].map((cat, i) => (
                    <button 
                        key={i}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 backdrop-blur-md border border-white/20 shadow-sm
                            ${activeCategory === cat 
                                ? 'bg-black text-white transform scale-105' 
                                : 'bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                    >
                        {cat}
                    </button>
                ))}
             </div>
          </div>
      )}
      
      <main className={`px-4 max-w-[1920px] mx-auto min-h-screen ${viewState === ViewState.HOME ? 'pt-48' : 'pt-32'}`}>
        {renderContent()}
      </main>

      {/* Innovation: STASH DRAWER */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out ${showStash ? 'translate-y-0' : 'translate-y-full'}`}>
          <div 
             className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-t-2xl cursor-pointer flex items-center gap-2 font-bold shadow-lg"
             onClick={() => setShowStash(!showStash)}
          >
              <Archive size={18} /> Stash ({stash.length})
          </div>
          
          {/* Drawer Content */}
          <div className="p-6 h-64 flex flex-col">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-gray-900">Idea Stash</h3>
                 <div className="flex gap-2">
                     <button className="text-sm text-gray-500 hover:text-red-500" onClick={() => setStash([])}>Clear All</button>
                     <button onClick={() => setShowStash(false)}><X size={24}/></button>
                 </div>
             </div>
             
             {stash.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                     <Archive size={48} className="mb-2 opacity-20"/>
                     <p>Drop ideas here to organize later</p>
                 </div>
             ) : (
                 <div className="flex gap-4 overflow-x-auto pb-4 h-full scrollbar-thin">
                     {stash.map((pin, i) => (
                         <div key={i} className="relative min-w-[120px] w-[120px] h-full rounded-xl overflow-hidden group">
                             <img src={pin.imageUrl} className="w-full h-full object-cover" />
                             <button 
                                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-red-500 hover:text-white transition"
                                onClick={() => setStash(stash.filter(p => p.id !== pin.id))}
                             >
                                 <X size={12} />
                             </button>
                         </div>
                     ))}
                     {/* Quick Action Card */}
                     <div className="min-w-[120px] bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition">
                         <div className="p-2 bg-white rounded-full shadow-sm">
                            <ArrowRight size={20} />
                         </div>
                         <span className="text-xs font-bold">Move to Board</span>
                     </div>
                 </div>
             )}
          </div>
      </div>

      {/* Floating Action Button - Refresh Feed */}
      <div className={`fixed bottom-8 right-8 z-40 flex flex-col gap-4 items-end transition-transform duration-300 ${showStash ? '-translate-y-64' : 'translate-y-0'}`}>
         <button 
            className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 hover:rotate-90 transition-all duration-500 group"
            onClick={() => loadPersonalizedFeed()}
            title="Refresh Feed"
         >
             <Wand2 size={28} className="group-hover:text-lime-200" />
         </button>
      </div>

      {selectedPin && (
        <PinDetail 
          pin={selectedPin} 
          onClose={() => setSelectedPin(null)} 
          relatedPins={generateMockPins(10, selectedPin.tags[0])}
          boards={boards}
        />
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;