
import React, { useState, useEffect } from 'react';
import { X, Search, ScanLine, ArrowRight, Crop } from 'lucide-react';
import { Pin } from '../types';
import { PinCard } from './PinCard';

interface VisualSearchModalProps {
    pin: Pin;
    onClose: () => void;
    onResultClick: (pin: Pin) => void;
    boards: any[]; // For saving results
}

export const VisualSearchModal: React.FC<VisualSearchModalProps> = ({ pin, onClose, onResultClick, boards }) => {
    const [isScanning, setIsScanning] = useState(true);
    const [results, setResults] = useState<Pin[]>([]);

    useEffect(() => {
        // Simulate scanning delay
        setTimeout(() => {
            setIsScanning(false);
            // Generate mock results based on the pin
            const mockResults: Pin[] = Array.from({ length: 12 }).map((_, i) => ({
                id: `vs-${i}`,
                title: `Similar to ${pin.title}`,
                description: 'Visually similar result',
                imageUrl: `https://picsum.photos/seed/${pin.id}-${i}/300/${300 + Math.floor(Math.random() * 200)}`,
                type: 'image',
                width: 300,
                height: 300 + Math.floor(Math.random() * 200),
                tags: pin.tags,
                likes: Math.floor(Math.random() * 500),
                author: pin.author
            }));
            setResults(mockResults);
        }, 2000);
    }, [pin]);

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col md:flex-row animate-in fade-in duration-300">
            {/* Left Side: Source Image & Scanner */}
            <div className="w-full md:w-[40%] bg-black relative flex items-center justify-center overflow-hidden">
                <button 
                    onClick={onClose}
                    className="absolute top-6 left-6 z-50 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition"
                >
                    <X size={24} />
                </button>

                <div className="relative w-full h-[50vh] md:h-full">
                    <img 
                        src={pin.imageUrl} 
                        className="w-full h-full object-cover opacity-60" 
                        alt="Source" 
                    />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 border-2 border-white/50 rounded-3xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                            
                            {/* Scanning Image Source (Clear) */}
                            <img 
                                src={pin.imageUrl} 
                                className="absolute inset-0 w-full h-full object-cover" 
                                style={{ 
                                    width: '100vw', 
                                    height: '100vh', 
                                    maxWidth: 'none', 
                                    maxHeight: 'none',
                                    marginTop: 'calc(-50vh + 50%)', // Center alignment hack matching container
                                    marginLeft: 'calc(-50vw + 50%)' 
                                }}
                            />

                            {/* Scanning Beam */}
                            {isScanning && (
                                <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                            )}

                            {/* Crop Tool Hint */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-2">
                                <Crop size={14} /> Drag to adjust crop
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Results */}
            <div className="w-full md:w-[60%] bg-white flex flex-col h-[50vh] md:h-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <ScanLine className="text-emerald-600"/> Visual Results
                    </h2>
                    {isScanning && <span className="text-sm font-bold text-gray-400 animate-pulse">Analyzing image...</span>}
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
                    <div className="masonry-grid">
                        {isScanning ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="mb-4 break-inside-avoid">
                                    <div className="w-full bg-gray-100 rounded-2xl animate-pulse" style={{ height: `${Math.random() * 200 + 200}px` }}></div>
                                </div>
                            ))
                        ) : (
                            results.map(res => (
                                <PinCard 
                                    key={res.id}
                                    pin={res}
                                    onClick={onResultClick}
                                    onSave={() => {}}
                                    onMoreLikeThis={() => {}} // Recursion handled by parent logic if needed
                                    onStash={() => {}}
                                    onTagClick={() => {}}
                                    boards={boards}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};
