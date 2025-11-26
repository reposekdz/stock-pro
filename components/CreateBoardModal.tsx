
import React, { useState } from 'react';
import { X, Lock, Globe, Users, Sparkles, AlignLeft, Check, Image as ImageIcon } from 'lucide-react';

interface CreateBoardModalProps {
    onClose: () => void;
    onCreate: (boardData: { title: string; description: string; isPrivate: boolean; collaborators: string[] }) => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [collaborators, setCollaborators] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        setIsSubmitting(true);
        // Simulate network delay for "powerful" feel
        setTimeout(() => {
            const collabList = collaborators.split(',').map(s => s.trim()).filter(Boolean);
            onCreate({ title, description, isPrivate, collaborators: collabList });
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Create Board</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
                        <input 
                            type="text" 
                            placeholder='e.g., "Dream Home" or "Design Inspo"' 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-lg outline-none focus:ring-2 ring-emerald-500 transition placeholder:font-medium"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Mock Cover Image Selection - Innovation */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Board Cover (Optional)</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition shrink-0">
                                <ImageIcon size={20} className="text-gray-400" />
                            </div>
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 cursor-pointer border-2 border-transparent hover:border-emerald-500 transition">
                                    <img src={`https://picsum.photos/seed/boardcover${i}/100/100`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-4 top-4 text-gray-400" size={18} />
                            <textarea 
                                placeholder="What's this board about?" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 font-medium outline-none focus:ring-2 ring-emerald-500 transition resize-none h-24"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Collaborators</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Enter emails or usernames, comma separated" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 font-medium outline-none focus:ring-2 ring-emerald-500 transition"
                                value={collaborators}
                                onChange={(e) => setCollaborators(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition" onClick={() => setIsPrivate(!isPrivate)}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isPrivate ? 'bg-black text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                {isPrivate ? <Lock size={20} /> : <Globe size={20} />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{isPrivate ? 'Keep this board secret' : 'Public Board'}</p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {isPrivate ? 'Only you and collaborators can see this.' : 'Visible to everyone on your profile.'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full transition-colors relative ${isPrivate ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isPrivate ? 'left-6' : 'left-1'}`}></div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={!title.trim() || isSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isSubmitting ? (
                            <>Creating <Sparkles size={18} className="animate-spin" /></>
                        ) : (
                            <>Create Board <Check size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
