
import React, { useState } from 'react';
import { Share2, MessageCircle, MoreHorizontal, Check, UserPlus, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { User, Pin } from '../types';
import { PinCard } from './PinCard';

interface UserProfileProps {
    user: User;
    pins: Pin[];
    onBack: () => void;
    onPinClick: (pin: Pin) => void;
    onShowFollowers: () => void;
    onShowFollowing: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, pins, onBack, onPinClick, onShowFollowers, onShowFollowing }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(user.followers);
    const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created');

    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
        setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    };

    return (
        <div className="flex flex-col w-full animate-in fade-in duration-500">
            {/* Cover Image Parallax */}
            <div className="h-64 md:h-80 w-full overflow-hidden relative">
                <img 
                    src={user.coverUrl || `https://picsum.photos/seed/${user.username}cover/1600/400`} 
                    alt="cover" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 w-full -mt-20 relative z-10">
                {/* Profile Header Card */}
                <div className="flex flex-col items-center">
                    <div className="p-1.5 rounded-full bg-white shadow-xl mb-4">
                        <img src={user.avatarUrl} alt={user.username} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-100" />
                    </div>
                    
                    <h1 className="text-4xl font-extrabold mb-1 text-gray-900 tracking-tight">{user.username}</h1>
                    <p className="text-gray-500 mb-4 font-medium">@{user.username.toLowerCase().replace(/\s/g, '_')}</p>
                    
                    {user.bio && (
                        <p className="text-center max-w-lg text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1"><MapPin size={14}/> Los Angeles, CA</span>
                        <span className="flex items-center gap-1"><LinkIcon size={14}/> <a href="#" className="hover:underline hover:text-emerald-600">portfolio.design</a></span>
                        <span className="flex items-center gap-1"><Calendar size={14}/> Joined March 2024</span>
                    </div>

                    <div className="flex gap-6 text-sm font-bold text-gray-900 mb-8">
                        <button 
                            onClick={onShowFollowers}
                            className="text-center cursor-pointer hover:text-emerald-600 group transition"
                        >
                            <span className="block text-xl transition-all duration-300 group-hover:scale-110">{followerCount.toLocaleString()}</span>
                            <span className="text-gray-500 font-normal group-hover:text-emerald-600/70">followers</span>
                        </button>
                        <button 
                            onClick={onShowFollowing}
                            className="text-center cursor-pointer hover:text-emerald-600 group transition"
                        >
                            <span className="block text-xl transition-all duration-300 group-hover:scale-110">{user.following.toLocaleString()}</span>
                            <span className="text-gray-500 font-normal group-hover:text-emerald-600/70">following</span>
                        </button>
                        <div className="text-center cursor-pointer hover:text-emerald-600 group transition">
                            <span className="block text-xl transition-all duration-300 group-hover:scale-110">4.5k</span>
                            <span className="text-gray-500 font-normal group-hover:text-emerald-600/70">monthly views</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-12">
                        <button 
                            onClick={handleFollowToggle}
                            className={`px-8 py-3 rounded-full font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 border
                                ${isFollowing 
                                    ? 'bg-transparent text-gray-900 border-gray-300 hover:bg-gray-50' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'}`}
                        >
                            {isFollowing ? (
                                <>Following <Check size={18} /></>
                            ) : (
                                <>Follow <UserPlus size={18} /></>
                            )}
                        </button>
                        <button className="px-6 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition text-gray-900 flex items-center gap-2">
                            <MessageCircle size={20} /> Message
                        </button>
                        <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-900">
                            <Share2 size={20} />
                        </button>
                        <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-900">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex justify-center gap-8 mb-8 border-b border-gray-100">
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

                {/* Pins Grid */}
                <div className="masonry-grid pb-20">
                    {pins.map(pin => (
                        <PinCard 
                            key={pin.id} 
                            pin={pin} 
                            onClick={onPinClick} 
                            onSave={() => {}} 
                            onMoreLikeThis={() => {}}
                            onStash={() => {}}
                            onTagClick={() => {}}
                            boards={[]}
                            onUserClick={() => {}} // Already on user profile
                        />
                    ))}
                </div>
                
                {pins.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>No pins found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
