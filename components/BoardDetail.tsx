import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Plus, Share2, UserPlus } from 'lucide-react';
import { Board, Pin } from '../types';
import { PinCard } from './PinCard';

interface BoardDetailProps {
    board: Board;
    pins: Pin[]; 
    allBoards: Board[]; 
    onBack: () => void;
    onPinClick: (pin: Pin) => void;
    onInvite: (email: string) => void;
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
    const [showInviteInput, setShowInviteInput] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite(inviteEmail);
        setInviteEmail("");
        setShowInviteInput(false);
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 pb-12 pt-8">
            <button onClick={onBack} className="mb-6 px-4 py-3 hover:bg-gray-100 rounded-full inline-flex items-center gap-2 font-bold transition">
                <ArrowLeft size={20} /> Back
            </button>

            {/* Board Header */}
            <div className="flex flex-col items-center mb-16 animate-in fade-in zoom-in-95 duration-500">
                <h1 className="text-5xl md:text-7xl font-black mb-6 text-center tracking-tight text-gray-900">{board.title}</h1>
                <div className="flex items-center gap-4 mb-8">
                    {/* Collaborators List */}
                    <div className="flex items-center -space-x-4 cursor-pointer hover:scale-105 transition-transform">
                        {board.collaborators.map((user) => (
                            <img 
                                key={user.id} 
                                src={user.avatarUrl} 
                                alt={user.username} 
                                className="w-14 h-14 rounded-full border-4 border-white shadow-md" 
                                title={user.username}
                            />
                        ))}
                        <button 
                            className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center hover:bg-emerald-100 text-emerald-600 shadow-md transition-colors"
                            onClick={() => setShowInviteInput(!showInviteInput)}
                        >
                            <UserPlus size={24} />
                        </button>
                    </div>
                    {/* Invite Popup */}
                    {showInviteInput && (
                        <div className="absolute mt-20 z-20 bg-white p-6 shadow-2xl rounded-3xl border border-gray-100 w-80 animate-in slide-in-from-top-4">
                            <form onSubmit={handleInviteSubmit}>
                                <h3 className="font-bold text-xl mb-2">Invite Collaborators</h3>
                                <p className="text-sm text-gray-500 mb-4">Add people to collaborate on this board.</p>
                                <input 
                                    type="email" 
                                    placeholder="Email address" 
                                    className="w-full bg-gray-100 p-4 rounded-2xl mb-4 outline-none focus:ring-2 ring-emerald-500 transition"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition">Send Invite</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition"><MoreHorizontal size={24}/></button>
                    <button className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition"><Share2 size={24}/></button>
                    <button className="p-4 bg-black text-white rounded-full hover:scale-105 transition shadow-lg"><Plus size={24}/></button>
                </div>
            </div>

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
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <h3 className="text-2xl font-bold mb-2">This board is empty</h3>
                    <p>Start saving your favorite ideas here.</p>
                </div>
            )}
        </div>
    );
};