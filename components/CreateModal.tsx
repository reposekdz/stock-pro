
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Video, Type, Music, Sliders, DollarSign, Globe, Lock, Plus, Trash2, Play, Pause, Crop, RotateCcw, Wand2, Mic, MicOff, Tag, ChevronRight, ChevronLeft, ShoppingBag, Palette, Layers, Sparkles, Check, MonitorPlay, FastForward, Volume2, Search, Briefcase } from 'lucide-react';
import { User, Board, Pin, Story, PinSlide, ImageEditSettings, VideoEditSettings, Product } from '../types';

interface CreateModalProps {
  onClose: () => void;
  onCreatePin: (pin: Pin, boardId?: string) => void;
  onCreateStory: (story: Story) => void;
  user: User;
  boards: Board[];
}

const FILTERS = [
    { name: 'None', class: '' },
    { name: 'Vivid', class: 'contrast-125 saturate-150' },
    { name: 'Muted', class: 'contrast-75 saturate-50' },
    { name: 'B&W', class: 'grayscale' },
    { name: 'Warm', class: 'sepia-[.5]' },
    { name: 'Cool', class: 'hue-rotate-15' },
];

const MOCK_PRODUCTS: Product[] = [
    { id: 'mp1', name: 'Velvet Sofa', price: 899, currency: '$', imageUrl: 'https://picsum.photos/seed/sofa/100/100', affiliateLink: '#' },
    { id: 'mp2', name: 'Marble Table', price: 450, currency: '$', imageUrl: 'https://picsum.photos/seed/table/100/100', affiliateLink: '#' },
    { id: 'mp3', name: 'Gold Lamp', price: 120, currency: '$', imageUrl: 'https://picsum.photos/seed/lamp/100/100', affiliateLink: '#' },
];

