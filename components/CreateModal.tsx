
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Video, Check, Loader2, Wand2, Plus, Sliders, Sun, Contrast, Droplet, MapPin, Calendar, Tag, Mic, ChevronDown, Save, Type, Sticker, Music, AlignCenter, Layout, Move, RotateCw, Crop, Smartphone, Layers, GripHorizontal, Palette, Share2, MousePointer2 } from 'lucide-react';
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
    { id: 'none', label: 'Normal', style: '' },
    { id: 'vivid', label: 'Vivid', style: 'contrast(1.2) saturate(1.3)' },
    { id: 'noir', label: 'Noir', style: 'grayscale(1) contrast(1.2)' },
    { id: 'vintage', label: 'Vintage', style: 'sepia(0.5) contrast(0.9)' },
    { id: 'warm', label: 'Warm', style: 'sepia(0.2) saturate(1.2)' },
    { id: 'cool', label: 'Cool', style: 'hue-rotate(180deg) sepia(0.1)' },
    { id: 'dramatic', label: 'Dramatic', style: 'contrast(1.4) brightness(0.9)' },
    { id: 'fade', label: 'Fade', style: 'brightness(1.1) contrast(0.8) sepia(0.1)' },
];

const ASPECT_RATIOS = [
    { id: 'free', label: 'Free', icon: Layout },
    { id: '1:1', label: 'Square', icon: Crop },
    { id: '4:5', label: 'Portrait', icon: Smartphone },
    { id: '16:9', label: 'Landscape', icon: ImageIcon },
];

const MUSIC_TRACKS = [
    { id: '1', title: 'Lo-Fi Chill', duration: '2:30' },
    { id: '2', title: 'Summer Vibes', duration: '3:15' },
    { id: '3', title: 'Electronic Pulse', duration: '2:45' },
    { id: '4', title: 'Acoustic Morning', duration: '1:50' },
];

const EMOJIS = ['🔥', '❤️', '😍', '👏', '🙌', '✨', '🎉', '👀', '💯', '🎨', '🌿', '💻'];

