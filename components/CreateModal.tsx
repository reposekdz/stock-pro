
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Video, Type, Sliders, DollarSign, Lock, Plus, Calendar, Clock, Crop, RotateCcw, AlertCircle, Link as LinkIcon, ChevronDown, Wand2, Scissors, Speaker, Play, Pause, Zap, Layout, Loader2, CheckCircle2, Palette } from 'lucide-react';
import { User, Board, Pin, Story, PinSlide, ImageEditSettings, VideoEditSettings, Product } from '../types';
import confetti from 'canvas-confetti';

interface CreateModalProps {
  onClose: () => void;
  onCreatePin: (pin: Pin, boardId?: string) => void;
  onCreateStory: (story: Story) => void;
  user: User;
  boards: Board[];
}

const ASPECT_RATIOS = [
    { label: 'Original', value: 'default' },
    { label: '2:3 (Standard)', value: '2:3' },
    { label: '1:1 (Square)', value: '1:1' },
    { label: '16:9 (Wide)', value: '16:9' },
];

const VIDEO_FILTERS = [
    { label: 'None', value: 'none', style: 'none' },
    { label: 'Vivid', value: 'vivid', style: 'saturate(150%) contrast(110%)' },
    { label: 'Noir', value: 'noir', style: 'grayscale(100%) contrast(120%)' },
    { label: 'Vintage', value: 'vintage', style: 'sepia(50%) contrast(90%) brightness(110%)' },
    { label: 'Cyber', value: 'cyber', style: 'hue-rotate(180deg) contrast(120%)' },
    { label: 'Soft', value: 'soft', style: 'brightness(110%) contrast(90%) saturate(80%)' },
    { label: 'Golden', value: 'golden', style: 'sepia(30%) contrast(110%) saturate(140%)' },
    { label: 'Chill', value: 'chill', style: 'brightness(110%) hue-rotate(-10deg) saturate(90%)' },
];

const IMAGE_FILTERS = [
    { label: 'Normal', value: 'none', style: 'none' },
    { label: 'B&W', value: 'bw', style: 'grayscale(100%)' },
    { label: 'Sepia', value: 'sepia', style: 'sepia(100%)' },
    { label: 'Vintage', value: 'vintage', style: 'sepia(0.5) contrast(1.2) brightness(0.9)' },
    { label: 'Warm', value: 'warm', style: 'sepia(0.3) saturate(1.4)' },
    { label: 'Cool', value: 'cool', style: 'hue-rotate(180deg) saturate(0.5)' },
    { label: 'Dramatic', value: 'dramatic', style: 'contrast(1.4) brightness(0.9)' },
    { label: 'Fade', value: 'fade', style: 'opacity(0.8) brightness(1.2)' },
];

