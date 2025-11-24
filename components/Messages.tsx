
import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Video, Info, Image, Mic, Send, MoreVertical, ChevronLeft, CheckCheck, Check, Clock, Smile, Paperclip, X, MicOff, VideoOff, PhoneOff, Sparkles, Layout, FileText, Play, Pause, Sticker, Reply, Pin as PinIcon, Download, Trash2, Heart, Users, Plus, BarChart2, Edit2, ArrowDown, Monitor, Grid, Minimize2, Star, Share2, UploadCloud } from 'lucide-react';
import { User, Conversation, Message, PollOption, MessageStatus } from '../types';

interface MessagesProps {
  currentUser: User;
  onClose: () => void;
  onViewProfile: (user: User) => void;
}

// --- Mock Data Generators ---
const generateMockConversations = (currentUserId: string): Conversation[] => {
    const users = [
        { id: 'u2', username: 'Sarah_UX', avatarUrl: 'https://picsum.photos/seed/sarah/100/100', isOnline: true },
        { id: 'u3', username: 'Mike_Dev', avatarUrl: 'https://picsum.photos/seed/mike/100/100', isOnline: false },
        { id: 'u4', username: 'Jessica_Art', avatarUrl: 'https://picsum.photos/seed/jess/100/100', isOnline: true },
    ];

    // 1-on-1 Chats
    const personalChats: Conversation[] = users.map((u, i) => ({
        id: `conv-${u.id}`,
        user: { ...u, followers: 850, following: 120, bio: 'Designer @ Stoc' },
        lastMessage: i === 0 ? "Sent a voice message" : "Hey, did you see the new board?",
        lastMessageTime: i === 0 ? "2m" : `${i + 1}h`,
        unreadCount: i === 0 ? 2 : 0,
        isOnline: u.isOnline,
        pinnedMessageId: i === 0 ? 'm-pin-1' : undefined,
        messages: [
            { id: 'm1', senderId: u.id, text: "Hey! How's the project going?", timestamp: '10:00 AM', type: 'text', read: true, status: 'read' },
            { id: 'm2', senderId: currentUserId, text: "Going great! Just finishing the UI.", timestamp: '10:05 AM', type: 'text', read: true, status: 'read' },
            { id: 'm-pin-1', senderId: u.id, text: "Here are the brand assets for the campaign.", timestamp: '10:06 AM', type: 'text', read: true, status: 'read', reactions: [{emoji: '🔥', count: 1, userReacted: true}] },
            { id: 'm3', senderId: u.id, timestamp: '10:07 AM', type: 'voice', duration: '0:14', read: false, status: 'delivered' },
        ]
    }));

    // Group Chat
    const groupChat: Conversation = {
        id: 'group-1',
        isGroup: true,
        groupName: 'Design Team 🚀',
        groupImage: 'https://picsum.photos/seed/designteam/100/100',
        participants: [
            { id: 'u2', username: 'Sarah_UX', avatarUrl: 'https://picsum.photos/seed/sarah/100/100', followers: 0, following: 0 },
            { id: 'u3', username: 'Mike_Dev', avatarUrl: 'https://picsum.photos/seed/mike/100/100', followers: 0, following: 0 },
            { id: currentUserId, username: 'Me', avatarUrl: '', followers: 0, following: 0 }
        ],
        admins: [currentUserId],
        user: { id: 'g1', username: 'Design Team', avatarUrl: '', followers: 0, following: 0 },
        lastMessage: 'Mike_Dev: created a poll',
        lastMessageTime: '10m',
        unreadCount: 5,
        isOnline: true,
        messages: [
             { id: 'sys-1', senderId: 'system', text: 'Group created by You', timestamp: '9:00 AM', type: 'system', read: true, status: 'read' },
             { id: 'gm-1', senderId: 'u2', text: 'Morning everyone! Ready for the sprint?', timestamp: '9:30 AM', type: 'text', read: true, status: 'read' },
             { id: 'gm-2', senderId: 'u3', text: 'Yep, coffee is brewing ☕', timestamp: '9:32 AM', type: 'text', read: true, status: 'read' },
             { 
                 id: 'poll-1', 
                 senderId: 'u3', 
                 type: 'poll', 
                 timestamp: '9:35 AM', 
                 read: true,
                 status: 'read',
                 poll: {
                     question: 'Where should we have lunch?',
                     totalVotes: 3,
                     options: [
                         { id: 'opt1', text: 'Sushi Place', votes: 2, voters: ['u2', 'u3'] },
                         { id: 'opt2', text: 'Tacos', votes: 1, voters: [currentUserId] },
                         { id: 'opt3', text: 'Salad Bar', votes: 0, voters: [] }
                     ],
                     userVotedOptionId: 'opt2'
                 }
             }
        ]
    };

    return [groupChat, ...personalChats];
};

const STICKERS = ['👻', '🔥', '✨', '💖', '🎉', '👀', '🚀', '💯', '🎨', '👋', '🤔', '😂'];
const SMART_REPLIES = ["Awesome!", "Thanks for sharing", "Can't wait!", "👀", "Got it"];