interface StoryLayer {
    id: string;
    type: 'text' | 'sticker' | 'poll';
    content: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    style?: any;
}

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
    const [isAutoCaptioning, setIsAutoCaptioning] = useState(false);

    // Advanced Image Editor State
    const [showEditor, setShowEditor] = useState(false);
    const [editorTab, setEditorTab] = useState<'filters' | 'adjust' | 'crop'>('filters');
    const [editSettings, setEditSettings] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        sepia: 0,
        vignette: 0,
        rotation: 0,
        filter: 'none'
    });
    const [cropRatio, setCropRatio] = useState('free');

    // Story Studio State
    const [storyLayers, setStoryLayers] = useState<StoryLayer[]>([]);
    const [storyMusic, setStoryMusic] = useState<string | null>(null);
    const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
    const [activeStoryTool, setActiveStoryTool] = useState<'text' | 'sticker' | 'music' | 'poll' | null>(null);
    
    // Text Tool State
    const [newText, setNewText] = useState('');
    const [textColor, setTextColor] = useState('#ffffff');
    const [textBg, setTextBg] = useState('transparent');

    // Meta State
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0]?.id || '');
    const [location, setLocation] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');

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
            setMode(mode === 'ai' ? 'pin' : mode); // Switch to editor after gen if desired, or stay
        }, 2000);
    };

    const handleGenerateCaption = () => {
        setIsAutoCaptioning(true);
        setTimeout(() => {
            const captions = [
                "Captured this moment in time. ✨ #vibes",
                "Just another day in paradise. 🌿",
                "Designing the future, one pixel at a time. 🎨",
                "Can't get enough of this aesthetic! 😍"
            ];
            setDescription(captions[Math.floor(Math.random() * captions.length)]);
            setTitle("Visual Story " + Math.floor(Math.random() * 100));
            setIsAutoCaptioning(false);
        }, 1200);
    };

    const handleAutoTag = () => {
        const mockTags = ['aesthetic', 'trending', 'design', 'modern', 'inspiration'];
        setTags(prev => [...new Set([...prev, ...mockTags])]);
    };

    const handlePublish = () => {
        if (!previewUrl) return;

        setIsPublishing(true);
        setTimeout(() => {
            if (mode === 'story') {
                const newStory: Story = {
                    id: `story-${Date.now()}`,
                    user: user,
                    imageUrl: previewUrl, // In a real app, we'd render the layers onto the image
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
                    editSettings: {
                        brightness: editSettings.brightness,
                        contrast: editSettings.contrast,
                        saturation: editSettings.saturation,
                        filter: editSettings.filter
                    }
                };
                onCreatePin(newPin, selectedBoardId);
            }
            setIsPublishing(false);
            onClose();
        }, 1200);
    };

    // --- Story Studio Functions ---

    const addTextLayer = () => {
        if (!newText) return;
        const layer: StoryLayer = {
            id: Date.now().toString(),
            type: 'text',
            content: newText,
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0,
            style: { color: textColor, backgroundColor: textBg, padding: '8px', borderRadius: '8px' }
        };
        setStoryLayers([...storyLayers, layer]);
        setNewText('');
        setActiveStoryTool(null);
    };

    const addStickerLayer = (emoji: string) => {
        const layer: StoryLayer = {
            id: Date.now().toString(),
            type: 'sticker',
            content: emoji,
            x: 50,
            y: 50,
            scale: 2,
            rotation: 0
        };
        setStoryLayers([...storyLayers, layer]);
        setActiveStoryTool(null);
    };

    const addPollLayer = (question: string) => {
        const layer: StoryLayer = {
            id: Date.now().toString(),
            type: 'poll',
            content: question,
            x: 50,
            y: 70,
            scale: 1,
            rotation: 0
        };
        setStoryLayers([...storyLayers, layer]);
        setActiveStoryTool(null);
    };

    const updateLayer = (id: string, updates: Partial<StoryLayer>) => {
        setStoryLayers(storyLayers.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const getPreviewStyle = () => {
        const filterStyle = FILTERS.find(f => f.id === editSettings.filter)?.style || '';
        return {
            filter: `${filterStyle} brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) saturate(${editSettings.saturation}%) blur(${editSettings.blur}px) sepia(${editSettings.sepia}%)`,
            transform: `rotate(${editSettings.rotation}deg)`,
            boxShadow: editSettings.vignette > 0 ? `inset 0 0 ${editSettings.vignette}px black` : 'none'
        };
    };

    const renderAdjustSlider = (label: string, icon: any, key: keyof typeof editSettings, min: number, max: number) => (
        <div className="flex items-center gap-4 mb-4">
            <div className="text-gray-400 w-8">{React.createElement(icon, { size: 18 })}</div>
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-gray-300">{label}</span>
                    <span className="text-xs text-gray-500">{editSettings[key]}</span>
                </div>
                <input 
                    type="range" min={min} max={max}
                    value={editSettings[key] as number}
                    onChange={(e) => setEditSettings({...editSettings, [key]: Number(e.target.value)})}
                    className="w-full accent-emerald-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-7xl h-[95vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative border border-gray-800">
                
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 rounded-full transition text-gray-800">
                    <X size={24} />
                </button>

                {/* LEFT PANEL: Canvas & Preview */}
                <div className="w-full md:w-[60%] bg-[#0F0F0F] flex flex-col relative overflow-hidden group select-none">
                    
                    {/* Top Bar (Pin Mode) */}
                    {previewUrl && mode === 'pin' && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex bg-black/60 backdrop-blur-xl rounded-full p-1 border border-white/10">
                             <button 
                                onClick={() => setShowEditor(false)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition ${!showEditor ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                             >
                                 Preview
                             </button>
                             <button 
                                onClick={() => setShowEditor(true)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition flex items-center gap-2 ${showEditor ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' : 'text-gray-400 hover:text-white'}`}
                             >
                                 <Sliders size={14} /> Editor
                             </button>
                        </div>
                    )}

                    {/* Canvas Area */}
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                        
                        {/* The Image */}
                        {previewUrl ? (
                            <div className="relative shadow-2xl transition-all duration-300 group/canvas" style={{ 
                                aspectRatio: cropRatio === '1:1' ? '1/1' : cropRatio === '4:5' ? '4/5' : cropRatio === '16:9' ? '16/9' : 'auto',
                                maxHeight: '85vh',
                                maxWidth: '100%',
                            }}>
                                <img 
                                    src={previewUrl} 
                                    className="w-full h-full object-contain pointer-events-none" 
                                    style={getPreviewStyle()}
                                />
                                {/* Vignette Overlay */}
                                {editSettings.vignette > 0 && (
                                    <div 
                                        className="absolute inset-0 pointer-events-none" 
                                        style={{ boxShadow: `inset 0 0 ${editSettings.vignette * 2}px rgba(0,0,0,0.8)` }}
                                    ></div>
                                )}

                                {/* Story Layers (Only in Story Mode) */}
                                {mode === 'story' && storyLayers.map(layer => (
                                    <div
                                        key={layer.id}
                                        className="absolute cursor-move group/layer hover:ring-2 ring-emerald-400 rounded-lg p-1"
                                        style={{
                                            left: `${layer.x}%`,
                                            top: `${layer.y}%`,
                                            transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                                            zIndex: 50
                                        }}
                                        onClick={() => setActiveLayerId(layer.id)}
                                    >
                                        {layer.type === 'text' && (
                                            <p className="font-bold text-center whitespace-pre-wrap shadow-sm" style={{ 
                                                fontSize: '24px', 
                                                ...layer.style 
                                            }}>{layer.content}</p>
                                        )}
                                        {layer.type === 'sticker' && (
                                            <div className="text-6xl drop-shadow-md">{layer.content}</div>
                                        )}
                                        {layer.type === 'poll' && (
                                            <div className="bg-white rounded-xl shadow-xl overflow-hidden w-64">
                                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
                                                    <p className="font-bold text-white text-lg text-center">{layer.content}</p>
                                                </div>
                                                <div className="p-2 space-y-2">
                                                    <div className="bg-gray-100 p-2 rounded-lg text-center font-medium text-gray-600 text-sm">Yes</div>
                                                    <div className="bg-gray-100 p-2 rounded-lg text-center font-medium text-gray-600 text-sm">No</div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Layer Controls (Visible on Active) */}
                                        {activeLayerId === layer.id && (
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1 bg-black/80 rounded-full p-1 shadow-xl">
                                                <button onClick={(e) => {e.stopPropagation(); updateLayer(layer.id, {scale: Math.max(0.5, layer.scale - 0.1)})}} className="p-1 hover:bg-white/20 rounded-full text-white"><ChevronDown size={14}/></button>
                                                <button onClick={(e) => {e.stopPropagation(); updateLayer(layer.id, {scale: layer.scale + 0.1})}} className="p-1 hover:bg-white/20 rounded-full text-white"><Plus size={14}/></button>
                                                <button onClick={(e) => {e.stopPropagation(); setStoryLayers(storyLayers.filter(l => l.id !== layer.id))}} className="p-1 hover:bg-red-500 rounded-full text-white"><X size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                             /* Placeholder / AI Input */
                             mode === 'ai' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-gray-900 to-gray-800">
                                    <div className={`w-24 h-24 bg-gradient-to-tr ${selectedAiStyle.color} rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse`}>
                                        <Sparkles className="text-white w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">AI Dream Engine</h3>
                                    <p className="text-gray-400 mb-8 max-w-md text-lg">Select a style and describe your vision.</p>
                                    
                                    <div className="flex gap-3 mb-8 overflow-x-auto w-full justify-center pb-2 px-8">
                                        {AI_STYLES.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setSelectedAiStyle(style)}
                                                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap
                                                    ${selectedAiStyle.id === style.id 
                                                        ? 'bg-white text-black border-white scale-105' 
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
                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition group/upload border-2 border-dashed border-gray-800 hover:border-emerald-500/50 m-8 rounded-3xl"
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

                    {/* Editor Panel (Pin Mode) */}
                    {showEditor && previewUrl && mode === 'pin' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 animate-in slide-in-from-bottom-full flex flex-col max-h-[40%]">
                            {/* Tab Bar */}
                            <div className="flex justify-center border-b border-white/10">
                                <button 
                                    onClick={() => setEditorTab('filters')}
                                    className={`px-8 py-4 font-bold text-sm transition flex items-center gap-2 ${editorTab === 'filters' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-white/5' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Wand2 size={16}/> Filters
                                </button>
                                <button 
                                    onClick={() => setEditorTab('adjust')}
                                    className={`px-8 py-4 font-bold text-sm transition flex items-center gap-2 ${editorTab === 'adjust' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-white/5' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Sliders size={16}/> Adjust
                                </button>
                                <button 
                                    onClick={() => setEditorTab('crop')}
                                    className={`px-8 py-4 font-bold text-sm transition flex items-center gap-2 ${editorTab === 'crop' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-white/5' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Crop size={16}/> Crop & Rotate
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto scrollbar-thin">
                                {editorTab === 'filters' && (
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center">
                                        {FILTERS.map(f => (
                                            <button 
                                                key={f.id}
                                                onClick={() => setEditSettings({...editSettings, filter: f.id})}
                                                className={`flex flex-col items-center gap-2 min-w-[80px] group`}
                                            >
                                                <div className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${editSettings.filter === f.id ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-gray-700 group-hover:border-white'}`}>
                                                    <img src={previewUrl} className="w-full h-full object-cover" style={{ filter: f.style || 'none' }} />
                                                </div>
                                                <span className={`text-xs font-bold ${editSettings.filter === f.id ? 'text-emerald-400' : 'text-gray-500'}`}>{f.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {editorTab === 'adjust' && (
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-3xl mx-auto">
                                        {renderAdjustSlider("Brightness", Sun, "brightness", 50, 150)}
                                        {renderAdjustSlider("Contrast", Contrast, "contrast", 50, 150)}
                                        {renderAdjustSlider("Saturation", Droplet, "saturation", 0, 200)}
                                        {renderAdjustSlider("Blur", Palette, "blur", 0, 10)}
                                        {renderAdjustSlider("Sepia", Wand2, "sepia", 0, 100)}
                                        {renderAdjustSlider("Vignette", MousePointer2, "vignette", 0, 100)}
                                    </div>
                                )}

                                {editorTab === 'crop' && (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex gap-4">
                                            {ASPECT_RATIOS.map(ratio => (
                                                <button 
                                                    key={ratio.id}
                                                    onClick={() => setCropRatio(ratio.id)}
                                                    className={`px-6 py-3 rounded-lg border font-bold text-sm flex items-center gap-2 transition
                                                        ${cropRatio === ratio.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                                >
                                                    <ratio.icon size={16} /> {ratio.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 border-t border-white/10 pt-4 w-full justify-center max-w-md">
                                            <RotateCw className="text-gray-400" size={20} />
                                            <input 
                                                type="range" min="0" max="360" value={editSettings.rotation}
                                                onChange={(e) => setEditSettings({...editSettings, rotation: Number(e.target.value)})}
                                                className="flex-1 accent-emerald-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-gray-400 text-xs font-mono w-8">{editSettings.rotation}°</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: Controls / Form */}
                <div className="w-full md:w-[40%] bg-white flex flex-col h-full border-l border-gray-100">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                         <h2 className="text-xl font-black text-gray-900">
                             {mode === 'story' ? 'Story Studio' : 'Create Pin'}
                         </h2>
                         <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setMode('pin')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${mode === 'pin' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Pin</button>
                            <button onClick={() => setMode('story')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${mode === 'story' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Story</button>
                            <button onClick={() => setMode('ai')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${mode === 'ai' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}>AI</button>
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin relative">
                        {/* STORY MODE TOOLS */}
                        {mode === 'story' ? (
                            <div className="p-6 space-y-8 animate-in slide-in-from-right-4">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Layers</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        <button 
                                            onClick={() => setActiveStoryTool('text')}
                                            className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition ${activeStoryTool === 'text' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-600'}`}
                                        >
                                            <Type size={24} /> <span className="text-xs font-bold">Text</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveStoryTool('sticker')}
                                            className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition ${activeStoryTool === 'sticker' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-600'}`}
                                        >
                                            <Sticker size={24} /> <span className="text-xs font-bold">Sticker</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveStoryTool('music')}
                                            className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition ${activeStoryTool === 'music' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-600'}`}
                                        >
                                            <Music size={24} /> <span className="text-xs font-bold">Music</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveStoryTool('poll')}
                                            className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition ${activeStoryTool === 'poll' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-600'}`}
                                        >
                                            <AlignCenter size={24} /> <span className="text-xs font-bold">Poll</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Active Tool Configuration Area */}
                                <div className="bg-gray-50 rounded-2xl p-6 min-h-[200px]">
                                    {activeStoryTool === 'text' && (
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-900">Add Text</h4>
                                            <input 
                                                type="text" 
                                                placeholder="Type something..."
                                                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500"
                                                value={newText}
                                                onChange={e => setNewText(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
                                                    <button 
                                                        key={c} 
                                                        onClick={() => setTextColor(c)}
                                                        className={`w-8 h-8 rounded-full border-2 ${textColor === c ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                            <button onClick={addTextLayer} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900">Add Text</button>
                                        </div>
                                    )}

                                    {activeStoryTool === 'sticker' && (
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-900">Add Sticker</h4>
                                            <div className="grid grid-cols-6 gap-2">
                                                {EMOJIS.map(emoji => (
                                                    <button 
                                                        key={emoji} 
                                                        onClick={() => addStickerLayer(emoji)}
                                                        className="text-2xl hover:scale-125 transition p-2"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeStoryTool === 'music' && (
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-900">Select Music</h4>
                                            <div className="space-y-2">
                                                {MUSIC_TRACKS.map(track => (
                                                    <div 
                                                        key={track.id} 
                                                        onClick={() => { setStoryMusic(track.id); setActiveStoryTool(null); }}
                                                        className={`p-3 rounded-xl flex justify-between items-center cursor-pointer ${storyMusic === track.id ? 'bg-emerald-100 text-emerald-800' : 'bg-white hover:bg-gray-100'}`}
                                                    >
                                                        <span className="font-bold text-sm">{track.title}</span>
                                                        <span className="text-xs opacity-70">{track.duration}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeStoryTool === 'poll' && (
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-900">Create Poll</h4>
                                            <input 
                                                type="text" 
                                                placeholder="Ask a question..."
                                                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500"
                                                id="poll-question"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const q = (document.getElementById('poll-question') as HTMLInputElement).value;
                                                    if(q) addPollLayer(q);
                                                }} 
                                                className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900"
                                            >
                                                Add Poll
                                            </button>
                                        </div>
                                    )}

                                    {!activeStoryTool && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                            <MousePointer2 size={32} className="mb-2 opacity-50"/>
                                            <p className="text-sm font-medium">Select a tool to add elements</p>
                                        </div>
                                    )}
                                </div>

                                {storyMusic && (
                                    <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-xl text-emerald-800">
                                        <Music size={20} />
                                        <span className="font-bold text-sm flex-1">{MUSIC_TRACKS.find(t => t.id === storyMusic)?.title}</span>
                                        <button onClick={() => setStoryMusic(null)} className="p-1 hover:bg-emerald-100 rounded-full"><X size={14}/></button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* PIN MODE FORM */
                            <div className="p-6 space-y-6 animate-in slide-in-from-right-4">
                                {/* Board Selector */}
                                <div className="space-y-2">
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
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            <button 
                                                onClick={handleGenerateCaption}
                                                disabled={isAutoCaptioning}
                                                className="p-2 bg-white rounded-full text-purple-500 hover:text-purple-600 shadow-sm border border-gray-100 transition disabled:opacity-50"
                                                title="AI Magic Caption"
                                            >
                                                {isAutoCaptioning ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />}
                                            </button>
                                            <button className="p-2 bg-white rounded-full text-gray-400 hover:text-black shadow-sm border border-gray-100 transition" title="Voice Description">
                                                <Mic size={16} />
                                            </button>
                                        </div>
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
                                            onKeyDown={(e) => e.key === 'Enter' && newTag && (setTags([...tags, newTag]), setNewTag(''))}
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
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-4 bg-white">
                        <button className="px-6 py-3.5 font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition flex items-center gap-2 text-sm">
                            <Save size={18} /> Save Draft
                        </button>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-3.5 font-bold text-gray-500 hover:bg-gray-100 rounded-full transition text-sm">
                                Cancel
                            </button>
                            <button 
                                onClick={handlePublish}
                                disabled={(!previewUrl && mode !== 'ai') || isPublishing}
                                className={`px-8 py-3.5 rounded-full font-bold text-white flex items-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 active:translate-y-0 text-sm
                                    ${(!previewUrl && mode !== 'ai') ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
                            >
                                {isPublishing ? (
                                    <>Publishing <Loader2 className="animate-spin" size={18}/></>
                                ) : (
                                    <>{mode === 'story' ? 'Share Story' : 'Publish Pin'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
