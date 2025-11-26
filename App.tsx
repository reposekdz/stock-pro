
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
import { Loader2, AlertTriangle, Cookie } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_TOPICS = ["Eco Brutalism", "Neon Cyberpunk", "Sustainable Fashion", "Abstract 3D Art", "Forest Cabins"];

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

const generateMockBoards = (userId: string): Board[] => [
    {
        id: 'b1',
        title: 'Future Aesthetics',
        pins: [],
        isPrivate: true,
        collaborators: [{...generateMockUser(), role: 'owner'}],
        createdAt: new Date().toISOString()
    }
];

const generateMockPins = (count: number, topicSeed?: string): Pin[] => {
  return Array.from({ length: count }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      title: topicSeed || "Design",
      description: "A curated pin.",
      imageUrl: `https://picsum.photos/seed/${i + Date.now()}/600/800`,
      type: 'image',
      width: 600,
      height: Math.random() > 0.5 ? 800 : 600,
      tags: ['design'],
      likes: Math.floor(Math.random() * 1000),
      author: generateMockUser()
  }));
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [historyStack, setHistoryStack] = useState<ViewState[]>([ViewState.HOME]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser] = useState<User>(generateMockUser());
  const [boards, setBoards] = useState<Board[]>(generateMockBoards(currentUser.id));
  const [homePins, setHomePins] = useState<Pin[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(true);

  useEffect(() => {
     setHomePins(generateMockPins(20));
  }, []);

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

  const renderContent = () => {
      switch (viewState) {
          case ViewState.HOME:
              return (
                  <div className="masonry-grid pb-24 px-4">
                      {homePins.map(pin => (
                          <PinCard 
                            key={pin.id} 
                            pin={pin} 
                            onClick={(p) => setSelectedPin(p)} 
                            onSave={() => {}} 
                            onMoreLikeThis={() => {}} 
                            onStash={() => {}} 
                            onTagClick={() => {}}
                            boards={boards} 
                          />
                      ))}
                  </div>
              );
          case ViewState.PROFILE:
              return <Profile user={currentUser} boards={boards} savedPins={[]} onCreateBoard={() => {}} onOpenBoard={(b) => { setSelectedBoard(b); navigateTo(ViewState.BOARD); }} onShowFollowers={() => {}} onShowFollowing={() => {}} />;
          case ViewState.BOARD:
              if(!selectedBoard) return <div>404 Board Not Found</div>;
              return <BoardDetail board={selectedBoard} pins={[]} allBoards={boards} onBack={goBack} onPinClick={() => {}} onInvite={() => {}} onMoreLikeThis={() => {}} onStash={() => {}} onTagClick={() => {}} />;
          default:
              return (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <AlertTriangle size={40} className="text-gray-400" />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 mb-2">Page Not Found</h2>
                      <p className="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
                      <button onClick={() => navigateTo(ViewState.HOME)} className="px-8 py-3 bg-black text-white rounded-full font-bold">Go Home</button>
                  </div>
              );
      }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {!isLoggedIn && <AuthModal onLogin={() => setIsLoggedIn(true)} onClose={() => {}} />}
      
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
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <main className="max-w-[1920px] mx-auto pt-4">
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

      {isCreateModalOpen && (
          <CreateModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onCreatePin={(pin) => setHomePins([pin, ...homePins])} 
            onCreateStory={() => {}} 
            user={currentUser} 
            boards={boards} 
          />
      )}

      {/* Cookie Consent */}
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
                   <button onClick={() => setShowCookieConsent(false)} className="flex-1 md:flex-none px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-900 transition shadow-lg">Accept</button>
               </div>
          </div>
      )}
    </div>
  );
};

export default App;
