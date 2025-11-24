
import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Video, Info, Image, Mic, Send, MoreVertical, ChevronLeft, CheckCheck, Smile, Paperclip, X, MicOff, VideoOff, PhoneOff, Sparkles, Layout } from 'lucide-react';
import { User, Conversation, Message } from '../types';

interface MessagesProps {
  currentUser: User;
  onClose: () => void;
}

// Mock Data Generator
const generateMockConversations = (currentUserId: string): Conversation[] => {
    const users = [
        { id: 'u2', username: 'Sarah_UX', avatarUrl: 'https://picsum.photos/seed/sarah/100/100', isOnline: true },
        { id: 'u3', username: 'Mike_Dev', avatarUrl: 'https://picsum.photos/seed/mike/100/100', isOnline: false },
        { id: 'u4', username: 'Jessica_Art', avatarUrl: 'https://picsum.photos/seed/jess/100/100', isOnline: true },
        { id: 'u5', username: 'David_Photo', avatarUrl: 'https://picsum.photos/seed/dave/100/100', isOnline: false },
    ];

    return users.map((u, i) => ({
        id: `conv-${u.id}`,
        user: { ...u, followers: 0, following: 0 }, // simplified
        lastMessage: i === 0 ? "That layout looks incredible! 🔥" : "Hey, did you see the new board?",
        lastMessageTime: i === 0 ? "2m" : `${i + 1}h`,
        unreadCount: i === 0 ? 2 : 0,
        isOnline: u.isOnline,
        messages: [
            { id: 'm1', senderId: u.id, text: "Hey! How's the project going?", timestamp: '10:00 AM', type: 'text', read: true },
            { id: 'm2', senderId: currentUserId, text: "Going great! Just finishing the UI.", timestamp: '10:05 AM', type: 'text', read: true },
            { id: 'm3', senderId: u.id, text: "That layout looks incredible! 🔥", timestamp: '10:07 AM', type: 'text', read: false },
        ]
    }));
};

