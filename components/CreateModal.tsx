
import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Video, Type, Sliders, DollarSign, Lock, Plus, Calendar, Clock, Crop, RotateCcw, AlertCircle, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { User, Board, Pin, Story, PinSlide, ImageEditSettings, VideoEditSettings, Product } from '../types';

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

export const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreatePin, onCreateStory, user, boards }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'edit'>('details');
  const [mode, setMode] = useState<'image' | 'video' | 'idea'>('image');
  
  // Asset State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  
  // Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Edit Settings
  const [editSettings, setEditSettings] = useState<ImageEditSettings>({
      brightness: 100, contrast: 100, saturation: 100, filter: 'none',
      rotation: 0, scale: 1, cropX: 0, cropY: 0, aspectRatio: 'default'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
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

  const handlePublish = () => {
      if (!previewUrl || linkError) return;

      const newPin: Pin = {
          id: `pin-${Date.now()}`,
          title: title || 'New Pin',
          description: description,
          imageUrl: previewUrl,
          type: mode,
          width: 600, 
          height: 900,
          tags: [],
          likes: 0,
          author: user,
          scheduledFor: scheduledDate || undefined,
          editSettings: editSettings
      };
      
      onCreatePin(newPin, selectedBoardId);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-[1200px] h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition"
            >
                <X size={24} />
            </button>

            {/* LEFT SIDE: PREVIEW / DROPZONE */}
            <div className="w-full md:w-[50%] bg-gray-100 relative flex flex-col items-center justify-center p-8 overflow-hidden">
                {!previewUrl ? (
                    <div 
                        className="w-full h-full border-4 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-200/50 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg mb-6">
                            <Upload size={32} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Drag and drop or click to upload</h3>
                        <p className="text-gray-500">Recommendation: Use high-quality .jpg files less than 20MB</p>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} accept="image/*,video/*" />
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center group">
                        <div 
                           className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-xl"
                           style={{
                               transform: `scale(${editSettings.scale}) rotate(${editSettings.rotation}deg)`,
                               filter: `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%)`
                           }}
                        >
                            {fileType === 'video' ? (
                                <video src={previewUrl} className="max-h-[80vh] object-contain" controls />
                            ) : (
                                <img src={previewUrl} className="max-h-[80vh] object-contain" />
                            )}
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
                        className={`pb-4 px-4 font-bold text-sm border-b-2 transition ${activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                    >
                        Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('edit')}
                        disabled={!previewUrl}
                        className={`pb-4 px-4 font-bold text-sm border-b-2 transition ${activeTab === 'edit' ? 'border-black text-black' : 'border-transparent text-gray-400 disabled:opacity-50'}`}
                    >
                        Edit
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                    <span className={`text-xs font-bold ${title.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>{title.length}/100</span>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Add a title" 
                                    className="w-full text-3xl font-black placeholder:text-gray-300 outline-none border-b border-gray-100 pb-2 focus:border-black transition"
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
                                    className="w-full bg-gray-50 rounded-xl p-4 font-medium outline-none h-32 resize-none focus:ring-2 ring-gray-200 transition"
                                    value={description}
                                    maxLength={500}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Destination Link</label>
                                <div className={`flex items-center bg-gray-50 rounded-xl px-4 py-3 border transition-colors ${linkError ? 'border-red-500 bg-red-50' : 'border-transparent focus-within:border-black focus-within:bg-white'}`}>
                                    <LinkIcon size={18} className={linkError ? "text-red-500" : "text-gray-400"} />
                                    <input 
                                        type="url" 
                                        placeholder="Add a destination link" 
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
                        </div>
                    )}

                    {activeTab === 'edit' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Crop size={18} /> Aspect Ratio
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {ASPECT_RATIOS.map(ratio => (
                                        <button 
                                            key={ratio.value}
                                            onClick={() => setEditSettings({...editSettings, aspectRatio: ratio.value})}
                                            className={`py-2 text-xs font-bold rounded-lg border-2 transition ${editSettings.aspectRatio === ratio.value ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            {ratio.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                            </div>

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
                        disabled={!previewUrl || !!linkError}
                        className="px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Publish
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
