
import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Plus, Share2, UserPlus, Shield, Eye, Edit3, Check, Clock, Globe, Lock, Search, X } from 'lucide-react';
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

const SUGGESTED_CONTACTS = [
    { id: 'sc1', username: 'Alex_Design', avatarUrl: 'https://picsum.photos/seed/alex/100/100', email: 'alex@design.co' },
    { id: 'sc2', username: 'Sarah_UX', avatarUrl: 'https://picsum.photos/seed/sarah/100/100', email: 'sarah@studio.io' },
    { id: 'sc3', username: 'Mike_Dev', avatarUrl: 'https://picsum.photos/seed/mike/100/100', email: 'mike@tech.net' },
];

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
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');
    const [isInviting, setIsInviting] = useState(false);

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inviteEmail) return;
        processInvite(inviteEmail);
    };

    const processInvite = (email: string) => {
        setIsInviting(true);
        setTimeout(() => {
            onInvite(email, selectedRole);
            setInviteEmail("");
            setIsInviting(false);
            setShowInviteModal(false);
        }, 800);
    }

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 pb-12 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={onBack} className="mb-8 px-5 py-3 bg-white hover:bg-gray-100 rounded-full inline-flex items-center gap-2 font-bold transition shadow-sm border border-gray-100 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>

            {/* Hero Header */}
            <div className="relative flex flex-col items-center mb-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-emerald-50/50 to-transparent blur-3xl -z-10 rounded-full opacity-60"></div>

                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-4">
                        {board.isPrivate ? (
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Lock size={12} /> Private Board
                            </span>
                        ) : (
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Globe size={12} /> Public Board
                            </span>
                        )}
                        <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                            <Clock size={12} /> Updated 2h ago
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-gray-900 leading-tight">
                        {board.title}
                    </h1>

                    {/* Collaborator Bar */}
                    <div className="flex flex-col md:flex-row items-center gap-8 bg-white/60 backdrop-blur-xl p-3 pr-6 rounded-full shadow-lg border border-white/50">
                        
                        <div className="flex items-center -space-x-4 pl-2">
                            {board.collaborators.map((user, i) => (
                                <div key={user.id} className="relative group cursor-pointer hover:z-10 hover:scale-110 transition-all duration-300">
                                    <img 
                                        src={user.avatarUrl} 
                                        alt={user.username} 
                                        className="w-12 h-12 rounded-full border-4 border-white shadow-md object-cover" 
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                        {user.role === 'owner' && <Shield size={12} className="text-emerald-500 fill-emerald-100" />}
                                        {user.role === 'editor' && <Edit3 size={12} className="text-blue-500 fill-blue-100" />}
                                        {user.role === 'viewer' && <Eye size={12} className="text-gray-400" />}
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                                        {user.username} • {user.role}
                                    </div>
                                </div>
                            ))}
                            <button 
                                className="w-12 h-12 rounded-full bg-black text-white border-4 border-white flex items-center justify-center hover:bg-emerald-600 hover:scale-105 transition shadow-md z-10"
                                onClick={() => setShowInviteModal(true)}
                                title="Invite Collaborators"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>

                        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

                        <div className="flex gap-2">
                             <button className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition shadow-md flex items-center gap-2">
                                <MoreHorizontal size={16} /> Organize
                             </button>
                             <button className="p-2.5 bg-white text-gray-900 rounded-full hover:bg-gray-50 transition border border-gray-200 shadow-sm">
                                <Share2 size={18} />
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <button 
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900 mb-1">Invite to {board.title}</h2>
                            <p className="text-gray-500 text-sm">Collaborate with others to curate this board.</p>
                        </div>

                        <form onSubmit={handleInviteSubmit} className="mb-8">
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="email" 
                                        placeholder="Email or name" 
                                        className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 ring-emerald-500 font-medium"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="relative group">
                                    <button type="button" className="h-full bg-gray-100 rounded-xl px-3 font-bold text-sm text-gray-700 flex items-center gap-1 hover:bg-gray-200 min-w-[90px] justify-between">
                                        {selectedRole === 'editor' ? 'Editor' : 'Viewer'}
                                    </button>
                                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-1 w-32 hidden group-hover:block z-10 animate-in fade-in slide-in-from-top-2">
                                        <button type="button" onClick={() => setSelectedRole('editor')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-between ${selectedRole === 'editor' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'}`}>
                                            Editor {selectedRole === 'editor' && <Check size={14}/>}
                                        </button>
                                        <button type="button" onClick={() => setSelectedRole('viewer')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-between ${selectedRole === 'viewer' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'}`}>
                                            Viewer {selectedRole === 'viewer' && <Check size={14}/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!inviteEmail || isInviting}
                                className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isInviting ? 'Sending Invite...' : 'Send Invite'}
                            </button>
                        </form>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Contacts</p>
                            <div className="space-y-3">
                                {SUGGESTED_CONTACTS.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition group"
                                        onClick={() => processInvite(contact.email)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={contact.avatarUrl} className="w-10 h-10 rounded-full border border-gray-100" />
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">{contact.username}</p>
                                                <p className="text-xs text-gray-400">{contact.email}</p>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold group-hover:bg-emerald-500 group-hover:text-white transition">
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pins Grid */}
            <div className="masonry-grid">
                {pins.map(pin => (
                    <PinCard 
                        key={pin.id} 
                        pin={pin} 
                        onClick={onPinClick} 
                        onSave={() => {}} 
                        onMoreLikeThis={onMoreLikeThis}
                        onStash={onStash}
                        onTagClick={onTagClick}
                        boards={allBoards}
                    />
                ))}
            </div>
            {pins.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mt-8 group hover:border-emerald-300 transition-colors cursor-pointer">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                        <Plus size={32} className="text-gray-300 group-hover:text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Start Curating</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mb-8">Save your first pin to this board or create something new.</p>
                    <button className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-900 transition shadow-lg">
                        Browse Feed
                    </button>
                </div>
            )}
        </div>
    );
};
