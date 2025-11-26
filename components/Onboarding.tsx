
import React, { useState } from 'react';
import { Check, Sparkles, Zap, Globe } from 'lucide-react';

interface OnboardingProps {
    onComplete: (interests: string[]) => void;
}

const INTERESTS = [
    { id: 'design', label: 'Design', img: 'https://picsum.photos/seed/design/300/400' },
    { id: 'fashion', label: 'Fashion', img: 'https://picsum.photos/seed/fashion/300/300' },
    { id: 'travel', label: 'Travel', img: 'https://picsum.photos/seed/travel/300/500' },
    { id: 'food', label: 'Food', img: 'https://picsum.photos/seed/food/300/300' },
    { id: 'art', label: 'Art', img: 'https://picsum.photos/seed/art/300/400' },
    { id: 'tech', label: 'Tech', img: 'https://picsum.photos/seed/tech/300/300' },
    { id: 'decor', label: 'Decor', img: 'https://picsum.photos/seed/decor/300/400' },
    { id: 'photo', label: 'Photo', img: 'https://picsum.photos/seed/photo/300/300' },
    { id: 'diy', label: 'DIY', img: 'https://picsum.photos/seed/diy/300/500' },
    { id: 'beauty', label: 'Beauty', img: 'https://picsum.photos/seed/beauty/300/300' },
    { id: 'music', label: 'Music', img: 'https://picsum.photos/seed/music/300/400' },
    { id: 'cars', label: 'Cars', img: 'https://picsum.photos/seed/cars/300/300' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [isAutoSelecting, setIsAutoSelecting] = useState(false);

    const toggleInterest = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const runAiCurator = () => {
        setIsAutoSelecting(true);
        // Simulate "AI" selection
        let count = 0;
        const interval = setInterval(() => {
            const randomId = INTERESTS[Math.floor(Math.random() * INTERESTS.length)].id;
            if(!selected.includes(randomId)) {
                setSelected(prev => [...prev, randomId]);
            }
            count++;
            if(count > 4) {
                clearInterval(interval);
                setIsAutoSelecting(false);
            }
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
            <div className="text-center mb-8 max-w-2xl px-4 relative z-10">
                <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold mb-4 animate-in slide-in-from-top-4">
                    <Globe size={12} /> Global Feed Customization
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tighter">Define your aesthetic.</h1>
                <p className="text-gray-500 text-lg font-medium">Select 3+ topics to help our algorithm find your vibe.</p>
            </div>

            <div className="w-full max-w-[1400px] px-4 h-[60vh] overflow-y-auto pb-32 scrollbar-hide relative z-10">
                 <div className="columns-2 md:columns-4 gap-4 space-y-4">
                    {INTERESTS.map((interest, i) => {
                        const isSelected = selected.includes(interest.id);
                        return (
                            <div 
                                key={interest.id}
                                onClick={() => toggleInterest(interest.id)}
                                className={`relative rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 break-inside-avoid shadow-sm hover:shadow-xl ${isSelected ? 'ring-4 ring-black ring-offset-2 scale-95' : 'hover:scale-105'}`}
                            >
                                <img src={interest.img} className={`w-full object-cover transition-all duration-700 ${isSelected ? 'grayscale opacity-70' : 'group-hover:opacity-90'}`} />
                                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent opacity-100">
                                    <span className="text-white font-black text-xl drop-shadow-md tracking-tight">{interest.label}</span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-3 right-3 bg-black text-white p-2 rounded-full shadow-lg animate-in zoom-in duration-300">
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                 </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent flex justify-center items-center gap-4 z-20">
                <button 
                    onClick={runAiCurator}
                    disabled={isAutoSelecting}
                    className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 hover:text-purple-600 transition shadow-lg group relative"
                    title="AI Curator"
                >
                    <Sparkles size={24} className={`group-hover:animate-pulse ${isAutoSelecting ? 'animate-spin text-purple-600' : 'text-gray-600'}`}/>
                    <span className="absolute -top-10 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Auto-Pick Vibe</span>
                </button>

                <button 
                    disabled={selected.length < 3}
                    onClick={() => onComplete(selected)}
                    className="px-12 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-900 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <Zap size={20} className={selected.length >= 3 ? "fill-yellow-400 text-yellow-400" : ""} />
                    Start Discovering {selected.length > 0 && `(${selected.length})`}
                </button>
            </div>
        </div>
    );
};
