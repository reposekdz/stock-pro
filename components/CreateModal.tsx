
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Video, Check, Loader2, Wand2, Plus, Sliders, Sun, Contrast, Droplet, MapPin, Calendar, Tag, Mic, ChevronDown, Save, Type, Sticker, Music, AlignCenter, Layout, Move, RotateCw, Crop, Smartphone, Layers, GripHorizontal, Palette, Share2, MousePointer2, Scissors, FastForward, PlayCircle, PauseCircle, Film, ShoppingBag, DollarSign, Lock, Trash2, Type as TypeIcon, Circle, Square, Subtitles, Play, RotateCcw, Monitor, Megaphone, Ratio, Volume2, Gauge, Activity } from 'lucide-react';
import { User, Pin, Story, Board, ImageEditSettings, Product } from '../types';

interface CreateModalProps {
    onClose: () => void;
    onCreatePin: (pin: Pin, boardId?: string) => void;
    onCreateStory: (story: Story) => void;
    user: User;
    boards: Board[];
}

// Canvas Item Type for Draggable Elements
interface CanvasItem {
    id: string;
    type: 'text' | 'sticker';
    content: string;
    x: number;
    y: number;
    color?: string;
    fontSize?: number;
    rotation: number;
    scale: number;
}

const FILTERS = [
    { id: 'none', label: 'Normal', style: '' },
    { id: 'vivid', label: 'Vivid', style: 'contrast(1.2) saturate(1.3)' },
    { id: 'noir', label: 'Noir', style: 'grayscale(1) contrast(1.2)' },
    { id: 'vintage', label: 'Vintage', style: 'sepia(0.5) contrast(0.9)' },
    { id: 'cinematic', label: 'Cinematic', style: 'contrast(1.1) saturate(0.8) brightness(0.9) sepia(0.2)' },
    { id: 'warm', label: 'Warm', style: 'sepia(0.2) saturate(1.2)' },
    { id: 'cool', label: 'Cool', style: 'hue-rotate(180deg) sepia(0.1)' },
    { id: 'dramatic', label: 'Dramatic', style: 'contrast(1.4) brightness(0.9)' },
];

const STICKERS = ['🔥', '✨', '🌿', '💯', '❤️', '🎉', '👀', '🚀', '🎨', '👋', '💎', '👑'];

const ASPECT_RATIOS = [
    { id: 'free', label: 'Free', value: 'auto' },
    { id: '1:1', label: 'Square', value: '1 / 1' },
    { id: '4:5', label: 'Portrait', value: '4 / 5' },
    { id: '16:9', label: 'Wide', value: '16 / 9' },
    { id: '9:16', label: 'Story', value: '9 / 16' },
];

const VIDEO_SPEEDS = [0.5, 1, 1.5, 2, 4];

const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Ceramic Vase', price: 45, currency: '$', imageUrl: 'https://picsum.photos/seed/vase/100/100', affiliateLink: '#' },
    { id: 'p2', name: 'Linen Throw', price: 89, currency: '$', imageUrl: 'https://picsum.photos/seed/linen/100/100', affiliateLink: '#' },
    { id: 'p3', name: 'Table Lamp', price: 120, currency: '$', imageUrl: 'https://picsum.photos/seed/lamp/100/100', affiliateLink: '#' },
    { id: 'p4', name: 'Velvet Chair', price: 299, currency: '$', imageUrl: 'https://picsum.photos/seed/chair/100/100', affiliateLink: '#' },
];

