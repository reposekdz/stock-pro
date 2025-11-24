
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Video, Check, Loader2, Wand2, Plus, Sliders, Sun, Contrast, Droplet, MapPin, Calendar, Tag, Mic, ChevronDown, Save } from 'lucide-react';
import { User, Pin, Story, Board, ImageEditSettings } from '../types';

interface CreateModalProps {
    onClose: () => void;
    onCreatePin: (pin: Pin, boardId?: string) => void;
    onCreateStory: (story: Story) => void;
    user: User;
    boards: Board[];
}

const AI_STYLES = [
    { id: 'realistic', label: 'Realistic', color: 'from-blue-400 to-indigo-500' },
    { id: 'cyberpunk', label: 'Cyberpunk', color: 'from-pink-500 to-rose-500' },
    { id: 'watercolor', label: 'Watercolor', color: 'from-emerald-400 to-teal-500' },
    { id: '3d-render', label: '3D Render', color: 'from-purple-500 to-violet-500' },
    { id: 'anime', label: 'Anime', color: 'from-orange-400 to-amber-500' },
];

const FILTERS = [
    { id: 'none', label: 'Normal' },
    { id: 'vivid', label: 'Vivid', style: 'contrast(1.2) saturate(1.3)' },
    { id: 'noir', label: 'Noir', style: 'grayscale(1) contrast(1.2)' },
    { id: 'vintage', label: 'Vintage', style: 'sepia(0.5) contrast(0.9)' },
    { id: 'warm', label: 'Warm', style: 'sepia(0.2) saturate(1.2)' },
    { id: 'cool', label: 'Cool', style: 'hue-rotate(180deg) sepia(0.1)' },
];

