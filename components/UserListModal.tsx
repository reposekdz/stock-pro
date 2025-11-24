
import React, { useState, useEffect } from 'react';
import { X, Search, UserMinus, UserPlus, Check } from 'lucide-react';
import { User } from '../types';

interface UserListModalProps {
    title: string;
    initialTab: 'followers' | 'following';
    users: User[]; // The list of users to display
    currentUser: User; // The logged-in user
    onClose: () => void;
    onToggleFollow: (userId: string) => void;
    onRemoveFollower?: (userId: string) => void; // Only for current user's follower list
}

export const UserListModal: React.FC<UserListModalProps> = ({ 
    title, 
    initialTab, 
    users, 
    currentUser, 
    onClose, 
    onToggleFollow,
    onRemoveFollower 
}) => {
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayUsers, setDisplayUsers] = useState<User[]>(users);
    const [followingState, setFollowingState] = useState<Record<string, boolean>>({});

    // Initialize following state based on mock logic (random for demo)
    useEffect(() => {
        const initialFollows: Record<string, boolean> = {};
        users.forEach(u => {
            initialFollows[u.id] = Math.random() > 0.5;
        });
        setFollowingState(initialFollows);
        setDisplayUsers(users);
    }, [users]);

    const filteredUsers = displayUsers.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleFollowClick = (userId: string) => {
        setFollowingState(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
        onToggleFollow(userId);
    };

    const handleRemove = (userId: string) => {
        if (onRemoveFollower) {
            onRemoveFollower(userId);
            setDisplayUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    return (
        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md h-[80vh] md:h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex gap-6">
                        <button 
                            onClick={() => setActiveTab('followers')}
                            className={`text-lg font-bold transition-colors ${activeTab === 'followers' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Followers
                        </button>
                        <button 
                            onClick={() => setActiveTab('following')}
                            className={`text-lg font-bold transition-colors ${activeTab === 'following' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Following
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
                    {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <p className="font-medium">No users found</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition group">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full border border-gray-100 object-cover" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{user.username}</h4>
                                            <p className="text-xs text-gray-500 truncate max-w-[140px]">
                                                {user.bio || 'Digital Creator'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {/* If viewing my own followers list, show remove option */}
                                        {activeTab === 'followers' && onRemoveFollower && (
                                            <button 
                                                onClick={() => handleRemove(user.id)}
                                                className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                            >
                                                Remove
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => handleFollowClick(user.id)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border
                                                ${followingState[user.id] 
                                                    ? 'bg-transparent border-gray-300 text-gray-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                                                    : 'bg-black border-transparent text-white hover:bg-emerald-600'}`}
                                        >
                                            {followingState[user.id] ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
