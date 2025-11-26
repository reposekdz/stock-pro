
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
import { CreateBoardModal } from './components/CreateBoardModal';
import { UserListModal } from './components/UserListModal';
import { Messages } from './components/Messages';
import { MonetizationDashboard } from './components/MonetizationDashboard'; 
import { AuthModal } from './components/AuthModal';
import { Onboarding } from './components/Onboarding';
import { Pin, User, Board, ViewState, Story, PinSlide, Product } from './types';
import { generatePinDetails } from './services/geminiService';
import { Loader2, AlertTriangle, Cookie, Plus, SlidersHorizontal, CheckSquare, Trash2, FolderPlus, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_TOPICS = ["For You", "Today", "Following", "Health", "Decor", "Art", "Tech", "Travel", "Food", "Fashion", "DIY", "Beauty", "Cars", "Music", "Photography", "Architecture", "Gaming", "Quotes", "Education"];

const MOCK_PRODUCTS_LIST: Product[] = [
    { id: 'p1', name: 'Ceramic Vase', price: 45, currency: '$', imageUrl: 'https://picsum.photos/seed/vase/100/100', affiliateLink: '#' }
];

const generateMockUser = (): User => ({
    id: 'current-user',
    username: 'DesignPro',
    avatarUrl: 'https://picsum.photos/seed/userPro/100/100',
    followers: 8420,
    following: 345,
    bio: 'Curating the future of design.',
    coverUrl: 'https://picsum.photos/seed/myCover/1600/400',
    isCreator: true
});

const generateMockUsersList = (count: number): User[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `u-${i}`,
        username: `User_${i + 1}`,
        avatarUrl: `https://picsum.photos/seed/u${i}/100/100`,
        followers: Math.floor(Math.random() * 5000),
        following: Math.floor(Math.random() * 500),
        bio: Math.random() > 0.5 ? 'Digital Artist & Creator' : 'Lifestyle Blogger',
        isCreator: Math.random() > 0.7
    }));
};

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
        title: 'Living Room',
        pins: [],
        isPrivate: false,
        collaborators: [{...generateMockUser(), role: 'owner'}],
        createdAt: new Date().toISOString()
    }
];

const generateMockPins = (count: number, topicSeed?: string): Pin[] => {
  return Array.from({ length: count }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      title: topicSeed || "Design Idea " + (i + 1),
      description: "A curated pin.",
      imageUrl: `https://picsum.photos/seed/${i + Date.now()}/600/${Math.floor(Math.random() * 400 + 400)}`, // Varying heights
      type: Math.random() > 0.8 ? 'video' : 'image', // Add some video pins
      width: 600,
      height: Math.floor(Math.random() * 400 + 400),
      tags: ['design'],
      likes: Math.floor(Math.random() * 1000),
      author: generateMockUser(),
      // Mock video URL for video pins
      videoUrl: 'https://cdn.pixabay.com/video/2024/02/09/199958-911694865_large.mp4' 
  }));
};