export const Messages: React.FC<MessagesProps> = ({ currentUser, onClose, onViewProfile }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Search State
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);

  // Group Creation State
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  
  // Input State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Call State
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const activeConversation = conversations.find(c => c.id === selectedConvId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordInterval = useRef<any>(null);
  const callInterval = useRef<any>(null);
  const typingTimeout = useRef<any>(null);

  useEffect(() => {
    setConversations(generateMockConversations(currentUser.id));
  }, [currentUser.id]);

  useEffect(() => {
      if (messagesEndRef.current && !chatSearchQuery) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Simulate typing when entering a chat
      if(activeConversation && !activeConversation.isGroup) {
          setTimeout(() => setIsTyping(true), 2000);
          setTimeout(() => setIsTyping(false), 5000);
      }
  }, [selectedConvId, activeConversation?.messages, isRecording, chatSearchQuery]);

  const updateMessageStatus = (convId: string, msgId: string, status: MessageStatus) => {
      setConversations(prev => prev.map(c => {
          if (c.id === convId) {
              return {
                  ...c,
                  messages: c.messages.map(m => m.id === msgId ? { ...m, status: status, read: status === 'read' } : m)
              };
          }
          return c;
      }));
  };

  const simulateMessageLifecycle = (convId: string, msgId: string) => {
      // Simulator: Sending -> Sent -> Delivered -> Read
      setTimeout(() => updateMessageStatus(convId, msgId, 'sent'), 1000);
      setTimeout(() => updateMessageStatus(convId, msgId, 'delivered'), 2500);
      setTimeout(() => updateMessageStatus(convId, msgId, 'read'), 4500);
  };

  const handleSendMessage = (type: Message['type'] = 'text', content?: string, extra?: Partial<Message>) => {
      if ((type === 'text' && !inputText.trim()) || !selectedConvId) return;
      
      if (editingMessageId) {
          // Update existing message
          setConversations(prev => prev.map(c => {
            if(c.id === selectedConvId) {
                return {
                    ...c,
                    messages: c.messages.map(m => m.id === editingMessageId ? { ...m, text: inputText, edited: true } : m)
                }
            }
            return c;
          }));
          setEditingMessageId(null);
          setInputText("");
          return;
      }

      const newMsgId = `new-${Date.now()}`;
      
      const newMessage: Message = {
          id: newMsgId,
          senderId: currentUser.id,
          text: type === 'text' ? inputText : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: type,
          read: false,
          status: 'sending',
          mediaUrl: content,
          replyTo: replyingTo ? {
              id: replyingTo.id,
              username: activeConversation?.isGroup 
                ? activeConversation.participants?.find(p => p.id === replyingTo.senderId)?.username || 'User'
                : activeConversation?.user.username || 'User',
              text: replyingTo.text || (replyingTo.type === 'voice' ? 'Voice Message' : replyingTo.type === 'image' ? 'Image' : 'Attachment'),
              type: replyingTo.type
          } : undefined,
          ...extra
      };

      setConversations(prev => prev.map(c => {
          if (c.id === selectedConvId) {
              return {
                  ...c,
                  messages: [...c.messages, newMessage],
                  lastMessage: type === 'text' ? inputText : `Sent a ${type}`,
                  lastMessageTime: 'Now'
              };
          }
          return c;
      }));
      
      simulateMessageLifecycle(selectedConvId, newMsgId);

      setInputText("");
      setReplyingTo(null);
      setShowStickerPicker(false);
      setShowAttachments(false);
      setShowPollCreator(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
  };

  const handleDeleteMessage = (msgId: string) => {
      setConversations(prev => prev.map(c => {
          if(c.id === selectedConvId) {
              return {
                  ...c,
                  messages: c.messages.filter(m => m.id !== msgId)
              }
          }
          return c;
      }));
  };

  const handleEditMessage = (msg: Message) => {
      if(msg.type !== 'text' || msg.senderId !== currentUser.id) return;
      setInputText(msg.text || "");
      setEditingMessageId(msg.id);
  };

  const handleCreatePoll = () => {
      if(!pollQuestion.trim() || pollOptions.some(o => !o.trim())) return;
      
      const options: PollOption[] = pollOptions.filter(o => o.trim()).map((text, i) => ({
          id: `opt-${i}`,
          text,
          votes: 0,
          voters: []
      }));

      handleSendMessage('poll', undefined, {
          poll: {
              question: pollQuestion,
              options,
              totalVotes: 0
          }
      });
  };

  const handleSharePin = () => {
      handleSendMessage('pin', 'https://picsum.photos/seed/sharepin/300/400', {
          text: 'Check out this idea!'
      });
  };

  const handleVote = (msgId: string, optionId: string) => {
      setConversations(prev => prev.map(c => {
          if(c.id === selectedConvId) {
              return {
                  ...c,
                  messages: c.messages.map(m => {
                      if(m.id === msgId && m.poll) {
                          const hasVoted = m.poll.userVotedOptionId;
                          const newOptions = m.poll.options.map(opt => {
                              if(opt.id === optionId) {
                                  if(m.poll?.userVotedOptionId === optionId) return opt;
                                  return { ...opt, votes: opt.votes + 1, voters: [...opt.voters, currentUser.id] };
                              }
                              if(opt.id === m.poll?.userVotedOptionId) {
                                  return { ...opt, votes: Math.max(0, opt.votes - 1), voters: opt.voters.filter(id => id !== currentUser.id) };
                              }
                              return opt;
                          });
                          return {
                              ...m,
                              poll: {
                                  ...m.poll,
                                  options: newOptions,
                                  totalVotes: hasVoted && hasVoted !== optionId ? m.poll.totalVotes : m.poll.totalVotes + 1,
                                  userVotedOptionId: optionId
                              }
                          };
                      }
                      return m;
                  })
              }
          }
          return c;
      }));
  };

  const handleCreateGroup = () => {
      if(!newGroupName || selectedGroupMembers.length === 0) return;

      const mockParticipants = [
          currentUser,
          ...selectedGroupMembers.map(id => ({ 
              id, 
              username: id === 'u2' ? 'Sarah_UX' : id === 'u3' ? 'Mike_Dev' : 'Jessica_Art',
              avatarUrl: `https://picsum.photos/seed/${id}/100/100`,
              followers: 0,
              following: 0
          }))
      ];

      const newGroup: Conversation = {
          id: `group-${Date.now()}`,
          isGroup: true,
          groupName: newGroupName,
          groupImage: `https://picsum.photos/seed/${newGroupName}/100/100`,
          participants: mockParticipants,
          admins: [currentUser.id],
          user: { id: 'dummy', username: newGroupName, avatarUrl: '', followers: 0, following: 0 },
          lastMessage: 'Group created',
          lastMessageTime: 'Now',
          unreadCount: 0,
          isOnline: true,
          messages: [
              { id: `sys-${Date.now()}`, senderId: 'system', text: `Group "${newGroupName}" created by ${currentUser.username}`, timestamp: 'Now', type: 'system', read: true, status: 'read' }
          ]
      };

      setConversations(prev => [newGroup, ...prev]);
      setShowCreateGroup(false);
      setSelectedConvId(newGroup.id);
      setNewGroupName("");
      setSelectedGroupMembers([]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleFileProcessing(e.target.files[0]);
      }
  };

  const handleFileProcessing = (file: File) => {
      const isImage = file.type.startsWith('image/');
      const url = URL.createObjectURL(file);
      
      if (isImage) {
          handleSendMessage('image', url);
      } else {
          handleSendMessage('file', url, { 
              fileName: file.name, 
              fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB` 
          });
      }
  };

  const startRecording = () => {
      setIsRecording(true);
      setRecordTimer(0);
      recordInterval.current = setInterval(() => {
          setRecordTimer(t => t + 1);
      }, 1000);
  };

  const stopRecording = (send: boolean) => {
      clearInterval(recordInterval.current);
      setIsRecording(false);
      if (send) {
          const mins = Math.floor(recordTimer / 60);
          const secs = recordTimer % 60;
          handleSendMessage('voice', undefined, { duration: `${mins}:${secs < 10 ? '0' : ''}${secs}` });
      }
  };

  const toggleReaction = (msgId: string, emoji: string) => {
      setConversations(prev => prev.map(c => {
          if (c.id === selectedConvId) {
              return {
                  ...c,
                  messages: c.messages.map(m => {
                      if (m.id === msgId) {
                          const existing = m.reactions?.find(r => r.emoji === emoji);
                          let newReactions = m.reactions || [];
                          if (existing) {
                              if (existing.userReacted) {
                                  newReactions = newReactions.filter(r => r.emoji !== emoji);
                              }
                          } else {
                              newReactions = [...newReactions, { emoji, count: 1, userReacted: true }];
                          }
                          return { ...m, reactions: newReactions };
                      }
                      return m;
                  })
              };
          }
          return c;
      }));
  };

  const startCall = (type: 'audio' | 'video') => {
      setCallType(type);
      setCallStatus('ringing');
      setCallDuration(0);
      setTimeout(() => {
          setCallStatus('connected');
          callInterval.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      }, 2500);
  };

  const endCall = () => {
      if (callStatus === 'connected') {
        clearInterval(callInterval.current);
        setCallStatus('ended');
      } else {
        setCallStatus('idle');
      }
      setIsMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
  };

  const formatTimer = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredMessages = activeConversation?.messages.filter(m => {
      if (!chatSearchQuery) return true;
      if (m.type === 'text' && m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase())) return true;
      return false;
  }) || [];

  return (
    <div className="fixed inset-0 z-[150] bg-white flex animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Sidebar List */}
      <div className={`w-full md:w-96 border-r border-gray-100 flex flex-col h-full bg-white ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-gray-50">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Messages</h2>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setShowCreateGroup(true)}
                        className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition shadow-md"
                        title="Create Group"
                      >
                          <Users size={20} />
                      </button>
                      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full md:hidden text-gray-500"><X size={20}/></button>
                  </div>
              </div>
              <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search chats..." 
                    className="w-full bg-gray-100 text-gray-900 rounded-2xl pl-12 pr-4 py-3.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin">
              {conversations.map(conv => (
                  <div 
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-4 mx-2 rounded-2xl flex gap-4 cursor-pointer transition-all mb-1 ${selectedConvId === conv.id ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                  >
                      <div className="relative flex-shrink-0">
                          {conv.isGroup ? (
                              <div className="w-14 h-14 relative">
                                  {conv.groupImage ? (
                                      <img src={conv.groupImage} className="w-full h-full rounded-2xl object-cover border border-gray-100" />
                                  ) : (
                                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center border border-gray-100">
                                          <Users className="text-emerald-600" size={24}/>
                                      </div>
                                  )}
                                  <div className="absolute -bottom-1 -right-1 flex -space-x-2">
                                      {conv.participants?.slice(0, 2).map((p, i) => (
                                          <img key={i} src={p.avatarUrl} className="w-6 h-6 rounded-full border-2 border-white" />
                                      ))}
                                  </div>
                              </div>
                          ) : (
                              <>
                                  <img src={conv.user.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border border-gray-100" />
                                  {conv.isOnline && <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white ring-1 ring-gray-100"></div>}
                              </>
                          )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-baseline mb-1">
                              <h3 className={`text-sm font-bold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {conv.isGroup ? conv.groupName : conv.user.username}
                              </h3>
                              <span className={`text-xs font-medium ${conv.unreadCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{conv.lastMessageTime}</span>
                          </div>
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                              {conv.messages[conv.messages.length-1]?.type === 'voice' ? '🎤 Voice Message' : conv.lastMessage}
                          </p>
                      </div>
                      {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center self-center shadow-sm shadow-emerald-200">
                              {conv.unreadCount}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Group Creation Modal */}
      {showCreateGroup && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-left">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-black">Create Group</h2>
                  <button onClick={() => setShowCreateGroup(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:border-emerald-500 hover:text-emerald-500 transition">
                          <Image size={24} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Group Name" 
                        className="flex-1 text-xl font-bold border-b-2 border-gray-100 py-2 outline-none focus:border-emerald-500 transition"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        autoFocus
                      />
                  </div>
                  
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Members</h3>
                  <div className="flex-1 overflow-y-auto space-y-2">
                      {['u2', 'u3', 'u4'].map((id) => {
                          const name = id === 'u2' ? 'Sarah_UX' : id === 'u3' ? 'Mike_Dev' : 'Jessica_Art';
                          const isSelected = selectedGroupMembers.includes(id);
                          return (
                              <div 
                                key={id} 
                                onClick={() => {
                                    if(isSelected) setSelectedGroupMembers(prev => prev.filter(m => m !== id));
                                    else setSelectedGroupMembers(prev => [...prev, id]);
                                }}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${isSelected ? 'bg-emerald-50 border-emerald-200' : 'hover:bg-gray-50 border-transparent'}`}
                              >
                                  <div className="flex items-center gap-3">
                                      <img src={`https://picsum.photos/seed/${id}/100/100`} className="w-10 h-10 rounded-full" />
                                      <span className="font-bold">{name}</span>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                      {isSelected && <CheckCheck size={14} className="text-white" />}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
                  
                  <button 
                    disabled={!newGroupName || selectedGroupMembers.length === 0}
                    onClick={handleCreateGroup}
                    className="w-full mt-4 bg-black text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 transition"
                  >
                      Create Group ({selectedGroupMembers.length})
                  </button>
              </div>
          </div>
      )}

      {/* Active Chat Area */}
      {activeConversation ? (
          <div 
            className={`flex-1 flex flex-col h-full ${selectedConvId ? 'flex' : 'hidden md:flex'} relative bg-gray-50`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
              
              {/* Drag & Drop Overlay */}
              {dragActive && (
                  <div className="absolute inset-0 z-[100] bg-emerald-500/10 backdrop-blur-sm border-4 border-emerald-500 border-dashed m-4 rounded-3xl flex items-center justify-center animate-in fade-in">
                      <div className="bg-white p-8 rounded-full shadow-2xl flex flex-col items-center animate-bounce">
                          <UploadCloud size={48} className="text-emerald-600 mb-2"/>
                          <p className="font-bold text-emerald-800">Drop files to send</p>
                      </div>
                  </div>
              )}

              {/* Chat Header */}
              <div className="px-6 py-3 border-b border-gray-200/50 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20 sticky top-0 shadow-sm">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedConvId(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-full"><ChevronLeft/></button>
                      <div className="relative cursor-pointer" onClick={() => onViewProfile(activeConversation.user)}>
                          {activeConversation.isGroup ? (
                               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                   {activeConversation.groupName?.charAt(0)}
                               </div>
                          ) : (
                              <>
                                <img src={activeConversation.user.avatarUrl} className="w-10 h-10 rounded-full border border-gray-100" alt="" />
                                {activeConversation.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>}
                              </>
                          )}
                      </div>
                      <div onClick={() => !activeConversation.isGroup && onViewProfile(activeConversation.user)} className="cursor-pointer">
                          <h3 className="font-bold text-gray-900 leading-tight hover:underline decoration-emerald-500 underline-offset-4">
                              {activeConversation.isGroup ? activeConversation.groupName : activeConversation.user.username}
                          </h3>
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              {activeConversation.isGroup 
                                ? `${activeConversation.participants?.length} participants` 
                                : (activeConversation.isOnline ? 'Active now' : 'Offline')}
                          </span>
                      </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                      <button onClick={() => setShowChatSearch(!showChatSearch)} className={`p-2.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition ${showChatSearch ? 'bg-emerald-50 text-emerald-600' : ''}`}><Search size={20}/></button>
                      <button onClick={() => startCall('audio')} className="p-2.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition"><Phone size={20}/></button>
                      <button onClick={() => startCall('video')} className="p-2.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition"><Video size={20}/></button>
                      <div className="w-px h-6 bg-gray-200 mx-2"></div>
                      <button onClick={() => setShowDetails(!showDetails)} className={`p-2.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition ${showDetails ? 'bg-emerald-50 text-emerald-600' : ''}`}><Info size={20}/></button>
                  </div>
              </div>

              {/* In-Chat Search Bar */}
              {showChatSearch && (
                  <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                      <Search size={16} className="text-gray-400"/>
                      <input 
                        type="text" 
                        placeholder="Search in conversation..." 
                        className="flex-1 outline-none text-sm font-medium"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => {setChatSearchQuery(""); setShowChatSearch(false)}} className="p-1 hover:bg-gray-100 rounded-full"><X size={16}/></button>
                  </div>
              )}

              {/* Pinned Message Banner */}
              {activeConversation.pinnedMessageId && (
                  <div className="bg-emerald-50/80 backdrop-blur border-b border-emerald-100 px-6 py-2 flex items-center justify-between text-xs font-medium text-emerald-800 cursor-pointer">
                      <div className="flex items-center gap-2">
                          <PinIcon size={12} className="fill-current" />
                          <span className="font-bold">Pinned:</span>
                          <span className="truncate max-w-xs opacity-80">Here are the brand assets for...</span>
                      </div>
                      <ChevronLeft size={14} className="-rotate-90" />
                  </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFDFD]">
                  {/* System Welcome Message */}
                  {activeConversation.isGroup && (
                      <div className="flex justify-center my-6">
                          <div className="bg-gray-100 text-gray-500 text-xs px-4 py-1.5 rounded-full font-bold">
                              Messages are encrypted. Group created {activeConversation.lastMessageTime}.
                          </div>
                      </div>
                  )}

                  {filteredMessages.length === 0 && chatSearchQuery && (
                      <div className="text-center text-gray-400 py-10 font-bold text-sm">No results found for "{chatSearchQuery}"</div>
                  )}

                  {filteredMessages.map(msg => {
                      const isMe = msg.senderId === currentUser.id;
                      const sender = activeConversation.isGroup 
                          ? activeConversation.participants?.find(p => p.id === msg.senderId)
                          : activeConversation.user;
                      
                      if (msg.type === 'system') {
                          return (
                              <div key={msg.id} className="flex justify-center my-4">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{msg.text}</span>
                              </div>
                          );
                      }

                      return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative animate-in slide-in-from-bottom-2`}>
                              
                              {/* Reply Context */}
                              {msg.replyTo && (
                                  <div className={`mb-1 text-xs bg-gray-100 px-3 py-2 rounded-xl border-l-4 border-emerald-400 opacity-70 max-w-[200px] truncate cursor-pointer hover:opacity-100 transition ${isMe ? 'mr-2' : 'ml-12'}`}>
                                      <span className="font-bold text-gray-700 block mb-0.5 flex items-center gap-1"><Reply size={10}/> {msg.replyTo.username}</span>
                                      <span className="text-gray-500 italic">{msg.replyTo.text}</span>
                                  </div>
                              )}

                              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                  {!isMe && (
                                      <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onViewProfile(sender!)}>
                                          <img src={sender?.avatarUrl} className="w-8 h-8 rounded-full shadow-sm border border-white" />
                                      </div>
                                  )}
                                  
                                  <div className="relative group/bubble flex flex-col">
                                      {/* Sender Name in Group */}
                                      {!isMe && activeConversation.isGroup && (
                                          <span className="text-[10px] text-gray-400 font-bold ml-1 mb-0.5">{sender?.username}</span>
                                      )}

                                      {/* Message Actions Popover (Hover) */}
                                      <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-32' : '-right-32'} opacity-0 group-hover/bubble:opacity-100 transition-opacity flex gap-1 bg-white p-1 rounded-full shadow-md border border-gray-100 z-10`}>
                                          <button onClick={() => toggleReaction(msg.id, '❤️')} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition transform hover:scale-110"><Heart size={14}/></button>
                                          <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-full text-gray-400 transition transform hover:scale-110"><Reply size={14}/></button>
                                          {isMe && msg.type === 'text' && (
                                              <button onClick={() => handleEditMessage(msg)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-full text-gray-400 transition"><Edit2 size={14}/></button>
                                          )}
                                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-400 transition"><Trash2 size={14}/></button>
                                      </div>

                                      {/* Message Content */}
                                      <div className={`rounded-2xl overflow-hidden shadow-sm relative transition-all
                                        ${msg.type === 'sticker' ? 'bg-transparent shadow-none' : 
                                          msg.type === 'image' || msg.type === 'pin' ? 'p-1 bg-white border border-gray-100' :
                                          msg.type === 'poll' ? 'bg-white border border-gray-100 w-64' :
                                          isMe ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                                        }
                                      `}>
                                          
                                          {/* Text Message with Search Highlight */}
                                          {msg.type === 'text' && (
                                              <div className="px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                                                  {chatSearchQuery ? (
                                                      msg.text?.split(new RegExp(`(${chatSearchQuery})`, 'gi')).map((part, i) => 
                                                          part.toLowerCase() === chatSearchQuery.toLowerCase() 
                                                            ? <span key={i} className="bg-yellow-300 text-black px-0.5 rounded">{part}</span> 
                                                            : part
                                                      )
                                                  ) : msg.text}
                                                  {msg.edited && <span className="text-[10px] opacity-60 ml-2 italic">(edited)</span>}
                                              </div>
                                          )}

                                          {/* Poll Message */}
                                          {msg.type === 'poll' && msg.poll && (
                                              <div className="p-4">
                                                  <h4 className="font-bold text-gray-900 mb-3 text-sm">{msg.poll.question}</h4>
                                                  <div className="space-y-2">
                                                      {msg.poll.options.map(opt => {
                                                          const percentage = msg.poll!.totalVotes > 0 ? Math.round((opt.votes / msg.poll!.totalVotes) * 100) : 0;
                                                          const isVoted = msg.poll?.userVotedOptionId === opt.id;
                                                          return (
                                                              <div 
                                                                key={opt.id} 
                                                                className="relative h-10 rounded-lg bg-gray-100 cursor-pointer overflow-hidden border border-transparent hover:border-emerald-200 transition"
                                                                onClick={() => handleVote(msg.id, opt.id)}
                                                              >
                                                                  <div 
                                                                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${isVoted ? 'bg-emerald-200' : 'bg-gray-200'}`} 
                                                                    style={{ width: `${percentage}%` }}
                                                                  ></div>
                                                                  <div className="absolute inset-0 flex items-center justify-between px-3 z-10">
                                                                      <span className="text-xs font-bold text-gray-800">{opt.text}</span>
                                                                      <span className="text-xs font-bold text-gray-500">{percentage}%</span>
                                                                  </div>
                                                              </div>
                                                          )
                                                      })}
                                                  </div>
                                                  <div className="mt-3 text-xs text-gray-400 font-medium text-right">{msg.poll.totalVotes} votes</div>
                                              </div>
                                          )}

                                          {/* Image/Pin Message */}
                                          {(msg.type === 'image' || msg.type === 'pin') && (
                                              <div className="relative group/media">
                                                  <img src={msg.mediaUrl} className="max-w-sm max-h-80 object-cover rounded-xl" />
                                                  {msg.type === 'pin' && (
                                                      <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm">
                                                          <PinIcon size={14} className="text-red-500 fill-current" />
                                                      </div>
                                                  )}
                                                  {msg.text && <p className="px-3 py-2 text-sm font-medium text-gray-800 bg-white/90 absolute bottom-0 w-full backdrop-blur-sm">{msg.text}</p>}
                                              </div>
                                          )}

                                          {/* Sticker Message */}
                                          {msg.type === 'sticker' && (
                                              <div className="text-8xl drop-shadow-xl hover:scale-110 transition-transform cursor-pointer">{msg.mediaUrl}</div>
                                          )}

                                          {/* File Message */}
                                          {msg.type === 'file' && (
                                              <div className={`flex items-center gap-3 px-4 py-3 min-w-[200px] ${isMe ? 'text-white' : ''}`}>
                                                  <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-gray-100 text-emerald-600'}`}>
                                                      <FileText size={24} />
                                                  </div>
                                                  <div className="flex-1 overflow-hidden">
                                                      <p className="font-bold text-sm truncate">{msg.fileName}</p>
                                                      <p className={`text-xs ${isMe ? 'text-white/70' : 'text-gray-500'}`}>{msg.fileSize}</p>
                                                  </div>
                                                  <button className={`p-2 rounded-full ${isMe ? 'hover:bg-white/20' : 'hover:bg-gray-100 text-gray-500'}`}>
                                                      <Download size={16} />
                                                  </button>
                                              </div>
                                          )}

                                          {/* Voice Message */}
                                          {msg.type === 'voice' && (
                                              <div className={`flex items-center gap-3 px-3 py-2 min-w-[180px] ${isMe ? 'text-white' : ''}`}>
                                                  <button className={`p-2.5 rounded-full flex-shrink-0 ${isMe ? 'bg-white text-black' : 'bg-emerald-500 text-white'}`}>
                                                      <Play size={14} className="ml-0.5" fill="currentColor" />
                                                  </button>
                                                  <div className="flex-1">
                                                      <div className={`h-8 flex items-center gap-0.5 ${isMe ? 'opacity-80' : 'opacity-60'}`}>
                                                          {/* Fake Waveform */}
                                                          {Array.from({length: 12}).map((_,i) => (
                                                              <div key={i} className={`w-1 rounded-full ${isMe ? 'bg-white' : 'bg-emerald-500'}`} style={{ height: `${Math.random() * 16 + 4}px`}}></div>
                                                          ))}
                                                      </div>
                                                  </div>
                                                  <span className={`text-xs font-mono font-bold ${isMe ? 'text-white/80' : 'text-gray-500'}`}>{msg.duration}</span>
                                              </div>
                                          )}

                                      </div>
                                      
                                      {/* Reactions Display */}
                                      {msg.reactions && msg.reactions.length > 0 && (
                                          <div className={`absolute -bottom-3 ${isMe ? 'left-0' : 'right-0'} flex gap-1 z-10`}>
                                              {msg.reactions.map((r, i) => (
                                                  <span key={i} className="bg-white border border-gray-100 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm animate-in zoom-in">{r.emoji} {r.count > 1 && r.count}</span>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                              
                              {/* Timestamp & Status Indicators */}
                              <div className={`mt-1 flex items-center gap-1 text-[10px] font-bold text-gray-400 ${isMe ? 'mr-1' : 'ml-10'}`}>
                                  <span>{msg.timestamp}</span>
                                  {isMe && (
                                      msg.status === 'sending' ? <Clock size={12} className="text-gray-300"/> :
                                      msg.status === 'sent' ? <Check size={12} className="text-gray-400"/> :
                                      msg.status === 'delivered' ? <CheckCheck size={12} className="text-gray-400"/> :
                                      msg.status === 'read' ? <CheckCheck size={12} className="text-blue-500"/> :
                                      <CheckCheck size={12} className="text-blue-500"/> 
                                  )}
                              </div>
                          </div>
                      );
                  })}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                      <div className="flex gap-2 items-center ml-12 animate-in fade-in slide-in-from-bottom-2">
                          <div className="bg-gray-100 rounded-full px-4 py-2 flex gap-1 items-center shadow-sm">
                               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span className="text-xs text-gray-400 font-medium">Typing...</span>
                      </div>
                  )}

                  <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-100 relative z-30">
                  {/* Smart Replies */}
                  {!isTyping && !editingMessageId && !inputText && (
                    <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-hide">
                        {SMART_REPLIES.map((reply, i) => (
                            <button 
                                key={i}
                                onClick={() => setInputText(reply)}
                                className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 transition"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                  )}

                  {/* Reply Banner */}
                  {replyingTo && (
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm mt-2">
                          <div className="flex items-center gap-2">
                              <Reply size={16} className="text-emerald-500"/>
                              <span className="text-gray-500">Replying to <span className="font-bold text-gray-800">{activeConversation.participants?.find(p => p.id === replyingTo.senderId)?.username || 'User'}</span></span>
                          </div>
                          <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full"><X size={14}/></button>
                      </div>
                  )}

                  {/* Edit Banner */}
                  {editingMessageId && (
                      <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm mt-2">
                          <div className="flex items-center gap-2">
                              <Edit2 size={16} className="text-blue-500"/>
                              <span className="text-gray-600">Editing message</span>
                          </div>
                          <button onClick={() => { setEditingMessageId(null); setInputText(""); }} className="p-1 hover:bg-blue-100 rounded-full text-blue-500"><X size={14}/></button>
                      </div>
                  )}

                  {/* Poll Creator */}
                  {showPollCreator && (
                      <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72 animate-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold">Create Poll</h4>
                              <button onClick={() => setShowPollCreator(false)}><X size={16}/></button>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Ask a question..." 
                            className="w-full bg-gray-50 p-2 rounded-lg text-sm font-bold mb-3 outline-none focus:ring-2 ring-emerald-100"
                            value={pollQuestion}
                            onChange={(e) => setPollQuestion(e.target.value)}
                          />
                          <div className="space-y-2 mb-4">
                              {pollOptions.map((opt, i) => (
                                  <input 
                                    key={i}
                                    type="text"
                                    placeholder={`Option ${i+1}`}
                                    className="w-full bg-gray-50 p-2 rounded-lg text-sm outline-none focus:ring-1 ring-emerald-100"
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...pollOptions];
                                        newOpts[i] = e.target.value;
                                        setPollOptions(newOpts);
                                    }}
                                  />
                              ))}
                              {pollOptions.length < 4 && (
                                  <button onClick={() => setPollOptions([...pollOptions, ""])} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                                      <Plus size={12} /> Add Option
                                  </button>
                              )}
                          </div>
                          <button 
                            onClick={handleCreatePoll}
                            className="w-full bg-black text-white font-bold py-2 rounded-lg text-sm hover:bg-gray-900"
                          >
                              Create Poll
                          </button>
                      </div>
                  )}
                  
                  {/* Sticker Picker */}
                  {showStickerPicker && (
                      <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64 grid grid-cols-4 gap-2 animate-in zoom-in-95">
                          {STICKERS.map(sticker => (
                              <button 
                                key={sticker} 
                                onClick={() => handleSendMessage('sticker', sticker)}
                                className="text-3xl hover:bg-gray-50 p-2 rounded-xl transition hover:scale-110"
                              >
                                  {sticker}
                              </button>
                          ))}
                      </div>
                  )}

                  <div className="p-4">
                      {isRecording ? (
                          <div className="flex items-center gap-4 bg-red-50 rounded-2xl px-4 py-3 animate-in fade-in border border-red-100">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-300"></div>
                              <span className="font-mono font-bold text-red-600 min-w-[40px]">{formatTimer(recordTimer)}</span>
                              <div className="flex-1 h-8 flex items-center gap-1 justify-center overflow-hidden opacity-50">
                                   {Array.from({length: 30}).map((_,i) => (
                                       <div key={i} className="w-1 bg-red-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: `${Math.random() * 24 + 4}px`, animationDelay: `${i * 0.05}s` }}></div>
                                   ))}
                              </div>
                              <button onClick={() => stopRecording(false)} className="p-2 hover:bg-red-200 rounded-full text-red-600 transition font-bold text-xs uppercase">Cancel</button>
                              <button onClick={() => stopRecording(true)} className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg shadow-red-200 transition"><Send size={18} className="ml-0.5" /></button>
                          </div>
                      ) : (
                          <div className="flex items-end gap-2">
                              <div className="flex gap-1 pb-1">
                                  <button 
                                    onClick={() => setShowAttachments(!showAttachments)}
                                    className={`p-3 rounded-full transition relative ${showAttachments ? 'bg-emerald-100 text-emerald-600 rotate-45' : 'text-gray-400 hover:bg-gray-100'}`}
                                  >
                                      <Paperclip size={22}/>
                                  </button>
                                  
                                  {/* Attachments Menu */}
                                  {showAttachments && (
                                      <div className="absolute bottom-20 left-4 flex flex-col gap-2 animate-in slide-in-from-bottom-4 fade-in z-40 bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                                          <div className="relative group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                              <div className="p-2 bg-emerald-500 text-white rounded-full shadow-sm"><Image size={18} /></div>
                                              <span className="font-bold text-sm text-gray-700">Photo/Video</span>
                                          </div>
                                          <div className="relative group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                              <div className="p-2 bg-blue-500 text-white rounded-full shadow-sm"><FileText size={18} /></div>
                                              <span className="font-bold text-sm text-gray-700">File</span>
                                          </div>
                                          <div className="relative group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => { setShowAttachments(false); setShowPollCreator(true); }}>
                                              <div className="p-2 bg-orange-500 text-white rounded-full shadow-sm"><BarChart2 size={18} /></div>
                                              <span className="font-bold text-sm text-gray-700">Poll</span>
                                          </div>
                                          <div className="relative group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={handleSharePin}>
                                              <div className="p-2 bg-red-500 text-white rounded-full shadow-sm"><PinIcon size={18} /></div>
                                              <span className="font-bold text-sm text-gray-700">Share Pin</span>
                                          </div>
                                      </div>
                                  )}
                                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                              </div>

                              <div className="flex-1 bg-gray-100 rounded-[24px] flex items-end px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition shadow-inner border border-transparent focus-within:border-emerald-100">
                                  <textarea 
                                    className="flex-1 bg-transparent outline-none py-3 text-sm font-medium max-h-32 min-h-[44px] overflow-y-auto resize-none"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => {
                                        if(e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    rows={1}
                                  />
                                  <button 
                                    onClick={() => setShowStickerPicker(!showStickerPicker)}
                                    className={`p-2 mb-1 rounded-full transition ${showStickerPicker ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                      <Sticker size={20}/>
                                  </button>
                              </div>

                              {inputText.trim() ? (
                                   <button onClick={() => handleSendMessage()} className="p-3.5 mb-0.5 bg-black text-white rounded-full hover:bg-gray-900 transition shadow-lg active:scale-90"><Send size={20} className="ml-0.5" /></button>
                              ) : (
                                   <button onClick={startRecording} className="p-3.5 mb-0.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 active:scale-90"><Mic size={22}/></button>
                              )}
                          </div>
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

                      {callStatus === 'ended' ? (
                          /* Call Ended Summary Screen */
                          <div className="z-20 flex flex-col items-center animate-in zoom-in-95">
                              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
                                  <PhoneOff size={40} className="text-gray-400"/>
                              </div>
                              <h2 className="text-3xl font-black mb-2">Call Ended</h2>
                              <p className="text-gray-400 font-medium mb-8 text-lg">{formatTimer(callDuration)} • {callType === 'video' ? 'Video Call' : 'Audio Call'}</p>
                              
                              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">How was the quality?</p>
                              <div className="flex gap-4 mb-10">
                                  {[1,2,3,4,5].map(star => (
                                      <button key={star} className="text-gray-600 hover:text-yellow-400 transition hover:scale-125">
                                          <Star size={32} fill="currentColor" />
                                      </button>
                                  ))}
                              </div>

                              <button onClick={() => setCallStatus('idle')} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition">
                                  Close
                              </button>
                          </div>
                      ) : (
                          /* Active/Ringing Call UI */
                          <div className="z-10 flex flex-col items-center w-full max-w-md h-full justify-between py-12">
                              <div className="flex flex-col items-center mt-12">
                                  <div className="relative mb-8">
                                     <div className={`w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl ${callStatus === 'ringing' ? 'animate-bounce' : ''}`}>
                                         {activeConversation.isGroup ? (
                                             <div className="w-full h-full bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center text-4xl font-bold">
                                                 {activeConversation.groupName?.charAt(0)}
                                             </div>
                                         ) : (
                                             <img src={activeConversation.user.avatarUrl} className="w-full h-full object-cover" />
                                         )}
                                     </div>
                                     {callStatus === 'connected' && callType === 'video' && !isVideoOff && (
                                         <div className="absolute -right-4 -bottom-4 w-28 h-36 bg-black rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl">
                                             <img src={currentUser.avatarUrl} className="w-full h-full object-cover opacity-80" />
                                         </div>
                                     )}
                                  </div>
                                  
                                  <h2 className="text-3xl font-black mb-2 tracking-tight text-center">
                                      {activeConversation.isGroup ? activeConversation.groupName : activeConversation.user.username}
                                  </h2>
                                  <p className="text-emerald-400 font-bold mb-12 animate-pulse uppercase tracking-widest text-sm">
                                      {callStatus === 'ringing' ? 'Calling...' : (callType === 'video' ? 'Stoc Video HD' : 'Stoc Audio')}
                                      {callStatus === 'connected' && <span className="text-white ml-2 font-mono normal-case tracking-normal">{formatTimer(callDuration)}</span>}
                                  </p>
                              </div>

                              <div className="flex flex-col gap-8 w-full px-8">
                                  {callStatus === 'connected' && (
                                      <div className="flex justify-center gap-6">
                                           <button 
                                              onClick={() => setIsScreenSharing(!isScreenSharing)}
                                              className={`p-4 rounded-full transition bg-white/5 hover:bg-white/20 ${isScreenSharing ? 'text-emerald-400' : 'text-white'}`}
                                              title="Share Screen"
                                           >
                                               <Monitor size={20}/>
                                           </button>
                                           <button className="p-4 rounded-full transition bg-white/5 hover:bg-white/20 text-white" title="Grid View">
                                               <Grid size={20}/>
                                           </button>
                                           <button className="p-4 rounded-full transition bg-white/5 hover:bg-white/20 text-white" title="Minimize">
                                               <Minimize2 size={20}/>
                                           </button>
                                      </div>
                                  )}

                                  <div className="flex items-center justify-center gap-6">
                                      <button 
                                        onClick={() => setIsMuted(!isMuted)}
                                        className={`p-5 rounded-full transition backdrop-blur-md border border-white/10 ${isMuted ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
                                      >
                                          {isMuted ? <MicOff size={28}/> : <Mic size={28}/>}
                                      </button>
                                      
                                      <button 
                                        onClick={endCall}
                                        className="p-8 bg-red-500 rounded-full shadow-2xl shadow-red-500/40 hover:bg-red-600 hover:scale-110 transition active:scale-95"
                                      >
                                          <PhoneOff size={36} fill="currentColor" />
                                      </button>

                                      {callType === 'video' && (
                                        <button 
                                            onClick={() => setIsVideoOff(!isVideoOff)}
                                            className={`p-5 rounded-full transition backdrop-blur-md border border-white/10 ${isVideoOff ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
                                        >
                                            {isVideoOff ? <VideoOff size={28}/> : <Video size={28}/>}
                                        </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
      ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 text-gray-400 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 relative z-10 animate-in zoom-in duration-500">
                  <div className="absolute inset-0 bg-emerald-50 rounded-full animate-ping opacity-20"></div>
                  <Send size={48} className="ml-2 text-emerald-500"/>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">Your Messages</h3>
              <p className="max-w-sm text-center text-gray-500 relative z-10">Send private photos, voice notes, and share your creative ideas directly with collaborators.</p>
              <button onClick={() => setShowCreateGroup(true)} className="mt-8 px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-900 transition shadow-lg relative z-10">
                  Start New Chat
              </button>
          </div>
      )}

      {/* Details Sidebar */}
      {showDetails && activeConversation && (
          <div className="w-80 border-l border-gray-100 bg-white hidden xl:flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-8 flex flex-col items-center border-b border-gray-50">
                  <div className="relative mb-4 cursor-pointer" onClick={() => onViewProfile(activeConversation.user)}>
                      {activeConversation.isGroup ? (
                           <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-4xl shadow-md">
                               {activeConversation.groupName?.charAt(0)}
                           </div>
                      ) : (
                          <>
                            <img src={activeConversation.user.avatarUrl} className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-sm" />
                            {activeConversation.isOnline && <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
                          </>
                      )}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 text-center">
                      {activeConversation.isGroup ? activeConversation.groupName : activeConversation.user.username}
                  </h3>
                  <p className="text-emerald-600 font-medium text-sm mb-6">
                      {activeConversation.isGroup ? 'Group Chat' : 'Visual Designer'}
                  </p>
                  
                  <div className="flex gap-3 w-full">
                      <button onClick={() => onViewProfile(activeConversation.user)} className="flex-1 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold text-xs transition shadow-md">View Profile</button>
                      <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-600"><MoreVertical size={18}/></button>
                  </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                  {activeConversation.isGroup && (
                      <div className="mb-8">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Members ({activeConversation.participants?.length})</h4>
                          <div className="space-y-3">
                              {activeConversation.participants?.map(p => (
                                  <div key={p.id} className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile(p)}>
                                      <img src={p.avatarUrl} className="w-8 h-8 rounded-full" />
                                      <span className="text-sm font-bold text-gray-700">{p.username}</span>
                                      {activeConversation.admins?.includes(p.id) && <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Admin</span>}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Shared Media</h4>
                          <button className="text-emerald-600 text-xs font-bold hover:underline">View All</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          {[1,2,3,4,5,6].map(i => (
                              <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition relative group">
                                  <img src={`https://picsum.photos/seed/shared${i}/200/200`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="p-6 border-t border-gray-100">
                  <button className="w-full py-3 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center gap-2 transition text-sm">
                      <Trash2 size={16} /> {activeConversation.isGroup ? 'Leave Group' : 'Clear History'}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};
