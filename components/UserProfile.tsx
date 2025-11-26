
import React, { useState } from 'react';
import { Share2, MessageCircle, MoreHorizontal, Check, UserPlus, MapPin, Link as LinkIcon, Calendar, ArrowLeft } from 'lucide-react';
import { User, Pin } from '../types';
import { PinCard } from './PinCard';

interface UserProfileProps {
    user: User;
    pins: Pin[];
    onBack: () => void;
    onPinClick: (pin: Pin) => void;
    onShowFollowers: (user: User) => void;
    onShowFollowing: (user: User) => void;
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
        <div className="flex flex-col w-full animate-in fade-in duration-500 relative">
            
            {/* Navigation Bar overlay */}
            <div className="fixed top-24 left-4 z-40">
                <button 
                    onClick={onBack} 
                    className="p-3 bg-white/50 backdrop-blur-md hover:bg-white rounded-full text-black shadow-lg transition-all border border-white/20"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Cover Image Parallax */}
            <div className="h-80 md:h-[400px] w-full overflow-hidden relative group">
                <img 
                    src={user.coverUrl || `https://picsum.photos/seed/${user.username}cover/1600/600`} 
                    alt="cover" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white/90"></div>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 w-full -mt-32 relative z-10">
                {/* Profile Header Card */}
                <div className="flex flex-col items-center">
                    <div className="p-2 rounded-full bg-white shadow-2xl mb-4">
                        <img src={user.avatarUrl} alt={user.username} className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-gray-50" />
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black mb-1 text-gray-900 tracking-tight text-center">{user.username}</h1>
                    <p className="text-gray-500 mb-6 font-bold text-lg">@{user.username.toLowerCase().replace(/\s/g, '_')}</p>
                    
                    {user.bio && (
                        <p className="text-center max-w-xl text-gray-800 mb-6 text-lg font-medium leading-relaxed">{user.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-6 justify-center text-sm font-semibold text-gray-600 mb-8">
                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full"><MapPin size={14}/> Los Angeles, CA</span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full"><LinkIcon size={14}/> portfolio.design</span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full"><Calendar size={14}/> Joined March 2024</span>
                    </div>

                    <div className="flex gap-8 text-sm font-bold text-gray-900 mb-10 bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100">
                        <button 
                            onClick={() => onShowFollowers(user)}
                            className="text-center cursor-pointer hover:text-emerald-600 group transition"
                        >
                            <span className="block text-2xl transition-all duration-300 group-hover:scale-110 mb-1">{followerCount.toLocaleString()}</span>
                            <span className="text-gray-400 font-medium group-hover:text-emerald-600/70 uppercase text-xs tracking-wide">followers</span>
                        </button>
                        <div className="w-px bg-gray-200"></div>
                        <button 
                            onClick={() => onShowFollowing(user)}
                            className="text-center cursor-pointer hover:text-emerald-600 group transition"
                        >
                            <span className="block text-2xl transition-all duration-300 group-hover:scale-110">{user.following.toLocaleString()}</span>
                            <span className="text-gray-400 font-medium group-hover:text-emerald-600/70 uppercase text-xs tracking-wide">following</span>
                        </button>
                        <div className="w-px bg-gray-200"></div>
                        <div className="text-center cursor-pointer hover:text-emerald-600 group transition">
                            <span className="block text-2xl transition-all duration-300 group-hover:scale-110">4.5k</span>
                            <span className="text-gray-400 font-medium group-hover:text-emerald-600/70 uppercase text-xs tracking-wide">monthly views</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-16">
                        <button 
                            onClick={handleFollowToggle}
                            className={`px-10 py-3.5 rounded-full font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 text-lg
                                ${isFollowing 
                                    ? 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50' 
                                    : 'bg-black text-white border-transparent hover:bg-gray-800 hover:shadow-xl'}`}
                        >
                            {isFollowing ? (
                                <>Following <Check size={20} /></>
                            ) : (
                                <>Follow <UserPlus size={20} /></>
                            )}
                        </button>
                        <button className="px-8 py-3.5 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition text-gray-900 flex items-center gap-2">
                            <MessageCircle size={20} /> Message
                        </button>
                        <button className="p-3.5 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-900">
                            <Share2 size={20} />
                        </button>
                        <button className="p-3.5 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-900">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex justify-center gap-8 mb-8 border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('created')}
                        className={`pb-4 font-bold text-lg px-6 transition-all border-b-4 ${activeTab === 'created' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Created
                    </button>
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`pb-4 font-bold text-lg px-6 transition-all border-b-4 ${activeTab === 'saved' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
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
                    <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MoreHorizontal size={32} />
                        </div>
                        <p className="text-lg font-medium">No pins found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
