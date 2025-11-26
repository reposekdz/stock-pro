
import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Plus, Share2, UserPlus, Shield, Eye, Edit3, Check, Clock, Globe, Lock, Search, X, Grid, List, FolderPlus, Trash2, GripVertical, Settings, Play, Filter, Sparkles, BarChart2, Lightbulb } from 'lucide-react';
import { Board, Pin, User, Collaborator } from '../types';
import { PinCard } from './PinCard';

interface BoardDetailProps {
    board: Board;
    pins: Pin[]; 
    allBoards: Board[]; 
    onBack: () => void;
    onPinClick: (pin: Pin) => void;
    onInvite: (email: string, role: 'editor' | 'viewer') => void;
    onMoreLikeThis: (pin: Pin) => void;
    onStash: (pin: Pin) => void;
    onTagClick: (tag: string) => void;
}

export const BoardDetail: React.FC<BoardDetailProps> = ({ 
    board, 
    pins, 
    allBoards, 
    onBack, 
    onPinClick, 
    onInvite,
    onMoreLikeThis,
    onStash,
    onTagClick
}) => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isOrganizing, setIsOrganizing] = useState(false);
    const [selectedPins, setSelectedPins] = useState<string[]>([]);
    const [showMoreIdeas, setShowMoreIdeas] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'notes'>('all');
    
    // Edit State
    const [editTitle, setEditTitle] = useState(board.title);
    const [editDesc, setEditDesc] = useState(board.description || "");
    const [editPrivate, setEditPrivate] = useState(board.isPrivate);

    // Invite State
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');

    const handlePinSelection = (pinId: string) => {
        if (selectedPins.includes(pinId)) {
            setSelectedPins(prev => prev.filter(id => id !== pinId));
        } else {
            setSelectedPins(prev => [...prev, pinId]);
        }
    };

    const handleEditSave = () => {
        // Mock save
        setShowEditModal(false);
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 pb-12 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={onBack} className="mb-8 px-5 py-3 bg-white hover:bg-gray-100 rounded-full inline-flex items-center gap-2 font-bold transition shadow-sm border border-gray-100 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>

            {/* Hero Header */}
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12">
                <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-gray-900 leading-tight">
                    {board.title}
                </h1>
                
                {board.description && (
                    <p className="text-gray-600 text-lg max-w-2xl mb-6 font-medium">{board.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm font-bold text-gray-500 mb-8">
                     <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                         {board.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                         {board.isPrivate ? 'Secret' : 'Public'}
                     </div>
                     <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                         <BarChart2 size={12} />
                         <span>1.2k Views/mo</span>
                     </div>
                     <span>•</span>
                     <span>{pins.length} Pins</span>
                </div>

                <div className="flex items-center gap-2 mb-8">
                    <div className="flex -space-x-3">
                        {board.collaborators.map((c, i) => (
                            <img key={i} src={c.avatarUrl} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" title={c.username} />
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition border-4 border-white shadow-sm"
                    >
                        <UserPlus size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3 flex-wrap justify-center">
                     {isOrganizing ? (
                         <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                             <button className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold text-sm">
                                 Move ({selectedPins.length})
                             </button>
                             <button className="px-6 py-2.5 bg-red-50 text-red-600 rounded-full font-bold text-sm hover:bg-red-100">
                                 Delete ({selectedPins.length})
                             </button>
                             <button 
                                onClick={() => { setIsOrganizing(false); setSelectedPins([]); }}
                                className="px-6 py-2.5 bg-gray-200 text-gray-900 rounded-full font-bold text-sm hover:bg-gray-300"
                             >
                                 Done
                             </button>
                         </div>
                     ) : (
                         <>
                             <button 
                                onClick={() => setIsOrganizing(true)}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-sm transition flex items-center gap-2"
                             >
                                <Grid size={16} /> Organize
                             </button>
                             <button 
                                onClick={() => setShowMoreIdeas(!showMoreIdeas)}
                                className={`px-5 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${showMoreIdeas ? 'bg-black text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                             >
                                <Lightbulb size={16} /> More Ideas
                             </button>
                             <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-sm transition flex items-center gap-2">
                                <Play size={16} /> Slideshow
                             </button>
                             <button 
                                onClick={() => setShowEditModal(true)}
                                className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition text-gray-900"
                             >
                                <Edit3 size={18} />
                             </button>
                         </>
                     )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mt-6">
                    {['All', 'Video', 'Notes'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setActiveFilter(f.toLowerCase() as any)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${activeFilter === f.toLowerCase() ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* More Ideas Section */}
            {showMoreIdeas && (
                <div className="mb-12 bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-purple-500"/> Recommended for this board
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[1,2,3,4,5,6].map(i => (
                             <div key={i} className="aspect-[2/3] bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pins Grid */}
            <div className="masonry-grid">
                {pins.map(pin => (
                    <div key={pin.id} className="relative group">
                        {isOrganizing && (
                            <div 
                                className={`absolute top-4 left-4 z-50 w-6 h-6 rounded-md border-2 cursor-pointer flex items-center justify-center transition-all ${selectedPins.includes(pin.id) ? 'bg-black border-black' : 'bg-white/80 border-gray-300'}`}
                                onClick={(e) => { e.stopPropagation(); handlePinSelection(pin.id); }}
                            >
                                {selectedPins.includes(pin.id) && <Check size={14} className="text-white" />}
                            </div>
                        )}
                        <div className={isOrganizing ? (selectedPins.includes(pin.id) ? 'opacity-100 scale-95 transition-transform' : 'opacity-50') : ''}>
                            <PinCard 
                                pin={pin} 
                                onClick={isOrganizing ? () => handlePinSelection(pin.id) : onPinClick} 
                                onSave={() => {}} 
                                onMoreLikeThis={onMoreLikeThis}
                                onStash={onStash}
                                onTagClick={onTagClick}
                                boards={allBoards}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Board Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                        <h2 className="text-2xl font-black mb-6">Edit Board</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                <input 
                                    type="text" 
                                    value={editTitle} 
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="w-full text-xl font-bold border-b border-gray-200 py-2 outline-none focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea 
                                    value={editDesc} 
                                    onChange={e => setEditDesc(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl p-3 mt-1 h-24 resize-none outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="font-bold text-gray-700">Keep this board secret</span>
                                <button 
                                    onClick={() => setEditPrivate(!editPrivate)}
                                    className={`w-12 h-7 rounded-full relative transition-colors ${editPrivate ? 'bg-black' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${editPrivate ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                             <button className="text-red-500 font-bold text-sm hover:underline">Delete Board</button>
                             <button onClick={handleEditSave} className="px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
