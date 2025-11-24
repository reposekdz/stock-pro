
import React, { useState, useRef } from 'react';
import { Plus, Settings, Share2, Camera, MapPin, Link as LinkIcon, Edit3, X, Globe, Instagram, Twitter } from 'lucide-react';
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
    const [isEditing, setIsEditing] = useState(false);
    const [coverImage, setCoverImage] = useState(user.coverUrl || `https://picsum.photos/seed/${user.username}cover/1600/400`);
    const [avatarImage, setAvatarImage] = useState(user.avatarUrl);
    
    // Edit Form State
    const [editBio, setEditBio] = useState(user.bio || "");
    const [editLocation, setEditLocation] = useState(user.location || "");
    const [editLinks, setEditLinks] = useState(user.links || [{ label: 'Portfolio', url: 'https://portfolio.com' }]);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setCoverImage(url);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setAvatarImage(url);
        }
    };

    const handleSaveProfile = () => {
        // In a real app, this would API call
        setIsEditing(false);
    };

    const addLink = () => {
        setEditLinks([...editLinks, { label: '', url: '' }]);
    };

    const updateLink = (index: number, field: 'label' | 'url', value: string) => {
        const newLinks = [...editLinks];
        newLinks[index][field] = value;
        setEditLinks(newLinks);
    };

    return (
        <div className="flex flex-col items-center w-full pb-12 animate-in fade-in duration-500">
            
            {/* Cover Image Area */}
            <div className="group relative w-full h-64 md:h-80 overflow-hidden bg-gray-100">
                <img src={coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <button 
                        onClick={() => coverInputRef.current?.click()}
                        className="bg-white/20 backdrop-blur-md border border-white/50 text-white px-6 py-2 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2 hover:bg-white hover:text-black"
                    >
                        <Camera size={18} /> Change Cover
                    </button>
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
            </div>

            {/* Profile Info Card */}
            <div className="flex flex-col items-center -mt-20 relative z-10 px-4 w-full max-w-5xl">
                
                {/* Avatar */}
                <div className="relative group cursor-pointer mb-4">
                    <div className="p-1.5 rounded-full bg-white shadow-xl">
                        <img src={avatarImage} alt={user.username} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-50" />
                    </div>
                    <button 
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-2 right-2 p-2.5 bg-gray-900 text-white rounded-full border-4 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                    >
                        <Camera size={16} />
                    </button>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>
                
                <h1 className="text-4xl font-extrabold mb-1 text-gray-900 tracking-tight">{user.username}</h1>
                <p className="text-gray-500 mb-4 font-medium">@stocpro_user</p>
                
                {/* Bio & Details */}
                <div className="text-center max-w-lg mb-6">
                     <p className="text-gray-800 leading-relaxed mb-4">{editBio}</p>
                     
                     <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-gray-500">
                        {editLocation && (
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-gray-400" /> {editLocation}
                            </span>
                        )}
                        {editLinks.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                                <LinkIcon size={14} className="text-gray-400" /> {link.label}
                            </a>
                        ))}
                     </div>
                </div>

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

                <div className="flex gap-3 mb-12">
                    <button className="px-8 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition flex items-center gap-2">
                        <Share2 size={18}/> Share
                    </button>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-lg"
                    >
                        <Edit3 size={18}/> Edit Profile
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-black">Edit Profile</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto scrollbar-thin space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Bio</label>
                                <textarea 
                                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none resize-none h-24 font-medium"
                                    placeholder="Tell your story..."
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text"
                                        className="w-full pl-10 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none font-medium"
                                        placeholder="City, Country"
                                        value={editLocation}
                                        onChange={(e) => setEditLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Links</label>
                                    <button onClick={addLink} className="text-xs font-bold text-emerald-600 hover:underline">+ Add Link</button>
                                </div>
                                {editLinks.map((link, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Label (e.g. Website)" 
                                            className="w-1/3 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm font-bold"
                                            value={link.label}
                                            onChange={(e) => updateLink(i, 'label', e.target.value)}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="URL (https://...)" 
                                            className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm"
                                            value={link.url}
                                            onChange={(e) => updateLink(i, 'url', e.target.value)}
                                        />
                                        <button 
                                            onClick={() => setEditLinks(editLinks.filter((_, idx) => idx !== i))}
                                            className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100">
                            <button 
                                onClick={handleSaveProfile}
                                className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition shadow-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