export const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreatePin, onCreateStory, user, boards }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'edit' | 'monetization'>('details');
  const [mode, setMode] = useState<'image' | 'video' | 'idea' | 'story'>('image');
  
  // Asset State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [slides, setSlides] = useState<PinSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');

  // UI State
  const [isDragging, setIsDragging] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Edit Settings (Image)
  const [editSettings, setEditSettings] = useState<ImageEditSettings>({
      brightness: 100, contrast: 100, saturation: 100, filter: 'none',
      rotation: 0, scale: 1, cropX: 0, cropY: 0, aspectRatio: 'default'
  });

  // Edit Settings (Video)
  const [videoSettings, setVideoSettings] = useState<VideoEditSettings>({
      trimStart: 0, trimEnd: 100, volume: 100, speed: 1, hasCaptions: false
  });

  // Monetization
  const [isExclusive, setIsExclusive] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [isPromoted, setIsPromoted] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [taggedProducts, setTaggedProducts] = useState<Product[]>([]);
  const [productQuery, setProductQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Handlers ---

  const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
      }
  };

  const handleFile = (file: File) => {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      if (file.type.startsWith('video/')) {
          setFileType('video');
          setMode('video');
      } else {
          setFileType('image');
          setMode('image');
      }

      // Auto-analyze (Simulated AI)
      handleAiAnalyze();
  };

  const handleAiAnalyze = () => {
      setAiAnalyzing(true);
      setTimeout(() => {
          setTitle("Modern Aesthetic Vibes");
          setTags(['design', 'modern', 'aesthetic', 'trending']);
          setAiAnalyzing(false);
      }, 1500);
  };

  const handleVoiceDescription = () => {
      setIsRecording(true);
      setTimeout(() => {
          setDescription("This is a voice-generated description of the content. It captures the mood and style perfectly.");
          setIsRecording(false);
      }, 2000);
  };

  const handleAddSlide = () => {
      if (!previewUrl) return;
      const newSlide: PinSlide = {
          id: `slide-${Date.now()}`,
          type: fileType || 'image',
          url: previewUrl,
          description: description
      };
      setSlides([...slides, newSlide]);
      setPreviewUrl(null); // Clear for next slide
      setFileType(null);
      setTitle('');
      setDescription('');
  };

  const handlePublish = () => {
      if (!previewUrl && slides.length === 0) return;

      setIsPublishing(true);
      
      setTimeout(() => {
          if (mode === 'story') {
              const newStory: Story = {
                  id: `story-${Date.now()}`,
                  user: user,
                  imageUrl: previewUrl || slides[0]?.url, 
                  timestamp: 'Just now',
                  viewed: false,
                  products: taggedProducts,
                  isExclusive: isExclusive
              };
              onCreateStory(newStory);
          } else {
              // Pin Creation
              const finalSlides = slides.length > 0 ? slides : (previewUrl ? [{
                  id: 's1', type: fileType || 'image', url: previewUrl
              }] : []);

              // Logic to determine type if it was image mode but user added slides -> idea
              const finalType = slides.length > 0 ? 'idea' : (mode === 'video' ? 'video' : 'image');

              const newPin: Pin = {
                  id: `pin-${Date.now()}`,
                  title: title || 'New Creation',
                  description: description || 'Created with Stoc Pro Studio',
                  imageUrl: previewUrl || slides[0]?.url,
                  videoUrl: mode === 'video' ? previewUrl || undefined : undefined,
                  type: finalType,
                  slides: finalSlides,
                  width: 600,
                  height: 900,
                  tags: tags.length > 0 ? tags : ['creative'],
                  likes: 0,
                  author: user,
                  location: location,
                  editSettings: { ...editSettings },
                  videoSettings: mode === 'video' ? { ...videoSettings } : undefined,
                  taggedProducts: taggedProducts,
                  isExclusive: isExclusive,
                  monetization: {
                      adsEnabled: adsEnabled,
                      isSubscriberOnly: isExclusive,
                      isPromoted: isPromoted,
                      sponsorName: isPromoted ? (sponsorName || 'Sponsored') : undefined
                  }
              };
              onCreatePin(newPin, selectedBoardId);
          }
          setIsPublishing(false);
          onClose();
      }, 1200);
  };

  const toggleTagProduct = (product: Product) => {
      if (taggedProducts.find(p => p.id === product.id)) {
          setTaggedProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
          setTaggedProducts(prev => [...prev, product]);
      }
  };

  // --- Render Helpers ---

  const renderEditor = () => {
      if (mode === 'video' || fileType === 'video') {
          return (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MonitorPlay size={18} /> Timeline & Trim
                      </h3>
                      <div className="h-12 bg-gray-100 rounded-lg relative overflow-hidden mb-2">
                          <div className="absolute inset-y-0 bg-emerald-500/20" style={{ left: `${videoSettings.trimStart}%`, right: `${100 - videoSettings.trimEnd}%` }}></div>
                          <div className="absolute top-0 bottom-0 w-1 bg-black cursor-ew-resize" style={{ left: `${videoSettings.trimStart}%` }}></div>
                          <div className="absolute top-0 bottom-0 w-1 bg-black cursor-ew-resize" style={{ left: `${videoSettings.trimEnd}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400">
                          <span>0:00</span>
                          <span>0:15</span>
                          <span>0:30</span>
                      </div>
                  </div>

                  <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FastForward size={18} /> Speed: {videoSettings.speed}x
                      </h3>
                      <input 
                          type="range" min="0.5" max="2" step="0.1" 
                          value={videoSettings.speed} 
                          onChange={(e) => setVideoSettings({...videoSettings, speed: parseFloat(e.target.value)})}
                          className="w-full accent-black"
                      />
                  </div>

                  <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Volume2 size={18} /> Volume: {videoSettings.volume}%
                      </h3>
                      <input 
                          type="range" min="0" max="100" 
                          value={videoSettings.volume} 
                          onChange={(e) => setVideoSettings({...videoSettings, volume: parseInt(e.target.value)})}
                          className="w-full accent-black"
                      />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-bold text-sm">Auto-Captions (AI)</span>
                      <button 
                          onClick={() => setVideoSettings({...videoSettings, hasCaptions: !videoSettings.hasCaptions})}
                          className={`w-12 h-6 rounded-full relative transition-colors ${videoSettings.hasCaptions ? 'bg-black' : 'bg-gray-300'}`}
                      >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${videoSettings.hasCaptions ? 'left-7' : 'left-1'}`}></div>
                      </button>
                  </div>
              </div>
          );
      }

      return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
              {/* Filters */}
              <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Palette size={18} /> Filters
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {FILTERS.map(f => (
                          <div 
                            key={f.name}
                            onClick={() => setEditSettings({...editSettings, filter: f.name})}
                            className={`flex-shrink-0 cursor-pointer text-center group`}
                          >
                              <div className={`w-16 h-16 rounded-lg bg-gray-200 mb-1 overflow-hidden border-2 transition ${editSettings.filter === f.name ? 'border-emerald-500' : 'border-transparent group-hover:border-gray-300'}`}>
                                  {previewUrl && <img src={previewUrl} className={`w-full h-full object-cover ${f.class}`} />}
                              </div>
                              <span className="text-xs font-medium text-gray-500">{f.name}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Adjustments */}
              <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Sliders size={18} /> Adjustments
                  </h3>
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                          <span>Brightness</span>
                          <span>{editSettings.brightness}%</span>
                      </div>
                      <input 
                          type="range" min="50" max="150" 
                          value={editSettings.brightness} 
                          onChange={(e) => setEditSettings({...editSettings, brightness: parseInt(e.target.value)})}
                          className="w-full accent-black h-1"
                      />
                  </div>
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                          <span>Contrast</span>
                          <span>{editSettings.contrast}%</span>
                      </div>
                      <input 
                          type="range" min="50" max="150" 
                          value={editSettings.contrast} 
                          onChange={(e) => setEditSettings({...editSettings, contrast: parseInt(e.target.value)})}
                          className="w-full accent-black h-1"
                      />
                  </div>
              </div>

              {/* Transform */}
              <div className="grid grid-cols-2 gap-4">
                   <button 
                      onClick={() => setEditSettings({...editSettings, rotation: (editSettings.rotation + 90) % 360})}
                      className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
                   >
                       <RotateCcw size={16} /> Rotate
                   </button>
                   <button 
                      className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
                   >
                       <Crop size={16} /> Crop
                   </button>
              </div>

              <button 
                  onClick={() => {
                      setEditSettings({ ...editSettings, brightness: 110, contrast: 110, saturation: 120 });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                  <Wand2 size={18} /> AI Magic Enhance
              </button>
          </div>
      );
  };

  const renderMonetization = () => (
      <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-purple-700 font-bold">
                      <Lock size={18} /> Subscriber Exclusive
                  </div>
                  <div 
                      onClick={() => setIsExclusive(!isExclusive)}
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${isExclusive ? 'bg-purple-600' : 'bg-gray-300'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isExclusive ? 'left-7' : 'left-1'}`}></div>
                  </div>
              </div>
              <p className="text-xs text-purple-600/80">
                  Only your paid subscribers will be able to view this pin.
              </p>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-orange-700 font-bold">
                      <Briefcase size={18} /> Paid Partnership
                  </div>
                  <div 
                      onClick={() => setIsPromoted(!isPromoted)}
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${isPromoted ? 'bg-orange-600' : 'bg-gray-300'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPromoted ? 'left-7' : 'left-1'}`}></div>
                  </div>
              </div>
              {isPromoted && (
                  <input 
                      type="text" 
                      placeholder="Brand Name" 
                      className="w-full mt-2 p-2 bg-white border border-orange-200 rounded-lg text-sm font-bold outline-none"
                      value={sponsorName}
                      onChange={e => setSponsorName(e.target.value)}
                  />
              )}
          </div>

          <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBag size={18} /> Tag Products
              </h3>
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                      type="text" 
                      placeholder="Search your catalog..." 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm font-bold outline-none"
                      value={productQuery}
                      onChange={e => setProductQuery(e.target.value)}
                  />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                  {MOCK_PRODUCTS.map(p => {
                      const isTagged = taggedProducts.find(tp => tp.id === p.id);
                      return (
                          <div 
                              key={p.id} 
                              onClick={() => toggleTagProduct(p)}
                              className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition ${isTagged ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:bg-gray-50'}`}
                          >
                              <img src={p.imageUrl} className="w-10 h-10 rounded-lg bg-gray-200" />
                              <div className="flex-1">
                                  <p className="font-bold text-sm">{p.name}</p>
                                  <p className="text-xs text-gray-500">{p.currency}{p.price}</p>
                              </div>
                              {isTagged && <Check size={16} className="text-emerald-600"/>}
                          </div>
                      )
                  })}
              </div>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-[1400px] h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-3 bg-black/10 hover:bg-black/20 backdrop-blur rounded-full text-black transition"
            >
                <X size={24} />
            </button>

            {/* LEFT SIDE: CANVAS / PREVIEW */}
            <div className="w-full md:w-[60%] bg-gray-100 relative flex flex-col items-center justify-center p-8 overflow-hidden">
                
                {/* Drag Drop Zone */}
                {!previewUrl && slides.length === 0 && (
                    <div 
                        className={`w-full max-w-lg aspect-[3/4] rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-all duration-300
                            ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-105' : 'border-gray-300 hover:border-gray-400'}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragEnter}
                        onDrop={handleDrop}
                    >
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 animate-bounce">
                            <Upload size={32} className="text-gray-900" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Drag and drop</h3>
                        <p className="text-gray-500 font-medium mb-8">Images, Videos, or Files</p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-8 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition"
                        >
                            Browse Files
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} accept="image/*,video/*" />
                    </div>
                )}

                {/* Preview Area */}
                {(previewUrl || slides.length > 0) && (
                    <div className="relative w-full h-full flex items-center justify-center">
                         {/* Asset */}
                         <div 
                            className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
                            style={{
                                transform: mode === 'image' ? `scale(${editSettings.scale}) rotate(${editSettings.rotation}deg)` : 'none',
                                filter: mode === 'image' ? `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) saturate(${editSettings.saturation}%)` : 'none',
                            }}
                         >
                             {fileType === 'video' || (slides[currentSlideIndex]?.type === 'video') ? (
                                 <video 
                                    ref={videoRef}
                                    src={previewUrl || slides[currentSlideIndex]?.url} 
                                    className={`max-h-[80vh] object-contain ${editSettings.filter}`}
                                    controls 
                                    autoPlay 
                                    loop 
                                 />
                             ) : (
                                 <img 
                                    src={previewUrl || slides[currentSlideIndex]?.url} 
                                    className={`max-h-[80vh] object-contain ${FILTERS.find(f => f.name === editSettings.filter)?.class}`} 
                                 />
                             )}
                             
                             {/* AI Scanning Overlay */}
                             {aiAnalyzing && (
                                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                                     <Sparkles size={48} className="animate-spin mb-4 text-emerald-400" />
                                     <p className="font-bold tracking-widest uppercase animate-pulse">Analyzing Visuals...</p>
                                 </div>
                             )}
                         </div>

                         {/* Idea Pin Navigation */}
                         {slides.length > 0 && (
                             <div className="absolute bottom-8 flex gap-2">
                                 {slides.map((_, i) => (
                                     <button 
                                        key={i} 
                                        onClick={() => { setCurrentSlideIndex(i); setPreviewUrl(null); }}
                                        className={`w-3 h-3 rounded-full transition-all ${currentSlideIndex === i ? 'bg-black w-8' : 'bg-gray-400'}`}
                                     />
                                 ))}
                                 <button 
                                    onClick={() => { setPreviewUrl(null); setFileType(null); }}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100"
                                    title="Add Slide"
                                 >
                                     <Plus size={16} />
                                 </button>
                             </div>
                         )}
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: TOOLS & FORM */}
            <div className="w-full md:w-[40%] bg-white flex flex-col border-l border-gray-100">
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'details' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Type size={16} /> Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('edit')}
                        disabled={!previewUrl && slides.length === 0}
                        className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'edit' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-gray-600 disabled:opacity-30'}`}
                    >
                        <Sliders size={16} /> Editor
                    </button>
                    <button 
                        onClick={() => setActiveTab('monetization')}
                        className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'monetization' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <DollarSign size={16} /> Earn
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            {/* Mode Selector */}
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                                {['image', 'video', 'idea', 'story'].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setMode(m as any)}
                                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition ${mode === m ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Title</label>
                                <input 
                                    type="text" 
                                    placeholder="Add a title" 
                                    className="w-full text-2xl font-black placeholder:text-gray-300 outline-none border-b border-gray-100 pb-2 focus:border-black transition"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
                                    <button 
                                        onClick={handleVoiceDescription}
                                        className={`text-xs font-bold flex items-center gap-1 ${isRecording ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`}
                                    >
                                        {isRecording ? <MicOff size={12}/> : <Mic size={12}/>} 
                                        {isRecording ? 'Recording...' : 'Voice Input'}
                                    </button>
                                </div>
                                <textarea 
                                    placeholder="Tell everyone what your Pin is about" 
                                    className="w-full bg-gray-50 rounded-xl p-4 font-medium outline-none h-32 resize-none focus:ring-2 ring-gray-200 transition"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                {aiAnalyzing && (
                                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                        <div className="bg-white shadow-lg rounded-full px-4 py-1 text-xs font-bold flex items-center gap-2">
                                            <Sparkles size={12} className="text-purple-500 animate-spin"/> AI Generating...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map(t => (
                                        <span key={t} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            #{t} <button onClick={() => setTags(tags.filter(tag => tag !== t))}><X size={10}/></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Add tags..." 
                                        className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && tagInput) {
                                                setTags([...tags, tagInput]);
                                                setTagInput('');
                                            }
                                        }}
                                    />
                                    <button onClick={handleAiAnalyze} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-md hover:bg-purple-200 transition">
                                        Auto-Tag
                                    </button>
                                </div>
                            </div>
                            
                            {/* Board Selector */}
                            {mode !== 'story' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Board</label>
                                    <select 
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer hover:bg-gray-100 transition"
                                        value={selectedBoardId}
                                        onChange={(e) => setSelectedBoardId(e.target.value)}
                                    >
                                        {boards.map(b => (
                                            <option key={b.id} value={b.id}>{b.title} {b.isPrivate && '(Private)'}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {mode === 'idea' && (
                                <button 
                                    onClick={handleAddSlide}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl font-bold text-gray-500 hover:border-black hover:text-black transition flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Add Next Page
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'edit' && renderEditor()}
                    
                    {activeTab === 'monetization' && renderMonetization()}

                </div>

                <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white sticky bottom-0 z-10">
                    <button className="text-gray-400 font-bold text-sm hover:text-red-500 transition">Discard</button>
                    <button 
                        onClick={handlePublish}
                        disabled={(!previewUrl && slides.length === 0) || isPublishing}
                        className="px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPublishing ? (
                            <>Publishing...</>
                        ) : (
                            <>Publish</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