export const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreatePin, onCreateStory, user, boards }) => {
    const [mode, setMode] = useState<'pin' | 'story' | 'video' | 'ai'>('pin');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    
    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Pro Studio State
    const [activeTool, setActiveTool] = useState<'canvas' | 'filters' | 'adjust' | 'text' | 'stickers' | 'crop' | 'trim' | 'speed' | 'volume'>('canvas');
    const [editSettings, setEditSettings] = useState<ImageEditSettings>({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        filter: 'none',
        rotation: 0,
        scale: 1,
        cropX: 0,
        cropY: 0,
        aspectRatio: 'auto'
    });
    
    // Additional view settings
    const [blur, setBlur] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [vignette, setVignette] = useState(0);

    // Video Editing Settings
    const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [volume, setVolume] = useState(100);
    const [isSceneDetecting, setIsSceneDetecting] = useState(false);

    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [isPanningImage, setIsPanningImage] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
    
    // Video State
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [generatingCaptions, setGeneratingCaptions] = useState(false);
    const [captions, setCaptions] = useState<string[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Monetization State
    const [taggedProducts, setTaggedProducts] = useState<Product[]>([]);
    const [isExclusive, setIsExclusive] = useState(false);
    const [adsEnabled, setAdsEnabled] = useState(true);
    const [isPromoted, setIsPromoted] = useState(false);
    const [showProductPicker, setShowProductPicker] = useState(false);

    // Meta State
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0]?.id || '');
    const [location, setLocation] = useState('');

    // Text Tool State
    const [newText, setNewText] = useState('Add Text');
    const [textColor, setTextColor] = useState('#ffffff');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            if(file.type.startsWith('video')) setMode('video');
        }
    };

    const handleGenerate = () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        setTimeout(() => {
            setPreviewUrl(`https://picsum.photos/seed/${aiPrompt.length + Date.now()}/600/900`);
            setIsGenerating(false);
            setSelectedFile(null);
            setMode(mode === 'ai' ? 'pin' : mode);
        }, 2000);
    };

    const handleGenerateCaptions = () => {
        setGeneratingCaptions(true);
        setTimeout(() => {
            setCaptions(["Welcome to my new video!", "Today we are exploring design."]);
            setGeneratingCaptions(false);
            addCanvasItem('text', "Welcome to my new video!");
        }, 1500);
    };

    const handleSceneDetect = () => {
        setIsSceneDetecting(true);
        setTimeout(() => {
            setIsSceneDetecting(false);
            // In a real app, this would chop the video or add markers
            alert("Smart Scene Detection: 3 scenes found. Transitions optimized.");
        }, 2000);
    };

    const addCanvasItem = (type: 'text' | 'sticker', content: string) => {
        const newItem: CanvasItem = {
            id: `item-${Date.now()}`,
            type,
            content,
            x: 50, // Percentage
            y: 50, // Percentage
            color: type === 'text' ? textColor : undefined,
            rotation: 0,
            scale: 1
        };
        setCanvasItems([...canvasItems, newItem]);
        setActiveTool('canvas'); // Switch back to move mode
    };

    const removeCanvasItem = (id: string) => {
        setCanvasItems(canvasItems.filter(i => i.id !== id));
    };

    // Drag Logic for Canvas Items & Image Panning
    const handleMouseDown = (e: React.MouseEvent, id?: string) => {
        if (id) {
            // Dragging a sticker/text
            e.stopPropagation();
            setDraggingItemId(id);
        } else if (activeTool === 'crop') {
            // Panning the image
            setIsPanningImage(true);
            setLastPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();

        // Handle Image Panning (Crop Mode)
        if (isPanningImage && activeTool === 'crop') {
            const dx = e.clientX - lastPanPoint.x;
            const dy = e.clientY - lastPanPoint.y;
            
            // Convert pixels to percentage relative to container
            const percentX = (dx / rect.width) * 100;
            const percentY = (dy / rect.height) * 100;

            setEditSettings(prev => ({
                ...prev,
                cropX: prev.cropX + percentX,
                cropY: prev.cropY + percentY
            }));
            
            setLastPanPoint({ x: e.clientX, y: e.clientY });
            return;
        }

        // Handle Canvas Item Dragging
        if (draggingItemId) {
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            setCanvasItems(items => items.map(item => {
                if (item.id === draggingItemId) {
                    return { ...item, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
                }
                return item;
            }));
        }
    };

    const handleMouseUp = () => {
        setDraggingItemId(null);
        setIsPanningImage(false);
    };

    const toggleProductTag = (product: Product) => {
        if(taggedProducts.find(p => p.id === product.id)) {
            setTaggedProducts(prev => prev.filter(p => p.id !== product.id));
        } else {
            setTaggedProducts(prev => [...prev, product]);
        }
    };

    const handleMagicEnhance = () => {
        setEditSettings(prev => ({
            ...prev,
            brightness: 110,
            contrast: 115,
            saturation: 120,
            filter: 'none'
        }));
    };

    const handlePublish = () => {
        if (!previewUrl) return;

        setIsPublishing(true);
        setTimeout(() => {
            if (mode === 'story' || mode === 'video') {
                const newStory: Story = {
                    id: `story-${Date.now()}`,
                    user: user,
                    imageUrl: previewUrl, 
                    videoUrl: mode === 'video' ? previewUrl : undefined,
                    timestamp: 'Just now',
                    viewed: false,
                    products: taggedProducts,
                    isExclusive: isExclusive
                };
                onCreateStory(newStory);
            } else {
                const newPin: Pin = {
                    id: `pin-${Date.now()}`,
                    title: title || 'New Creation',
                    description: description || 'Created with Stoc Pro Studio',
                    imageUrl: previewUrl,
                    videoUrl: mode === 'video' ? previewUrl : undefined,
                    type: mode === 'video' ? 'video' : 'image',
                    width: 600,
                    height: 900,
                    tags: tags.length > 0 ? tags : ['creative'],
                    likes: 0,
                    author: user,
                    location: location,
                    editSettings: {
                        ...editSettings
                    },
                    taggedProducts: taggedProducts,
                    isExclusive: isExclusive,
                    monetization: {
                        adsEnabled: adsEnabled,
                        isSubscriberOnly: isExclusive,
                        isPromoted: isPromoted
                    }
                };
                onCreatePin(newPin, selectedBoardId);
            }
            setIsPublishing(false);
            onClose();
        }, 1200);
    };

    const getPreviewStyle = () => {
        const filterStyle = FILTERS.find(f => f.id === editSettings.filter)?.style || '';
        return {
            filter: `${filterStyle} brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) saturate(${editSettings.saturation}%) blur(${blur}px) sepia(${sepia}%)`,
            transform: `translate(${editSettings.cropX}%, ${editSettings.cropY}%) rotate(${editSettings.rotation}deg) scale(${editSettings.scale})`,
            boxShadow: vignette > 0 ? `inset 0 0 ${vignette}px black` : 'none',
            transformOrigin: 'center center'
        };
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
            videoRef.current.volume = volume / 100;
        }
    }, [playbackSpeed, volume]);

    const toggleVideoPlay = () => {
        if (videoRef.current) {
            if (isVideoPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsVideoPlaying(!isVideoPlaying);
        }
    };

    // Render Tools Panel Content
    const renderToolsPanel = () => {
        switch (activeTool) {
            case 'trim':
                 return (
                    <div className="p-4 space-y-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Trim & Cut</h3>
                        <div className="space-y-4">
                            <div className="h-12 bg-gray-100 rounded-lg relative overflow-hidden flex items-center px-2">
                                {/* Visual representation of video frames would go here */}
                                <div className="absolute inset-y-0 bg-emerald-500/20" style={{ left: `${trimRange[0]}%`, right: `${100 - trimRange[1]}%` }}></div>
                                <div className="absolute top-0 bottom-0 w-4 bg-emerald-500 rounded-l cursor-ew-resize" style={{ left: `${trimRange[0]}%` }}></div>
                                <div className="absolute top-0 bottom-0 w-4 bg-emerald-500 rounded-r cursor-ew-resize" style={{ left: `${trimRange[1]}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span>{Math.floor((trimRange[0] / 100) * 10)}s</span>
                                <span>{Math.floor((trimRange[1] / 100) * 10)}s</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={trimRange[0]} 
                                onChange={(e) => setTrimRange([Number(e.target.value), trimRange[1]])}
                                className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                             <input 
                                type="range" 
                                min="0" max="100" 
                                value={trimRange[1]} 
                                onChange={(e) => setTrimRange([trimRange[0], Number(e.target.value)])}
                                className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <button 
                            onClick={handleSceneDetect}
                            className="w-full py-3 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-200 transition"
                        >
                            {isSceneDetecting ? <Loader2 className="animate-spin" size={16}/> : <Activity size={16}/>}
                            Smart Scene Detect
                        </button>
                    </div>
                 );
            case 'speed':
                return (
                    <div className="p-4 space-y-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Playback Speed</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {VIDEO_SPEEDS.map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={`py-3 rounded-xl font-bold text-sm transition ${playbackSpeed === speed ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 text-center">Adjusting speed will affect audio pitch unless preserved.</p>
                    </div>
                );
            case 'volume':
                return (
                     <div className="p-4 space-y-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Volume Mixer</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span className="flex items-center gap-1"><Volume2 size={14}/> Video Sound</span>
                                <span>{volume}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="200" 
                                value={volume} 
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <button className="w-full py-3 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                            <Music size={16}/> Add Background Music
                        </button>
                    </div>
                );
            case 'crop':
                return (
                    <div className="p-4 space-y-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Crop & Rotate</h3>
                        
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-900">Aspect Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map(ar => (
                                    <button
                                        key={ar.id}
                                        onClick={() => setEditSettings({...editSettings, aspectRatio: ar.value})}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition ${editSettings.aspectRatio === ar.value ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                    >
                                        {ar.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                             <label className="text-xs font-bold text-gray-900">Geometry</label>
                             <div className="flex gap-2">
                                 <button 
                                    onClick={() => setEditSettings(p => ({...p, rotation: p.rotation - 90}))}
                                    className="flex-1 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center"
                                    title="Rotate Left"
                                 >
                                     <RotateCcw size={18}/>
                                 </button>
                                 <button 
                                    onClick={() => setEditSettings(p => ({...p, rotation: p.rotation + 90}))}
                                    className="flex-1 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center"
                                    title="Rotate Right"
                                 >
                                     <RotateCw size={18}/>
                                 </button>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span className="flex items-center gap-1">Scale / Zoom</span>
                                <span>{Math.round(editSettings.scale * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="3" 
                                step="0.1"
                                value={editSettings.scale} 
                                onChange={(e) => setEditSettings({...editSettings, scale: parseFloat(e.target.value)})}
                                className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        
                        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium flex items-start gap-2">
                            <Move size={14} className="mt-0.5 flex-shrink-0"/>
                            Drag the image on the canvas to pan and adjust crop position.
                        </div>
                    </div>
                );
            case 'filters':
                return (
                    <div className="p-4 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Filters</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {FILTERS.map(f => (
                                <button 
                                    key={f.id}
                                    onClick={() => setEditSettings({...editSettings, filter: f.id})}
                                    className={`flex flex-col items-center gap-2 group`}
                                >
                                    <div className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition ${editSettings.filter === f.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200 group-hover:border-gray-400'}`}>
                                        <div className="w-full h-full bg-gray-300" style={{ filter: f.style, backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover' }}></div> 
                                    </div>
                                    <span className={`text-[10px] font-bold ${editSettings.filter === f.id ? 'text-emerald-600' : 'text-gray-500'}`}>{f.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'adjust':
                return (
                    <div className="p-4 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-500 uppercase">Adjustments</h3>
                            <button 
                                onClick={handleMagicEnhance}
                                className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1 rounded-full flex items-center gap-1 hover:shadow-md transition"
                            >
                                <Wand2 size={10} /> Magic Fix
                            </button>
                        </div>
                        
                        {[
                            { label: 'Brightness', key: 'brightness', min: 50, max: 150, icon: Sun },
                            { label: 'Contrast', key: 'contrast', min: 50, max: 150, icon: Contrast },
                            { label: 'Saturation', key: 'saturation', min: 0, max: 200, icon: Droplet },
                        ].map((adj: any) => (
                            <div key={adj.key} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-gray-600">
                                    <span className="flex items-center gap-1"><adj.icon size={12}/> {adj.label}</span>
                                    <span>{editSettings[adj.key as keyof typeof editSettings]}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={adj.min} 
                                    max={adj.max} 
                                    value={editSettings[adj.key as keyof typeof editSettings]} 
                                    onChange={(e) => setEditSettings({...editSettings, [adj.key]: parseFloat(e.target.value)})}
                                    className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        ))}

                         <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span className="flex items-center gap-1"><Sparkles size={12}/> Blur</span>
                                <span>{blur}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                value={blur} 
                                onChange={(e) => setBlur(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                         <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span className="flex items-center gap-1"><Circle size={12}/> Vignette</span>
                                <span>{vignette}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={vignette} 
                                onChange={(e) => setVignette(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                );
            case 'text':
                return (
                    <div className="p-4 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Add Text</h3>
                        <input 
                            type="text" 
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-500"
                        />
                        <div className="flex gap-2">
                            {['#ffffff', '#000000', '#ef4444', '#10b981', '#3b82f6', '#f59e0b'].map(color => (
                                <button 
                                    key={color}
                                    onClick={() => setTextColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition ${textColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <button 
                            onClick={() => addCanvasItem('text', newText)}
                            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition"
                        >
                            Add to Canvas
                        </button>
                    </div>
                );
            case 'stickers':
                return (
                    <div className="p-4 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Stickers</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {STICKERS.map(s => (
                                <button 
                                    key={s}
                                    onClick={() => addCanvasItem('sticker', s)}
                                    className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition hover:scale-110"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="p-4 flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
                        <MousePointer2 size={32} className="opacity-20"/>
                        <p className="text-sm font-medium">Select a tool to edit</p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full h-full md:max-w-[1600px] md:h-[95vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 rounded-full transition text-black">
                    <X size={24} />
                </button>

                {/* LEFT TOOLBAR */}
                <div className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-4 z-20">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4 shadow-lg">
                        <Wand2 size={20} />
                    </div>
                    <div className="flex-1 flex flex-col gap-2 w-full px-2">
                        <button 
                            onClick={() => setActiveTool('canvas')}
                            className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition ${activeTool === 'canvas' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <MousePointer2 size={20} className="mb-1"/>
                            <span className="text-[9px] font-bold uppercase">Move</span>
                        </button>
                        
                        {mode === 'video' && (
                            <>
                                <button 
                                    onClick={() => setActiveTool('trim')}
                                    className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition ${activeTool === 'trim' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Scissors size={20} className="mb-1"/>
                                    <span className="text-[9px] font-bold uppercase">Trim</span>
                                </button>
                                 <button 
                                    onClick={() => setActiveTool('speed')}
                                    className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition ${activeTool === 'speed' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Gauge size={20} className="mb-1"/>
                                    <span className="text-[9px] font-bold uppercase">Speed</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTool('volume')}
                                    className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition ${activeTool === 'volume' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Volume2 size={20} className="mb-1"/>
                                    <span className="text-[9px] font-bold uppercase">Vol</span>
                                </button>
                            </>
                        )}

                        {[
                            { id: 'crop', icon: Crop, label: 'Crop' },
                            { id: 'filters', icon: Palette, label: 'Filters' },
                            { id: 'adjust', icon: Sliders, label: 'Adjust' },
                            { id: 'text', icon: TypeIcon, label: 'Text' },
                            { id: 'stickers', icon: Sticker, label: 'Stickers' },
                        ].map(tool => (
                            <button 
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id as any)}
                                className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition ${activeTool === tool.id ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <tool.icon size={20} className="mb-1"/>
                                <span className="text-[9px] font-bold uppercase">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SUB-TOOLBAR (Dynamic) */}
                <div className="w-64 bg-white border-r border-gray-100 flex flex-col z-10">
                    <div className="p-4 border-b border-gray-100">
                         <h2 className="font-black text-lg">Studio</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {renderToolsPanel()}
                    </div>
                </div>

                {/* CENTER CANVAS */}
                <div className="flex-1 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    {previewUrl ? (
                        <div 
                            ref={canvasRef}
                            className="relative shadow-2xl transition-all duration-300 group/canvas overflow-hidden select-none bg-black"
                            style={{ 
                                aspectRatio: editSettings.aspectRatio !== 'auto' ? editSettings.aspectRatio : 'auto',
                                width: editSettings.aspectRatio !== 'auto' ? 'auto' : '100%',
                                height: editSettings.aspectRatio !== 'auto' ? '80%' : 'auto',
                                maxHeight: '90vh',
                                maxWidth: '90%',
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {/* The Image Itself */}
                            {mode === 'video' ? (
                                <video 
                                    ref={videoRef}
                                    src={previewUrl}
                                    className="w-full h-full object-cover pointer-events-none"
                                    style={getPreviewStyle()}
                                    loop
                                    onClick={toggleVideoPlay}
                                />
                            ) : (
                                <img 
                                    src={previewUrl} 
                                    className="w-full h-full object-cover pointer-events-none" 
                                    style={getPreviewStyle()}
                                    draggable={false}
                                />
                            )}
                            
                            {/* Invisible interaction layer for cropping */}
                            {activeTool === 'crop' && (
                                <div 
                                    className="absolute inset-0 cursor-move z-20 border-2 border-white/50"
                                    onMouseDown={(e) => handleMouseDown(e)}
                                >
                                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>
                                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>
                                </div>
                            )}

                            {/* Overlays */}
                            {canvasItems.map(item => (
                                <div
                                    key={item.id}
                                    className="absolute cursor-move group/item z-30"
                                    style={{
                                        left: `${item.x}%`,
                                        top: `${item.y}%`,
                                        transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                                >
                                    {item.type === 'text' ? (
                                        <span 
                                            className="font-black text-4xl drop-shadow-lg whitespace-nowrap px-4 py-2 border-2 border-transparent hover:border-white/50 rounded-lg transition-colors"
                                            style={{ color: item.color }}
                                        >
                                            {item.content}
                                        </span>
                                    ) : (
                                        <span className="text-6xl drop-shadow-lg hover:scale-110 transition">{item.content}</span>
                                    )}
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeCanvasItem(item.id); }}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity scale-75"
                                    >
                                        <X size={12}/>
                                    </button>
                                </div>
                            ))}

                            {/* Product Tags Overlay */}
                            {taggedProducts.map((p, i) => (
                                <div key={p.id} className="absolute bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-in zoom-in z-30" style={{ top: `${20 + i*15}%`, left: '20%' }}>
                                    <ShoppingBag size={12} className="text-emerald-600"/>
                                    <span className="text-xs font-bold text-gray-900">{p.name}</span>
                                    <span className="text-xs font-bold text-emerald-600">${p.price}</span>
                                </div>
                            ))}

                            {mode === 'video' && (
                                <>
                                    <button 
                                        onClick={toggleVideoPlay}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover/canvas:opacity-100 transition hover:scale-110 z-30"
                                    >
                                        {isVideoPlaying ? <PauseCircle size={48} /> : <PlayCircle size={48} />}
                                    </button>

                                    {/* Video Tools Overlay */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover/canvas:opacity-100 transition z-30">
                                        <button onClick={handleGenerateCaptions} className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-black">
                                            {generatingCaptions ? <Loader2 className="animate-spin" size={14}/> : <Subtitles size={14}/>} 
                                            {generatingCaptions ? 'Generating...' : 'AI Captions'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                         /* Upload / AI Screen */
                         <div className="text-center">
                            <div 
                                className="w-96 h-64 bg-white rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition group mb-8"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 bg-gray-100 rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
                                    <Upload className="text-gray-400 group-hover:text-emerald-500" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & Drop Media</h3>
                                <p className="text-gray-400 text-sm">Images or Videos up to 50MB</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                            </div>

                            <div className="flex items-center gap-4 mb-8 w-full max-w-md mx-auto">
                                <div className="h-px bg-gray-300 flex-1"></div>
                                <span className="text-gray-400 font-bold text-sm">OR USE AI</span>
                                <div className="h-px bg-gray-300 flex-1"></div>
                            </div>

                            <div className="flex gap-2 max-w-md mx-auto">
                                <input 
                                    type="text" 
                                    placeholder="Describe what you want to see..." 
                                    className="flex-1 bg-white border border-gray-200 rounded-full px-6 py-3 outline-none focus:ring-2 ring-purple-500"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                />
                                <button 
                                    onClick={handleGenerate}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full hover:opacity-90 transition shadow-lg flex items-center gap-2"
                                >
                                    <Sparkles size={18} /> {isGenerating ? '...' : 'Generate'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: Meta & Publishing */}
                <div className="w-80 bg-white border-l border-gray-100 flex flex-col h-full z-20">
                    <div className="p-6 border-b border-gray-100">
                         <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
                            <button onClick={() => setMode('pin')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'pin' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Pin</button>
                            <button onClick={() => setMode('story')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'story' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Story</button>
                            <button onClick={() => setMode('video')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'video' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Video</button>
                         </div>
                         <input 
                            type="text" 
                            placeholder="Add a title" 
                            className="w-full text-2xl font-black border-none outline-none placeholder:text-gray-300"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                         />
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-8">
                        {/* Monetization Section */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <h3 className="font-black text-gray-900 flex items-center gap-2 mb-4 text-sm">
                                <DollarSign size={16} className="text-emerald-600"/> Monetization & Promo
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Promote Pin Option */}
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                                            <Megaphone size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Promote Pin</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsPromoted(!isPromoted)}
                                        className={`w-8 h-5 rounded-full transition-colors relative ${isPromoted ? 'bg-orange-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isPromoted ? 'left-4' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {mode === 'video' && (
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                <Play size={14} fill="currentColor" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">Enable Ads</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setAdsEnabled(!adsEnabled)}
                                            className={`w-8 h-5 rounded-full transition-colors relative ${adsEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${adsEnabled ? 'left-4' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-700">Tag Products</span>
                                        <button onClick={() => setShowProductPicker(!showProductPicker)} className="text-[10px] font-bold text-emerald-600 hover:underline">+ Add</button>
                                    </div>
                                    {showProductPicker && (
                                        <div className="bg-white p-2 rounded-xl border border-gray-200 mb-2 max-h-40 overflow-y-auto">
                                            {MOCK_PRODUCTS.map(p => (
                                                <div key={p.id} onClick={() => toggleProductTag(p)} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded-lg">
                                                    <img src={p.imageUrl} className="w-8 h-8 rounded-md bg-gray-100"/>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold">{p.name}</p>
                                                        <p className="text-xs text-gray-500">${p.price}</p>
                                                    </div>
                                                    {taggedProducts.find(tp => tp.id === p.id) && <Check size={14} className="text-emerald-600"/>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {taggedProducts.map(p => (
                                            <span key={p.id} className="text-[10px] font-bold bg-white border border-emerald-200 text-emerald-800 px-2 py-1 rounded-md flex items-center gap-1">
                                                <ShoppingBag size={10}/> {p.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                            <Lock size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Subscriber Only</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsExclusive(!isExclusive)}
                                        className={`w-8 h-5 rounded-full transition-colors relative ${isExclusive ? 'bg-purple-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isExclusive ? 'left-4' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <textarea 
                                placeholder="Write a description..." 
                                className="w-full bg-gray-50 rounded-xl p-4 resize-none h-24 outline-none focus:ring-2 focus:ring-emerald-100 transition text-sm font-medium"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            
                            <div className="flex gap-2 items-center border-b border-gray-100 pb-2">
                                <Tag size={16} className="text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Add tags..." 
                                    className="flex-1 outline-none text-sm font-medium"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && newTag && (setTags([...tags, newTag]), setNewTag(''))}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600 flex items-center gap-1">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex gap-4">
                        <button 
                            onClick={handlePublish}
                            disabled={!previewUrl || isPublishing}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                        >
                            {isPublishing ? <Loader2 className="animate-spin" size={18}/> : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