export const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreatePin, onCreateStory, user, boards }) => {
  const [creationType, setCreationType] = useState<'pin' | 'story'>('pin');
  const [activeTab, setActiveTab] = useState<'details' | 'edit'>('details');
  const [mode, setMode] = useState<'image' | 'video' | 'idea'>('image');
  
  // Asset State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Powerful Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // Edit Settings
  const [editSettings, setEditSettings] = useState<ImageEditSettings>({
      brightness: 100, contrast: 100, saturation: 100, filter: 'none',
      rotation: 0, scale: 1, cropX: 0, cropY: 0, aspectRatio: 'default'
  });

  // Video Specific Settings
  const [videoSettings, setVideoSettings] = useState<VideoEditSettings>({
      trimStart: 0, trimEnd: 100, volume: 100, speed: 1, hasCaptions: false, filter: 'none'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
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
      // Simulate reading file metadata
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${sizeMB} MB`);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
      setMode(file.type.startsWith('video/') ? 'video' : 'image');
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLink(val);
      // Simple URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (val && !urlPattern.test(val)) {
          setLinkError('Please enter a valid URL');
      } else {
          setLinkError('');
      }
  };

  const handleAiAutoFill = () => {
      if (!previewUrl) return;
      setAiGenerating(true);
      
      // Simulate AI Analysis
      setTimeout(() => {
          const mockTitles = ["Summer Aesthetics", "Modern Workflow", "Cozy Corners", "Urban Exploration"];
          const mockDescs = [
              "Capturing the essence of the moment with vibrant colors and light.",
              "A minimalist approach to everyday design challenges.",
              "Finding beauty in the simple things.",
              "Exploring the intersection of nature and architecture."
          ];
          
          setTitle(mockTitles[Math.floor(Math.random() * mockTitles.length)]);
          setDescription(mockDescs[Math.floor(Math.random() * mockDescs.length)]);
          setAiGenerating(false);
          confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
      }, 1500);
  };

  const handlePublish = () => {
      if (!previewUrl) return;

      setIsUploading(true);
      setProcessingStatus('Uploading assets...');
      
      // Simulate Realistic Upload Progress
      let progress = 0;
      const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress > 100) progress = 100;
          setUploadProgress(Math.floor(progress));

          if (progress > 60 && progress < 80) {
              setProcessingStatus(mode === 'video' ? 'Transcoding video...' : 'Optimizing image...');
              setIsProcessing(true);
          }
          if (progress >= 100) {
              clearInterval(interval);
              setIsProcessing(false);
              setProcessingStatus('Finalizing...');
              
              setTimeout(() => {
                  completePublish();
              }, 800);
          }
      }, 300);
  };

  const completePublish = () => {
      if (creationType === 'story') {
          const newStory: Story = {
              id: `story-${Date.now()}`,
              user: user,
              imageUrl: previewUrl!,
              timestamp: 'Just now',
              viewed: false,
              videoUrl: mode === 'video' ? previewUrl! : undefined,
              duration: 15,
              isExclusive: false
          };
          onCreateStory(newStory);
      } else {
          const newPin: Pin = {
              id: `pin-${Date.now()}`,
              title: title || 'Untitled Pin',
              description: description,
              imageUrl: previewUrl!, 
              type: mode,
              width: 600, 
              height: 900,
              tags: [],
              likes: 0,
              author: user,
              scheduledFor: scheduledDate || undefined,
              editSettings: editSettings,
              videoSettings: mode === 'video' ? videoSettings : undefined,
              videoUrl: mode === 'video' ? previewUrl! : undefined
          };
          onCreatePin(newPin, selectedBoardId);
      }
      
      setUploadComplete(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      setTimeout(() => {
          onClose();
      }, 1500);
  };

  const getVideoFilterStyle = (filterValue: string) => {
      const filter = VIDEO_FILTERS.find(f => f.value === filterValue);
      return filter ? filter.style : 'none';
  };

  const getImageFilterStyle = (filterValue: string) => {
      const filter = IMAGE_FILTERS.find(f => f.value === filterValue);
      return filter ? filter.style : 'none';
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-[1200px] h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative">
            
            {/* Upload Overlay */}
            {(isUploading || uploadComplete) && (
                <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
                    {uploadComplete ? (
                        <div className="text-center animate-in zoom-in">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={48} className="text-green-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Published!</h2>
                            <p className="text-gray-500">Your content is now live.</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-md text-center">
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="60" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                                    <circle 
                                        cx="64" cy="64" r="60" stroke="#10b981" strokeWidth="8" fill="none" 
                                        strokeDasharray={377} 
                                        strokeDashoffset={377 - (377 * uploadProgress) / 100}
                                        className="transition-all duration-300 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-black text-gray-900">{uploadProgress}%</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{processingStatus}</h3>
                            <p className="text-sm text-gray-500">Do not close this window.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-white z-50 flex items-center justify-between px-6 border-b border-gray-100">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setCreationType('pin')}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition ${creationType === 'pin' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Create Pin
                    </button>
                    <button 
                        onClick={() => setCreationType('story')}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition ${creationType === 'story' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Create Story
                    </button>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-col md:flex-row h-full pt-16">
                {/* LEFT SIDE: PREVIEW / DROPZONE */}
                <div className="w-full md:w-[50%] bg-gray-100 relative flex flex-col items-center justify-center p-8 overflow-hidden">
                    {!previewUrl ? (
                        <div 
                            className={`w-full h-full border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[0.98]' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 transition-transform ${isDragging ? 'scale-125' : 'group-hover:scale-110'}`}>
                                <Upload size={32} className={`transition-colors ${isDragging ? 'text-emerald-600' : 'text-emerald-500'}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Drag and drop or click to upload</h3>
                            <p className="text-gray-500 mb-6 text-center max-w-xs">High-quality JPG, PNG, GIF or MP4 (up to 2GB)</p>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} accept="image/*,video/*" />
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center group">
                            <div 
                            className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5"
                            style={{
                                transform: `scale(${editSettings.scale}) rotate(${editSettings.rotation}deg)`,
                                filter: mode === 'video' 
                                    ? 'none' 
                                    : `${getImageFilterStyle(editSettings.filter)} brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%)`
                            }}
                            >
                                {fileType === 'video' ? (
                                    <video 
                                        ref={videoRef}
                                        src={previewUrl} 
                                        className="max-h-[80vh] object-contain bg-black" 
                                        controls 
                                        autoPlay 
                                        loop 
                                        muted
                                        style={{
                                            filter: getVideoFilterStyle(videoSettings.filter || 'none')
                                        }}
                                    />
                                ) : (
                                    <img src={previewUrl} className="max-h-[80vh] object-contain" />
                                )}
                            </div>
                            
                            {/* Metadata Badge */}
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold">
                                {fileType === 'video' ? 'VIDEO' : 'IMAGE'} • {fileSize}
                            </div>
                            
                            {/* Crop Overlay (Mock) */}
                            {activeTab === 'edit' && (
                                <div className="absolute inset-0 pointer-events-none border-2 border-white/50 flex items-center justify-center">
                                    <div className="text-white bg-black/50 px-3 py-1 rounded-full text-xs font-bold backdrop-blur">
                                        {ASPECT_RATIOS.find(r => r.value === editSettings.aspectRatio)?.label}
                                    </div>
                                </div>
                            )}
                            
                            <button 
                                onClick={() => { setPreviewUrl(null); setFileType(null); }}
                                className="absolute top-4 left-4 p-3 bg-white/90 rounded-full shadow-md text-red-500 hover:bg-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: TOOLS & FORM */}
                <div className="w-full md:w-[50%] bg-white flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 px-6 pt-4">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`pb-4 px-4 font-bold text-sm border-b-2 transition ${activeTab === 'details' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}
                        >
                            Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('edit')}
                            disabled={!previewUrl}
                            className={`pb-4 px-4 font-bold text-sm border-b-2 transition ${activeTab === 'edit' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 disabled:opacity-50'}`}
                        >
                            Edit
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                {creationType === 'story' ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Zap size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Story Mode</h3>
                                        <p className="text-gray-500 max-w-xs mx-auto">Stories are ephemeral and disappear after 24 hours. They don't require titles or boards.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* AI Auto-Fill Button */}
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={handleAiAutoFill}
                                                disabled={!previewUrl || aiGenerating}
                                                className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition disabled:opacity-50"
                                            >
                                                {aiGenerating ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>}
                                                {aiGenerating ? 'Analyzing...' : 'Auto-Fill Details'}
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                                <span className={`text-xs font-bold ${title.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>{title.length}/100</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Add a title" 
                                                className="w-full text-3xl font-black placeholder:text-gray-300 outline-none border-b border-gray-100 pb-2 focus:border-emerald-500 transition"
                                                value={title}
                                                maxLength={100}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                                <span className={`text-xs font-bold ${description.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>{description.length}/500</span>
                                            </div>
                                            <textarea 
                                                placeholder="Tell everyone what your Pin is about" 
                                                className="w-full bg-gray-50 rounded-xl p-4 font-medium outline-none h-32 resize-none focus:ring-2 ring-emerald-100 transition"
                                                value={description}
                                                maxLength={500}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Destination Link</label>
                                            <div className={`flex items-center bg-gray-50 rounded-xl px-4 py-3 border transition-colors ${linkError ? 'border-red-500 bg-red-50' : 'border-transparent focus-within:border-emerald-500 focus-within:bg-white'}`}>
                                                <LinkIcon size={18} className={linkError ? "text-red-500" : "text-gray-400"} />
                                                <input 
                                                    type="url" 
                                                    placeholder="Add a destination link (e.g. your-site.com)" 
                                                    className="flex-1 bg-transparent ml-3 font-medium outline-none"
                                                    value={link}
                                                    onChange={handleLinkChange}
                                                />
                                            </div>
                                            {linkError && <p className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {linkError}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Board</label>
                                                <div className="relative">
                                                    <select 
                                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-gray-100"
                                                        value={selectedBoardId}
                                                        onChange={(e) => setSelectedBoardId(e.target.value)}
                                                    >
                                                        {boards.map(b => (
                                                            <option key={b.id} value={b.id}>{b.title} {b.isPrivate && '🔒'}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={16} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Schedule</label>
                                                <div className="relative">
                                                    <input 
                                                        type="datetime-local" 
                                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer"
                                                        value={scheduledDate}
                                                        onChange={(e) => setScheduledDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'edit' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4">
                                
                                {mode === 'video' ? (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Wand2 size={18} /> Video Filters
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {VIDEO_FILTERS.map(filter => (
                                                <div 
                                                    key={filter.value}
                                                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition relative aspect-video ${videoSettings.filter === filter.value ? 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-2' : 'border-transparent hover:border-gray-200'}`}
                                                    onClick={() => setVideoSettings({...videoSettings, filter: filter.value})}
                                                >
                                                    <div 
                                                        className="w-full h-full bg-gray-200"
                                                        style={{ 
                                                            backgroundImage: `url(${previewUrl})`, 
                                                            backgroundSize: 'cover',
                                                            filter: filter.style 
                                                        }}
                                                    ></div>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-xs backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity">
                                                        {filter.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Palette size={18} /> Image Filters
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {IMAGE_FILTERS.map(filter => (
                                                <div 
                                                    key={filter.value}
                                                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition relative aspect-square ${editSettings.filter === filter.value ? 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-2' : 'border-transparent hover:border-gray-200'}`}
                                                    onClick={() => setEditSettings({...editSettings, filter: filter.value})}
                                                >
                                                    <div 
                                                        className="w-full h-full bg-gray-200 transition-all duration-300"
                                                        style={{ 
                                                            backgroundImage: `url(${previewUrl})`, 
                                                            backgroundSize: 'cover',
                                                            filter: filter.style 
                                                        }}
                                                    ></div>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-xs backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity">
                                                        {filter.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Crop size={18} /> Aspect Ratio
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {ASPECT_RATIOS.map(ratio => (
                                            <button 
                                                key={ratio.value}
                                                onClick={() => setEditSettings({...editSettings, aspectRatio: ratio.value})}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition ${editSettings.aspectRatio === ratio.value ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                                            >
                                                {ratio.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {mode === 'image' && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Sliders size={18} /> Adjust Image
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                                    <span>Brightness</span>
                                                    <span>{editSettings.brightness}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="50" max="150" 
                                                    value={editSettings.brightness} 
                                                    onChange={(e) => setEditSettings({...editSettings, brightness: parseInt(e.target.value)})}
                                                    className="w-full accent-emerald-500 h-1"
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
                                                    className="w-full accent-emerald-500 h-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mode === 'video' && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Speaker size={18} /> Audio & Speed
                                        </h3>
                                         <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                                    <span>Volume</span>
                                                    <span>{videoSettings.volume}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="100" 
                                                    value={videoSettings.volume} 
                                                    onChange={(e) => setVideoSettings({...videoSettings, volume: parseInt(e.target.value)})}
                                                    className="w-full accent-emerald-500 h-1"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                                    <span>Speed</span>
                                                    <span>{videoSettings.speed}x</span>
                                                </div>
                                                <input 
                                                    type="range" min="0.5" max="2" step="0.5"
                                                    value={videoSettings.speed} 
                                                    onChange={(e) => setVideoSettings({...videoSettings, speed: parseFloat(e.target.value)})}
                                                    className="w-full accent-emerald-500 h-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setEditSettings({...editSettings, rotation: (editSettings.rotation + 90) % 360})}
                                    className="w-full py-3 bg-gray-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                                >
                                    <RotateCcw size={18} /> Rotate 90°
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                        <button 
                            onClick={handlePublish}
                            disabled={!previewUrl || (creationType === 'pin' && !!linkError)}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {creationType === 'story' ? 'Share Story' : 'Publish Pin'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