export const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreatePin, onCreateStory, user, boards }) => {
    const [mode, setMode] = useState<'pin' | 'story' | 'ai'>('pin');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    
    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedAiStyle, setSelectedAiStyle] = useState(AI_STYLES[0]);

    // Editing State
    const [showEditor, setShowEditor] = useState(false);
    const [editSettings, setEditSettings] = useState<ImageEditSettings>({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        filter: 'none'
    });
    const [activeEditTab, setActiveEditTab] = useState<'filters' | 'adjust'>('filters');

    // Meta State
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0]?.id || '');
    const [location, setLocation] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

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
        setTimeout(() => {
            setPreviewUrl(`https://picsum.photos/seed/${aiPrompt.length + Date.now()}/600/900`);
            setIsGenerating(false);
            setSelectedFile(null);
        }, 2000);
    };

    const handleAutoTag = () => {
        // Simulate AI Vision analysis
        const mockTags = ['aesthetic', 'trending', 'design', 'modern', selectedAiStyle.id];
        setTags(prev => [...new Set([...prev, ...mockTags])]);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handlePublish = (asDraft: boolean = false) => {
        if (!previewUrl) return;

        if (asDraft) setIsDrafting(true);
        else setIsPublishing(true);

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
                const newPin: Pin = {
                    id: `pin-${Date.now()}`,
                    title: title || (mode === 'ai' ? aiPrompt : 'New Creation'),
                    description: description || 'Created with Stoc Pro Studio',
                    imageUrl: previewUrl,
                    width: 600,
                    height: 900,
                    tags: tags.length > 0 ? tags : ['creative', 'new'],
                    likes: 0,
                    author: user,
                    location: location,
                    scheduledFor: isScheduled ? scheduleDate : undefined,
                    editSettings: editSettings
                };
                onCreatePin(newPin, selectedBoardId);
            }
            setIsPublishing(false);
            setIsDrafting(false);
            onClose();
        }, 1200);
    };

    const getPreviewStyle = () => {
        const filterStyle = FILTERS.find(f => f.id === editSettings.filter)?.style || '';
        return {
            filter: `${filterStyle} brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) saturate(${editSettings.saturation}%)`
        };
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-[95vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 rounded-full transition text-gray-800">
                    <X size={24} />
                </button>

                {/* Left Side: Visual Preview / Editor */}
                <div className="w-full md:w-[55%] bg-gray-900 flex flex-col relative overflow-hidden group">
                    
                    {/* Toolbar */}
                    {previewUrl && (
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                             <button 
                                onClick={() => setShowEditor(!showEditor)}
                                className={`px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md transition flex items-center gap-2
                                    ${showEditor ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}
                             >
                                 <Sliders size={16} /> Edit Image
                             </button>
                        </div>
                    )}

                    {/* Main Canvas */}
                    <div className="flex-1 flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        {previewUrl ? (
                            <img 
                                src={previewUrl} 
                                className="max-h-[85vh] max-w-full object-contain shadow-2xl transition-all duration-300" 
                                style={getPreviewStyle()}
                            />
                        ) : (
                             /* Placeholder / AI Input */
                             mode === 'ai' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-gray-900 to-gray-800">
                                    <div className={`w-24 h-24 bg-gradient-to-tr ${selectedAiStyle.color} rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse`}>
                                        <Sparkles className="text-white w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">AI Dream Engine</h3>
                                    <p className="text-gray-400 mb-8 max-w-md text-lg">Select a style and describe your vision.</p>
                                    
                                    <div className="flex gap-3 mb-8 overflow-x-auto w-full justify-center pb-2">
                                        {AI_STYLES.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setSelectedAiStyle(style)}
                                                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap
                                                    ${selectedAiStyle.id === style.id 
                                                        ? 'bg-white text-black border-white' 
                                                        : 'bg-transparent text-gray-400 border-gray-600 hover:border-white hover:text-white'}`}
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea 
                                        className="w-full max-w-lg h-32 bg-black/30 border border-gray-700 rounded-2xl p-6 resize-none focus:ring-2 ring-emerald-500 outline-none transition text-white placeholder:text-gray-600 text-lg shadow-inner mb-6"
                                        placeholder="A futuristic city with hanging gardens..."
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleGenerate}
                                        disabled={!aiPrompt || isGenerating}
                                        className="w-full max-w-lg py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-lg shadow-emerald-900/50"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                                        {isGenerating ? 'Synthesizing...' : 'Generate Artwork'}
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition group/upload"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-24 h-24 bg-gray-800 rounded-full shadow-lg flex items-center justify-center mb-6 group-hover/upload:scale-110 transition-transform group-hover/upload:bg-gray-700">
                                        <Upload className="text-emerald-400" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Drag and drop</h3>
                                    <p className="text-gray-400">or click to browse your files</p>
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

                    {/* Editor Overlay Panel */}
                    {showEditor && previewUrl && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 animate-in slide-in-from-bottom-full">
                            <div className="flex justify-center gap-8 mb-6 border-b border-white/10 pb-4">
                                <button 
                                    onClick={() => setActiveEditTab('filters')}
                                    className={`pb-2 font-bold text-sm transition ${activeEditTab === 'filters' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400'}`}
                                >
                                    Filters
                                </button>
                                <button 
                                    onClick={() => setActiveEditTab('adjust')}
                                    className={`pb-2 font-bold text-sm transition ${activeEditTab === 'adjust' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400'}`}
                                >
                                    Adjust
                                </button>
                            </div>

                            {activeEditTab === 'filters' ? (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
                                    {FILTERS.map(f => (
                                        <button 
                                            key={f.id}
                                            onClick={() => setEditSettings({...editSettings, filter: f.id})}
                                            className={`flex flex-col items-center gap-2 min-w-[70px] group`}
                                        >
                                            <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${editSettings.filter === f.id ? 'border-emerald-500' : 'border-transparent group-hover:border-white/30'}`}>
                                                <img src={previewUrl} className="w-full h-full object-cover" style={{ filter: f.style || 'none' }} />
                                            </div>
                                            <span className={`text-xs font-medium ${editSettings.filter === f.id ? 'text-emerald-400' : 'text-gray-500'}`}>{f.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Sun size={18} className="text-gray-400" />
                                        <input 
                                            type="range" min="50" max="150" 
                                            value={editSettings.brightness}
                                            onChange={(e) => setEditSettings({...editSettings, brightness: Number(e.target.value)})}
                                            className="flex-1 accent-emerald-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Contrast size={18} className="text-gray-400" />
                                        <input 
                                            type="range" min="50" max="150" 
                                            value={editSettings.contrast}
                                            onChange={(e) => setEditSettings({...editSettings, contrast: Number(e.target.value)})}
                                            className="flex-1 accent-emerald-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Droplet size={18} className="text-gray-400" />
                                        <input 
                                            type="range" min="0" max="200" 
                                            value={editSettings.saturation}
                                            onChange={(e) => setEditSettings({...editSettings, saturation: Number(e.target.value)})}
                                            className="flex-1 accent-emerald-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Details & Controls */}
                <div className="w-full md:w-[45%] bg-white p-8 flex flex-col h-full overflow-y-auto scrollbar-thin">
                    <div className="flex items-center justify-between mb-8">
                         <h2 className="text-2xl font-black text-gray-900">Create</h2>
                         <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setMode('pin')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${mode === 'pin' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Pin</button>
                            <button onClick={() => setMode('story')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${mode === 'story' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Story</button>
                            <button onClick={() => setMode('ai')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${mode === 'ai' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}>AI</button>
                         </div>
                    </div>

                    {mode !== 'story' && (
                        <div className="space-y-6">
                            
                            {/* Board Selector */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Publish to</label>
                                <div className="relative group">
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 appearance-none cursor-pointer hover:bg-gray-100 transition"
                                        value={selectedBoardId}
                                        onChange={(e) => setSelectedBoardId(e.target.value)}
                                    >
                                        {boards.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Add a title" 
                                    className="w-full text-3xl font-bold border-b border-gray-200 py-2 focus:border-black outline-none transition placeholder:text-gray-300"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                
                                <div className="relative">
                                    <textarea 
                                        placeholder="What is this pin about?" 
                                        className="w-full bg-gray-50 rounded-xl p-4 pr-12 resize-none h-32 outline-none focus:ring-2 focus:ring-emerald-100 transition text-gray-700"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    <button className="absolute bottom-4 right-4 p-2 bg-white rounded-full text-gray-400 hover:text-black shadow-sm border border-gray-100 transition" title="Voice Description">
                                        <Mic size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Meta */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex gap-2 items-center">
                                    <Tag size={16} className="text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Add tags..." 
                                        className="flex-1 outline-none text-sm font-medium"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={handleAddTag}
                                    />
                                    <button 
                                        onClick={handleAutoTag}
                                        className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition flex items-center gap-1"
                                    >
                                        <Sparkles size={12} /> Auto-Tag
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 flex items-center gap-1">
                                            #{tag}
                                            <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="hover:text-red-500"><X size={12}/></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <MapPin size={18} className="text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Add location" 
                                    className="flex-1 outline-none text-sm font-medium"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                             <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-500">Schedule Publish</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setIsScheduled(!isScheduled)}
                                        className={`w-10 h-6 rounded-full transition-colors relative ${isScheduled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isScheduled ? 'left-5' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                            {isScheduled && (
                                <input 
                                    type="datetime-local" 
                                    className="w-full bg-gray-50 p-3 rounded-xl text-sm font-bold text-gray-600 outline-none"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                />
                            )}
                        </div>
                    )}

                    {mode === 'story' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-emerald-50 to-white rounded-3xl border border-emerald-100/50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md ring-4 ring-emerald-50">
                                <Check className="text-emerald-500" size={32} strokeWidth={3} />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 mb-2">Story Mode Active</h4>
                            <p className="text-gray-500 max-w-xs mx-auto mb-8">Your story will be shared instantly and visible for 24 hours to your followers.</p>
                            
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                <Video size={14} /> Vertical Format Recommended
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-8 flex items-center justify-between gap-4">
                        <button 
                            onClick={() => handlePublish(true)}
                            className="px-6 py-3.5 font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition flex items-center gap-2"
                        >
                            <Save size={18} /> Save Draft
                        </button>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-3.5 font-bold text-gray-500 hover:bg-gray-100 rounded-full transition">
                                Cancel
                            </button>
                            <button 
                                onClick={() => handlePublish(false)}
                                disabled={(!previewUrl && mode !== 'ai') || isPublishing}
                                className={`px-8 py-3.5 rounded-full font-bold text-white flex items-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 active:translate-y-0
                                    ${(!previewUrl && mode !== 'ai') ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
                            >
                                {isPublishing ? (
                                    <>Publishing <Loader2 className="animate-spin" size={18}/></>
                                ) : (
                                    <>Publish</>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
