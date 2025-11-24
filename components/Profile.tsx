
import React, { useState } from 'react';
import { Plus, Settings, Share2 } from 'lucide-react';
import { User, Board, Pin } from '../types';

interface ProfileProps {
    user: User;
    boards: Board[];
    savedPins: Pin[]; 
    onCreateBoard: () => void;
    onOpenBoard: (board: Board) => void;
    onShowFollowers: () => void;
    onShowFollowing: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, boards, savedPins, onCreateBoard, onOpenBoard, onShowFollowers, onShowFollowing }) => {
    const [activeTab, setActiveTab] = useState<'created' | 'saved'>('saved');

    return (
        <div className="flex flex-col items-center pt-8 pb-12 w-full">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-12 animate-in slide-in-from-bottom-5 duration-500">
                <div className="p-1 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 mb-4">
                    <img src={user.avatarUrl} alt={user.username} className="w-32 h-32 rounded-full object-cover border-4 border-white" />
                </div>
                <h1 className="text-4xl font-extrabold mb-1 text-gray-900 tracking-tight">{user.username}</h1>
                <p className="text-gray-500 mb-3 font-medium">@stocpro_user</p>
                
                <div className="flex gap-6 text-sm font-bold text-gray-900 mb-8">
                    <button 
                        onClick={onShowFollowers}
                        className="text-center cursor-pointer hover:text-emerald-600 transition group"
                    >
                        <span className="text-lg">{user.followers.toLocaleString()}</span>
                        <span className="text-gray-500 font-medium ml-1 group-hover:text-emerald-600/70">followers</span>
                    </button>
                    <div className="w-px bg-gray-300 h-5 self-center"></div>
                    <button 
                        onClick={onShowFollowing}
                        className="text-center cursor-pointer hover:text-emerald-600 transition group"
                    >
                        <span className="text-lg">{user.following.toLocaleString()}</span>
                        <span className="text-gray-500 font-medium ml-1 group-hover:text-emerald-600/70">following</span>
                    </button>
                </div>

                <div className="flex gap-3">
                    <button className="px-8 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition">Share</button>
                    <button className="px-8 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition">Edit Profile</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-100 w-full justify-center">
                <button 
                    onClick={() => setActiveTab('created')}
                    className={`pb-3 font-bold text-lg px-4 transition-all ${activeTab === 'created' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Created
                </button>
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`pb-3 font-bold text-lg px-4 transition-all ${activeTab === 'saved' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Saved
                </button>
            </div>

            {/* Board Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4 max-w-[1600px]">
                {/* Create Board Card */}
                <div 
                    onClick={onCreateBoard}
                    className="aspect-[4/5] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition group"
                >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-emerald-500 shadow-sm mb-4 transition-colors">
                        <Plus size={32} />
                    </div>
                    <p className="font-bold text-gray-600 group-hover:text-emerald-600">Create Board</p>
                </div>

                {boards.map(board => (
                    <div 
                        key={board.id} 
                        className="cursor-pointer group relative"
                        onClick={() => onOpenBoard(board)}
                    >
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 relative mb-3 grid grid-cols-2 grid-rows-2 gap-0.5 group-hover:shadow-xl transition-all duration-300">
                            {/* Collaborators */}
                            {board.collaborators.length > 1 && (
                                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur p-1 rounded-full shadow-sm">
                                    <div className="flex -space-x-2">
                                        {board.collaborators.slice(0,3).map((c, i) => (
                                            <img key={i} src={c.avatarUrl} className="w-6 h-6 rounded-full border border-white" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Images */}
                            <div className="col-span-1 row-span-2 bg-gray-200 group-hover:opacity-90 transition">
                                <img src={`https://picsum.photos/seed/${board.id}1/300/600`} className="w-full h-full object-cover" />
                            </div>
                            <div className="col-span-1 bg-gray-200 group-hover:opacity-90 transition">
                                <img src={`https://picsum.photos/seed/${board.id}2/300/300`} className="w-full h-full object-cover" />
                            </div>
                            <div className="col-span-1 bg-gray-200 group-hover:opacity-90 transition">
                                <img src={`https://picsum.photos/seed/${board.id}3/300/300`} className="w-full h-full object-cover" />
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                        <h3 className="font-bold text-xl leading-tight text-gray-900 group-hover:text-emerald-700 transition-colors">{board.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-1">
                            <span>{board.pins.length} Pins</span>
                            <span>•</span>
                            <span className="text-emerald-600">{board.collaborators.length > 1 ? 'Shared' : 'Private'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