export const Messages: React.FC<MessagesProps> = ({ currentUser, onClose }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  
  // Call State
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const activeConversation = conversations.find(c => c.id === selectedConvId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversations(generateMockConversations(currentUser.id));
  }, [currentUser.id]);

  useEffect(() => {
      if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [activeConversation?.messages]);

  const handleSendMessage = () => {
      if (!inputText.trim() || !selectedConvId) return;
      
      const newMessage: Message = {
          id: `new-${Date.now()}`,
          senderId: currentUser.id,
          text: inputText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          read: false
      };

      setConversations(prev => prev.map(c => {
          if (c.id === selectedConvId) {
              return {
                  ...c,
                  messages: [...c.messages, newMessage],
                  lastMessage: inputText,
                  lastMessageTime: 'Now'
              };
          }
          return c;
      }));
      setInputText("");
  };

  const startCall = (type: 'audio' | 'video') => {
      setCallType(type);
      setCallStatus('ringing');
      setTimeout(() => setCallStatus('connected'), 2500); // Simulate connection
  };

  const endCall = () => {
      setCallStatus('idle');
      setIsMuted(false);
      setIsVideoOff(false);
  };

  // Smart Replies Simulation
  const smartReplies = ["Sounds good! 👍", "Can you share the link?", "Love it! ❤️"];

  return (
    <div className="fixed inset-0 z-[150] bg-white flex animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sidebar List */}
      <div className={`w-full md:w-96 border-r border-gray-100 flex flex-col h-full bg-white ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-gray-50">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900">Messages</h2>
                  <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={20} /></button>
                      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full md:hidden"><X size={20}/></button>
                  </div>
              </div>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search conversations..." 
                    className="w-full bg-gray-100 text-gray-900 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                  <div 
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-4 flex gap-4 hover:bg-gray-50 cursor-pointer transition border-l-4 ${selectedConvId === conv.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent'}`}
                  >
                      <div className="relative">
                          <img src={conv.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                          {conv.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                              <h3 className={`text-sm font-bold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{conv.user.username}</h3>
                              <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                          </div>
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center self-center">
                              {conv.unreadCount}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Active Chat Area */}
      {activeConversation ? (
          <div className={`flex-1 flex flex-col h-full ${selectedConvId ? 'flex' : 'hidden md:flex'} relative`}>
              
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedConvId(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-full"><ChevronLeft/></button>
                      <div className="relative">
                          <img src={activeConversation.user.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                          {activeConversation.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>}
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-900">{activeConversation.user.username}</h3>
                          <span className="text-xs text-emerald-600 font-medium">{activeConversation.isOnline ? 'Active now' : 'Offline'}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                      <button onClick={() => startCall('audio')} className="p-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition"><Phone size={20}/></button>
                      <button onClick={() => startCall('video')} className="p-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition"><Video size={20}/></button>
                      <button onClick={() => setShowDetails(!showDetails)} className={`p-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition ${showDetails ? 'bg-emerald-50 text-emerald-600' : ''}`}><Info size={20}/></button>
                  </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                  <div className="text-center text-xs text-gray-400 my-4 uppercase tracking-widest font-bold">Today</div>
                  {activeConversation.messages.map(msg => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                          <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                              {!isMe && <img src={activeConversation.user.avatarUrl} className="w-8 h-8 rounded-full self-end mb-1" />}
                              <div className={`max-w-[70%] group`}>
                                  <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm 
                                    ${isMe 
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none' 
                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                                      {msg.text}
                                  </div>
                                  <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${isMe ? 'justify-end' : ''}`}>
                                      <span>{msg.timestamp}</span>
                                      {isMe && (
                                          msg.read ? <CheckCheck size={12} className="text-emerald-500"/> : <CheckCheck size={12}/>
                                      )}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                  {/* Smart Suggestions */}
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                      {smartReplies.map((reply, i) => (
                          <button 
                            key={i}
                            onClick={() => setInputText(reply)}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full hover:bg-emerald-100 transition whitespace-nowrap flex items-center gap-1"
                          >
                             <Sparkles size={10} /> {reply}
                          </button>
                      ))}
                  </div>

                  <div className="flex items-end gap-3">
                      <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition"><Layout size={20}/></button>
                      <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition"><Image size={20}/></button>
                      <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500 transition">
                          <input 
                            type="text" 
                            className="flex-1 bg-transparent outline-none py-2 text-sm font-medium max-h-32 overflow-y-auto"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                          />
                          <button className="p-2 text-gray-400 hover:text-gray-600"><Smile size={20}/></button>
                      </div>
                      {inputText ? (
                           <button onClick={handleSendMessage} className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition shadow-lg active:scale-90"><Send size={20}/></button>
                      ) : (
                           <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition"><Mic size={20}/></button>
                      )}
                  </div>
              </div>

              {/* Call Overlay */}
              {callStatus !== 'idle' && (
                  <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
                      
                      {/* Background Ambience */}
                      <div className="absolute inset-0 overflow-hidden opacity-20">
                          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[128px] animate-pulse"></div>
                          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px] animate-pulse delay-700"></div>
                      </div>

                      <div className="z-10 flex flex-col items-center w-full max-w-md">
                          <div className="relative mb-8">
                             <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl ${callStatus === 'ringing' ? 'animate-bounce' : ''}`}>
                                 <img src={activeConversation.user.avatarUrl} className="w-full h-full object-cover" />
                             </div>
                             {callStatus === 'connected' && callType === 'video' && !isVideoOff && (
                                 <div className="absolute -right-4 -bottom-4 w-24 h-32 bg-black rounded-xl border-2 border-white/20 overflow-hidden shadow-xl">
                                     {/* Self View Mock */}
                                     <img src={currentUser.avatarUrl} className="w-full h-full object-cover opacity-80" />
                                 </div>
                             )}
                          </div>
                          
                          <h2 className="text-3xl font-black mb-2">{activeConversation.user.username}</h2>
                          <p className="text-emerald-400 font-medium mb-12 animate-pulse">
                              {callStatus === 'ringing' ? 'Calling...' : (callType === 'video' ? 'Stoc Video HD' : 'Stoc Audio')}
                          </p>

                          <div className="flex items-center gap-6">
                              <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-4 rounded-full transition ${isMuted ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
                              >
                                  {isMuted ? <MicOff size={24}/> : <Mic size={24}/>}
                              </button>
                              
                              <button 
                                onClick={endCall}
                                className="p-6 bg-red-500 rounded-full shadow-lg shadow-red-500/50 hover:bg-red-600 hover:scale-110 transition active:scale-95"
                              >
                                  <PhoneOff size={32} fill="currentColor" />
                              </button>

                              {callType === 'video' && (
                                <button 
                                    onClick={() => setIsVideoOff(!isVideoOff)}
                                    className={`p-4 rounded-full transition ${isVideoOff ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
                                >
                                    {isVideoOff ? <VideoOff size={24}/> : <Video size={24}/>}
                                </button>
                              )}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 text-gray-400">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Send size={32} className="ml-2"/>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your Messages</h3>
              <p className="max-w-xs text-center mt-2">Send private photos, messages, and share your favorite pins directly.</p>
          </div>
      )}

      {/* Details Sidebar */}
      {showDetails && activeConversation && (
          <div className="w-80 border-l border-gray-100 bg-white hidden xl:flex flex-col animate-in slide-in-from-right">
              <div className="p-6 flex flex-col items-center border-b border-gray-100">
                  <img src={activeConversation.user.avatarUrl} className="w-24 h-24 rounded-full mb-4 border-4 border-gray-50" />
                  <h3 className="text-xl font-bold text-gray-900">{activeConversation.user.username}</h3>
                  <p className="text-gray-500 text-sm">@{activeConversation.user.username}</p>
                  
                  <div className="flex gap-3 mt-6 w-full">
                      <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-xs transition">View Profile</button>
                      <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"><MoreVertical size={16}/></button>
                  </div>
              </div>
              <div className="p-6">
                  <h4 className="font-bold text-sm text-gray-900 mb-4">Shared Media</h4>
                  <div className="grid grid-cols-3 gap-2">
                      {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80">
                              <img src={`https://picsum.photos/seed/shared${i}/100/100`} className="w-full h-full object-cover" />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
