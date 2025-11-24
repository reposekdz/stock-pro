
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Video, Check, Loader2, Wand2, Plus } from 'lucide-react';
import { User, Pin, Story } from '../types';

interface CreateModalProps {
    onClose: () => void;
    onCreatePin: (pin: Pin) => void;
    onCreateStory: (story: Story) => void;
    user: User;
}

export const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreatePin, onCreateStory, user }) => {
    const [mode, setMode] = useState<'pin' | 'story' | 'ai'>('pin');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleGenerate = () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        // Simulate AI Generation
        setTimeout(() => {
            // Use a random seed based on prompt length
            setPreviewUrl(`https://picsum.photos/seed/${aiPrompt.length + Date.now()}/600/900`);
            setIsGenerating(false);
            setSelectedFile(null); // Clear file if AI is used
        }, 2000);
    };

    const handlePublish = () => {
        if (!previewUrl) return;

        setIsPublishing(true);
        setTimeout(() => {
            if (mode === 'story') {
                const newStory: Story = {
                    id: `story-${Date.now()}`,
                    user: user,
                    imageUrl: previewUrl,
                    timestamp: 'Just now',
                    viewed: false
                };
                onCreateStory(newStory);
            } else {
                // Pin or AI Mode
                const newPin: Pin = {
                    id: `pin-${Date.now()}`,
                    title: title || (mode === 'ai' ? aiPrompt : 'New Creation'),
                    description: description || 'Created with Stoc Pro Studio',
                    imageUrl: previewUrl,
                    width: 600,
                    height: 900, // Assumption for demo
                    tags: ['creative', 'new'],
                    likes: 0,
                    author: user
                };
                onCreatePin(newPin);
            }
            setIsPublishing(false);
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl h-[90vh] md:h-auto md:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition text-gray-800">
                    <X size={24} />
                </button>

                {/* Left Side: Visual Preview / Input */}
                <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-8 border-r border-gray-100 relative overflow-hidden group">
                    {previewUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img src={previewUrl} className="max-h-full max-w-full object-contain rounded-xl shadow-lg" />
                            <button 
                                onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                                className="absolute bottom-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-black transition backdrop-blur-md"
                            >
                                Change Image
                            </button>
                        </div>
                    ) : (
                        mode === 'ai' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                                    <Sparkles className="text-white w-10 h-10 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Creative Spark</h3>
                                <p className="text-gray-500 mb-8 max-w-xs">Describe what you imagine, and our engine will visualize it.</p>
                                <textarea 
                                    className="w-full h-32 bg-white border border-gray-200 rounded-xl p-4 resize-none focus:ring-2 ring-purple-500 outline-none transition shadow-sm mb-4"
                                    placeholder="A futuristic city with hanging gardens..."
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                />
                                <button 
                                    onClick={handleGenerate}
                                    disabled={!aiPrompt || isGenerating}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin"/> : <Wand2 size={18} />}
                                    {isGenerating ? 'Dreaming...' : 'Generate Art'}
                                </button>
                            </div>
                        ) : (
                            <div 
                                className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition hover:border-emerald-400 group/upload"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-transform">
                                    <Upload className="text-emerald-500" size={24} />
                                </div>
                                <p className="font-bold text-gray-700">Click to Upload</p>
                                <p className="text-sm text-gray-400 mt-1">or drag and drop here</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        )
                    )}
                </div>

                {/* Right Side: Details & Controls */}
                <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        Creation Studio <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">Beta</span>
                    </h2>

                    {/* Mode Switcher */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-8">
                        <button 
                            onClick={() => setMode('pin')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                                ${mode === 'pin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ImageIcon size={16} /> Pin
                        </button>
                        <button 
                            onClick={() => setMode('story')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                                ${mode === 'story' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Video size={16} /> Story
                        </button>
                        <button 
                            onClick={() => setMode('ai')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                                ${mode === 'ai' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}
                        >
                            <Sparkles size={16} /> AI Spark
                        </button>
                    </div>

                    {mode !== 'story' && (
                        <div className="space-y-4 mb-auto">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                                <input 
                                    type="text" 
                                    placeholder="Add a title" 
                                    className="w-full text-xl font-bold border-b-2 border-gray-100 py-2 focus:border-emerald-500 outline-none transition bg-transparent placeholder:text-gray-300"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                                <textarea 
                                    placeholder="Tell everyone what your pin is about..." 
                                    className="w-full bg-gray-50 rounded-xl p-4 resize-none h-32 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'story' && (
                        <div className="mb-auto flex flex-col items-center justify-center text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                <Check className="text-emerald-500" />
                            </div>
                            <h4 className="font-bold text-gray-900">Story Mode Active</h4>
                            <p className="text-sm text-gray-600">Your story will be visible for 24 hours.</p>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                        <button onClick={onClose} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-full transition">
                            Cancel
                        </button>
                        <button 
                            onClick={handlePublish}
                            disabled={!previewUrl || isPublishing}
                            className={`px-8 py-3 rounded-full font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95
                                ${!previewUrl ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            {isPublishing ? (
                                <>Publishing <Loader2 className="animate-spin" size={18}/></>
                            ) : (
                                <>Publish {mode === 'story' ? 'Story' : 'Pin'}</>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