const generateMockStories = (count: number): Story[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `story-${i}`,
        user: { ...generateMockUser(), username: `User_${i}`, avatarUrl: `https://picsum.photos/seed/user${i}/100/100` },
        imageUrl: `https://picsum.photos/seed/story${i}/450/800`,
        timestamp: `${i + 1}h`,
        viewed: i > 2,
        duration: 5,
        isExclusive: false
    }));
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [historyStack, setHistoryStack] = useState<ViewState[]>([ViewState.HOME]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showAuthModal, setShowAuthModal] = useState(false); // Default to false allow browsing
  const [currentUser] = useState<User>(generateMockUser());
  const [boards, setBoards] = useState<Board[]>(generateMockBoards(currentUser.id));
  const [homePins, setHomePins] = useState<Pin[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Advanced Filtering & Organizing State
  const [activeTopic, setActiveTopic] = useState("For You");
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [selectedPinIds, setSelectedPinIds] = useState<Set<string>>(new Set());

  // User List Modal State
  const [userListConfig, setUserListConfig] = useState<{isOpen: boolean, type: 'followers' | 'following', user?: User, userList: User[]}>({ 
      isOpen: false, 
      type: 'followers', 
      userList: [] 
  });

  // Scroll Refs for Custom Navigation
  const storiesRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     setHomePins(generateMockPins(30));
     setStories(generateMockStories(12));
  }, []);

  const navigateTo = (newState: ViewState) => {
      if (!isLoggedIn && (newState === ViewState.PROFILE || newState === ViewState.MESSAGES)) {
          setShowAuthModal(true);
          return;
      }
      const newHistory = historyStack.slice(0, historyIndex + 1);
      newHistory.push(newState);
      setHistoryStack(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setViewState(newState);
      setIsOrganizing(false); // Reset organize mode on nav
      setSelectedPinIds(new Set());
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

  const handleCreateClick = () => {
      if (!isLoggedIn) {
          setShowAuthModal(true);
          return;
      }
      setIsCreateModalOpen(true);
  };

  const handleShowFollowers = (u: User) => {
      setUserListConfig({
          isOpen: true,
          type: 'followers',
          user: u,
          userList: generateMockUsersList(15)
      });
  };

  const handleShowFollowing = (u: User) => {
      setUserListConfig({
          isOpen: true,
          type: 'following',
          user: u,
          userList: generateMockUsersList(8)
      });
  };

  const togglePinSelection = (pinId: string) => {
      const newSet = new Set(selectedPinIds);
      if (newSet.has(pinId)) {
          newSet.delete(pinId);
      } else {
          newSet.add(pinId);
      }
      setSelectedPinIds(newSet);
  };

  const handleBatchAction = (action: 'save' | 'hide' | 'delete') => {
      // Mock Action
      console.log(`Performing ${action} on ${selectedPinIds.size} pins`);
      setIsOrganizing(false);
      setSelectedPinIds(new Set());
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#34D399']
      });
  };

  const getFilteredPins = () => {
      return homePins.filter(pin => {
          if (filterType === 'video' && pin.type !== 'video') return false;
          if (filterType === 'image' && pin.type !== 'image') return false;
          // In a real app, topic filtering would happen via API or complex matching
          return true;
      });
  };

  // Scroll Helpers
  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
      if (ref.current) {
          const scrollAmount = direction === 'left' ? -300 : 300;
          ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  const renderContent = () => {
      switch (viewState) {
          case ViewState.HOME:
              return (
                  <div>
                      {/* Sticky Topic & Filter Bar */}
                      <div className="sticky top-[88px] bg-white/95 backdrop-blur-md z-40 py-2 mb-2 border-b border-gray-100 flex items-center justify-between gap-4 px-4 shadow-sm transition-all group/topics">
                           {/* Left Nav Button */}
                           <button 
                                onClick={() => scrollContainer(topicsRef, 'left')}
                                className="absolute left-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-gray-100 flex items-center justify-center hover:bg-white text-gray-700 opacity-0 group-hover/topics:opacity-100 transition-opacity"
                           >
                               <ChevronLeft size={16} />
                           </button>

                           <div 
                                ref={topicsRef}
                                className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 px-6 scroll-smooth"
                           >
                               {DEFAULT_TOPICS.map(topic => (
                                   <button 
                                      key={topic}
                                      onClick={() => setActiveTopic(topic)}
                                      className={`whitespace-nowrap px-4 py-2.5 rounded-full font-bold text-sm transition ${activeTopic === topic ? 'bg-black text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-transparent hover:border-gray-200'}`}
                                   >
                                       {topic}
                                   </button>
                               ))}
                           </div>

                           {/* Right Nav Button */}
                           <button 
                                onClick={() => scrollContainer(topicsRef, 'right')}
                                className="absolute right-36 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-gray-100 flex items-center justify-center hover:bg-white text-gray-700 opacity-0 group-hover/topics:opacity-100 transition-opacity"
                           >
                               <ChevronRight size={16} />
                           </button>

                           <div className="flex items-center gap-2 pl-2 border-l border-gray-200 bg-white relative z-20">
                               <button 
                                  onClick={() => setIsOrganizing(!isOrganizing)}
                                  className={`p-2.5 rounded-full transition ${isOrganizing ? 'bg-black text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                  title="Organize"
                               >
                                   <CheckSquare size={20} />
                               </button>
                               <button 
                                  onClick={() => setFilterType(filterType === 'all' ? 'video' : filterType === 'video' ? 'image' : 'all')}
                                  className="p-2.5 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-full transition flex items-center gap-2"
                                  title="Filter"
                               >
                                   <SlidersHorizontal size={20} />
                               </button>
                           </div>
                      </div>

                      {/* Stories Rail - Custom Nav */}
                      {!isOrganizing && (
                          <div className="relative group/stories px-4 mb-4 z-10">
                              {/* Left Nav */}
                              <button 
                                  onClick={() => scrollContainer(storiesRef, 'left')}
                                  className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl shadow-lg border border-gray-100 flex items-center justify-center hover:bg-white text-gray-900 opacity-0 group-hover/stories:opacity-100 transition-all duration-300 hover:scale-110"
                              >
                                  <ChevronLeft size={24} />
                              </button>

                              <div 
                                  ref={storiesRef}
                                  className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide scroll-smooth"
                              >
                                  {/* Create Story Card */}
                                  <div 
                                      className="relative flex-shrink-0 w-24 h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition border border-gray-100" 
                                      onClick={handleCreateClick}
                                  >
                                       <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2 group-hover:bg-gray-100 transition">
                                           <div className="p-2 rounded-full bg-white border border-gray-200 shadow-sm group-hover:scale-110 transition">
                                                <Plus className="w-6 h-6 text-emerald-600" />
                                           </div>
                                           <span className="text-xs font-bold text-gray-900">Add Story</span>
                                       </div>
                                  </div>

                                  {stories.map((story, i) => (
                                      <div 
                                        key={story.id} 
                                        className="relative flex-shrink-0 w-24 h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
                                        onClick={() => setActiveStoryIndex(i)}
                                      >
                                          <img src={story.imageUrl} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                                          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60"></div>
                                          
                                          {/* User Avatar Overlay */}
                                          <div className={`absolute top-2 left-2 p-[2px] rounded-full ${story.viewed ? 'bg-white/50' : 'bg-emerald-500'}`}>
                                              <img src={story.user.avatarUrl} className="w-8 h-8 rounded-full border border-white" />
                                          </div>
                                          
                                          <span className="absolute bottom-2 left-2 text-white text-xs font-bold truncate w-20 shadow-black drop-shadow-md">
                                              {story.user.username}
                                          </span>
                                      </div>
                                  ))}
                              </div>

                              {/* Right Nav */}
                              <button 
                                  onClick={() => scrollContainer(storiesRef, 'right')}
                                  className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl shadow-lg border border-gray-100 flex items-center justify-center hover:bg-white text-gray-900 opacity-0 group-hover/stories:opacity-100 transition-all duration-300 hover:scale-110"
                              >
                                  <ChevronRight size={24} />
                              </button>
                          </div>
                      )}

                      {/* Main Grid - Reduced padding on mobile (px-2) to make images larger */}
                      <div className="masonry-grid pb-32 px-2 md:px-4 transition-all duration-300">
                          {getFilteredPins().map(pin => (
                              <PinCard 
                                key={pin.id} 
                                pin={pin} 
                                onClick={(p) => setSelectedPin(p)} 
                                onSave={() => { if(!isLoggedIn) setShowAuthModal(true); }} 
                                onMoreLikeThis={() => {}} 
                                onStash={() => { if(!isLoggedIn) setShowAuthModal(true); }} 
                                onTagClick={() => {}}
                                boards={boards} 
                                isSelectMode={isOrganizing}
                                isSelected={selectedPinIds.has(pin.id)}
                                onSelect={togglePinSelection}
                                isCreator={currentUser.isCreator && pin.author.id === currentUser.id}
                              />
                          ))}
                      </div>

                      {/* Batch Action Bar */}
                      {isOrganizing && selectedPinIds.size > 0 && (
                          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-6 py-3 rounded-full shadow-2xl border border-gray-100 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                               <span className="font-bold text-sm">{selectedPinIds.size} Selected</span>
                               <div className="h-6 w-px bg-gray-200"></div>
                               <div className="flex items-center gap-2">
                                   <button onClick={() => handleBatchAction('save')} className="p-3 hover:bg-gray-100 rounded-full text-red-600 transition" title="Save to Board"><FolderPlus size={20}/></button>
                                   <button onClick={() => handleBatchAction('hide')} className="p-3 hover:bg-gray-100 rounded-full text-gray-600 transition" title="Hide Pins"><X size={20}/></button>
                                   <button onClick={() => handleBatchAction('delete')} className="p-3 hover:bg-gray-100 rounded-full text-gray-600 transition" title="Delete"><Trash2 size={20}/></button>
                               </div>
                               <button 
                                  onClick={() => { setIsOrganizing(false); setSelectedPinIds(new Set()); }}
                                  className="ml-2 px-4 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800"
                               >
                                   Done
                               </button>
                          </div>
                      )}
                  </div>
              );
          case ViewState.PROFILE:
              return <Profile 
                        user={currentUser} 
                        boards={boards} 
                        savedPins={[]} 
                        onCreateBoard={() => {}} 
                        onOpenBoard={(b) => { setSelectedBoard(b); navigateTo(ViewState.BOARD); }} 
                        onShowFollowers={handleShowFollowers} 
                        onShowFollowing={handleShowFollowing} 
                     />;
          case ViewState.BOARD:
              if(!selectedBoard) return <div>404 Board Not Found</div>;
              return <BoardDetail board={selectedBoard} pins={[]} allBoards={boards} onBack={goBack} onPinClick={() => {}} onInvite={() => {}} onMoreLikeThis={() => {}} onStash={() => {}} onTagClick={() => {}} />;
          case ViewState.MESSAGES:
              return <Messages currentUser={currentUser} onClose={() => navigateTo(ViewState.HOME)} onViewProfile={() => {}} />;
          case ViewState.USER_PROFILE:
             // Mock user for UserProfile view if we had navigation to it, passing handleShowFollowers
             return <UserProfile 
                 user={currentUser} 
                 pins={[]} 
                 onBack={goBack} 
                 onPinClick={() => {}} 
                 onShowFollowers={handleShowFollowers} 
                 onShowFollowing={handleShowFollowing} 
             />;
          default:
              return (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <AlertTriangle size={40} className="text-gray-400" />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 mb-2">Page Not Found</h2>
                      <p className="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
                      <button onClick={() => navigateTo(ViewState.HOME)} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold shadow-lg shadow-emerald-200 hover:scale-105 transition">Go Home</button>
                  </div>
              );
      }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {showAuthModal && (
        <AuthModal 
            onLogin={() => { 
                setIsLoggedIn(true); 
                setShowAuthModal(false); 
            }} 
            onClose={() => setShowAuthModal(false)} 
        />
      )}
      
      {/* Sticky Header Wrapper - High Z-Index to stay on top */}
      <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl">
          <Header 
            onSearch={() => {}} 
            onVisualSearch={() => {}}
            onHomeClick={() => navigateTo(ViewState.HOME)}
            onProfileClick={() => navigateTo(ViewState.PROFILE)}
            onMessagesClick={() => navigateTo(ViewState.MESSAGES)}
            onMonetizationClick={() => {}}
            canGoBack={historyIndex > 0}
            canGoForward={historyIndex < historyStack.length - 1}
            onBack={goBack}
            onForward={goForward}
            onCreateClick={handleCreateClick}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setShowAuthModal(true)}
          />
      </div>

      <main className="max-w-[1920px] mx-auto pt-0 relative">
          {renderContent()}
      </main>

      {selectedPin && (
        <PinDetail 
          pin={selectedPin} 
          onClose={() => setSelectedPin(null)} 
          relatedPins={generateMockPins(10)} 
          boards={boards} 
          onTagClick={() => {}} 
        />
      )}

      {activeStoryIndex !== null && (
          <StoryViewer 
            initialIndex={activeStoryIndex} 
            stories={stories} 
            onClose={() => setActiveStoryIndex(null)} 
          />
      )}

      {isCreateModalOpen && (
          <CreateModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onCreatePin={(pin) => setHomePins([pin, ...homePins])} 
            onCreateStory={(story) => setStories([story, ...stories])} 
            user={currentUser} 
            boards={boards} 
          />
      )}

      {userListConfig.isOpen && (
          <UserListModal 
              title={userListConfig.type === 'followers' ? 'Followers' : 'Following'}
              initialTab={userListConfig.type}
              users={userListConfig.userList}
              currentUser={currentUser}
              onClose={() => setUserListConfig({ ...userListConfig, isOpen: false })}
              onToggleFollow={() => {}} // Mock handle follow
          />
      )}

      {showCookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[200] flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-full">
               <div className="flex items-start gap-4 max-w-2xl">
                   <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 hidden md:block">
                       <Cookie size={24} />
                   </div>
                   <div>
                       <h4 className="font-bold text-gray-900">We use cookies to improve your experience.</h4>
                       <p className="text-sm text-gray-500">By using our site, you agree to our use of cookies to deliver personalized content and analyze site traffic.</p>
                   </div>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                   <button onClick={() => setShowCookieConsent(false)} className="flex-1 md:flex-none px-6 py-3 bg-gray-100 font-bold rounded-full hover:bg-gray-200 transition">Decline</button>
                   <button onClick={() => setShowCookieConsent(false)} className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full hover:shadow-lg hover:scale-105 transition shadow-emerald-200">Accept</button>
               </div>
          </div>
      )}
    </div>
  );
};

export default App;
